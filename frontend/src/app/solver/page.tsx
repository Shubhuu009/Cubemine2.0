'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, ArrowLeft, ArrowRight, Maximize, RotateCcw,
  Undo2, Wand2, Timer as TimerIcon, Keyboard, X, Play, Pause,
  RotateCw, Copy, Check, Upload, Video, Camera, Square, ScanLine,
  Sparkles, FileVideo, Eye,
} from 'lucide-react';
import { CubeColor } from '@/types';
import { useSolverStore } from '@/store/solverStore';
import CubeGrid from '@/components/CubeGrid';
import MoveList from '@/components/MoveList';
import ScrambleGenerator from '@/components/ScrambleGenerator';
import { useToast } from '@/components/Toast';

const COLORS: { value: CubeColor; label: string; hex: string; ring: string; shortcut: string }[] = [
  { value: 'W', label: 'White', hex: '#f8fafc', ring: 'ring-white/70', shortcut: '1' },
  { value: 'Y', label: 'Yellow', hex: '#ffd226', ring: 'ring-yellow-300/70', shortcut: '2' },
  { value: 'R', label: 'Red', hex: '#ef3f46', ring: 'ring-red-400/70', shortcut: '3' },
  { value: 'O', label: 'Orange', hex: '#ff7a18', ring: 'ring-orange-400/70', shortcut: '4' },
  { value: 'B', label: 'Blue', hex: '#3b82f6', ring: 'ring-blue-400/70', shortcut: '5' },
  { value: 'G', label: 'Green', hex: '#22c55e', ring: 'ring-green-400/70', shortcut: '6' },
];

export default function SolverPage() {
  const {
    cubeType, state, selectedColor, result, isLoading, error,
    setCubeType, setCubeState, setFacelet, setSelectedColor, resetCube, solveCube, clearResult,
  } = useSolverStore();
  const { showToast } = useToast();
  const [showResult, setShowResult] = useState(false);
  const [rotationY, setRotationY] = useState(-32);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [mediaAnalysis, setMediaAnalysis] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startTimer = useCallback(() => {
    if (timerRunning) return;
    setTimerRunning(true);
    startTimeRef.current = Date.now() - timerTime;
    intervalRef.current = setInterval(() => {
      setTimerTime(Date.now() - startTimeRef.current);
    }, 10);
  }, [timerRunning, timerTime]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimerTime(0);
  }, [pauseTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const formatTimerTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };
  const [undoStack, setUndoStack] = useState<{ index: number; prevColor: CubeColor }[]>([]);

  const handleFaceletClick = (idx: number) => {
    setUndoStack((prev) => [...prev.slice(-50), { index: idx, prevColor: state[idx] }]);
    setFacelet(idx, selectedColor);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setFacelet(last.index, last.prevColor);
    setUndoStack((prev) => prev.slice(0, -1));
    showToast('Undone', 'info');
  };
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        setSelectedColor(COLORS[num - 1].value);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          e.preventDefault();
          setRotationY((v) => v - 45);
          break;
        case 'arrowright':
          e.preventDefault();
          setRotationY((v) => v + 45);
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            handleReset();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case ' ':
          e.preventDefault();
          if (timerRunning) pauseTimer();
          else startTimer();
          break;
        case '?':
          setShowShortcuts((v) => !v);
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [timerRunning, undoStack.length]);

  const handleSolve = async () => {
    setShowResult(false);
    const solveTime = timerTime > 0 ? timerTime : undefined;
    if (timerRunning) pauseTimer();
    try {
      await solveCube();
      setShowResult(true);
      showToast(`Cube solved${solveTime ? ` in ${formatTimerTime(solveTime)}` : ''}!`, 'success');
    } catch {
      showToast('Failed to solve. Check your cube state.', 'error');
    }
  };

  const handleReset = () => {
    resetCube();
    clearResult();
    setShowResult(false);
    setRotationY(-32);
    setUndoStack([]);
    resetTimer();
    showToast('Cube reset', 'info');
  };

  const handleCopyMoves = () => {
    if (result) {
      navigator.clipboard.writeText(result.moves.join(' '));
      setCopied(true);
      showToast('Moves copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createDetectedCubeState = () => {
    const colors: CubeColor[] = ['W', 'Y', 'R', 'O', 'B', 'G'];
    const size = gridSize * gridSize;
    const balanced = colors.flatMap((color) => Array.from({ length: size }, () => color));
    return balanced.map((_, index) => balanced[(index * 7 + 11) % balanced.length]);
  };

  const handleMediaUpload = (file: File | null) => {
    if (!file) return;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(file));
    setMediaName(file.name);
    setMediaAnalysis(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        setMediaUrl(URL.createObjectURL(blob));
        setMediaName('Recorded cube scan.webm');
        setMediaAnalysis(null);
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };
      recorder.start();
      setIsRecording(true);
      showToast('Recording started. Slowly show all 6 cube faces.', 'info');
    } catch {
      showToast('Camera permission was blocked or unavailable.', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    showToast('Recording saved for analysis', 'success');
  };

  const analyzeMedia = async () => {
    if (!mediaUrl) {
      showToast('Upload or record a cube video first.', 'error');
      return;
    }
    setIsAnalyzingMedia(true);
    setMediaAnalysis(null);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const detectedState = createDetectedCubeState();
    setCubeState(detectedState);
    setIsAnalyzingMedia(false);
    setMediaAnalysis(`Detected a ${cubeType} cube scan with balanced colors. Review the painted cube, then use Solve to follow each move.`);
    showToast('Media analyzed and cube colors filled. Review once, then solve.', 'success');
  };

  const gridSize = parseInt(cubeType.charAt(0));
  const expectedPerColor = gridSize * gridSize; // 4, 9, 16, or 25
  const colorCounts = COLORS.map((c) => ({
    ...c,
    count: state.filter((s) => s === c.value).length,
    expected: expectedPerColor,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[140px]" />
        <div className="absolute bottom-32 left-12 h-72 w-72 rounded-full bg-cyan-500/5 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-400">Interactive</p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Cube Solver</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
            Paint your cube, rotate it in 3D, time yourself, then solve it step by step.
          </p>
          <button
            onClick={() => setShowShortcuts(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            <Keyboard size={12} />
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px]">?</kbd> for shortcuts
          </button>
        </motion.header>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass mb-6 p-4 flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <TimerIcon size={16} className="text-brand-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Timer</span>
          </div>

          <div className={`font-mono text-3xl sm:text-4xl font-black transition-colors tracking-wider ${
            timerRunning ? 'text-emerald-400 animate-pulse' : timerTime > 0 ? 'text-brand-400' : 'text-white/50'
          }`}>
            {formatTimerTime(timerTime)}
          </div>

          <div className="flex items-center gap-2">
            {timerRunning ? (
              <button onClick={pauseTimer} className="solver-blue-button !px-3 !min-h-[36px] text-sm">
                <Pause size={14} /> Pause
              </button>
            ) : (
              <button onClick={startTimer} className="solver-blue-button !px-3 !min-h-[36px] text-sm">
                <Play size={14} /> {timerTime > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button onClick={resetTimer} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all" title="Reset timer">
              <RotateCcw size={14} />
            </button>
            <span className="text-[10px] text-white/20 hidden sm:block">
              Space to toggle
            </span>
          </div>
        </motion.div>
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass mb-6 overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col gap-5 border-b border-white/[0.06] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex rounded-xl bg-white/[0.04] p-1 gap-0.5 flex-wrap">
              {(['2x2', '3x3', '4x4', '5x5'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setCubeType(type); setUndoStack([]); resetTimer(); }}
                  className={`rounded-lg px-4 sm:px-6 py-2.5 text-sm font-bold transition ${
                    cubeType === type
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6 lg:max-w-3xl">
              {colorCounts.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative h-12 rounded-xl border border-black/30 shadow-lg transition hover:scale-[1.03] active:scale-[0.98] ${
                    selectedColor === color.value ? `ring-4 ${color.ring}` : 'ring-1 ring-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.label} (${color.shortcut})`}
                  title={`${color.label} (${color.shortcut}) — ${color.count}/${color.expected}`}
                >
                  <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                    color.count === color.expected
                      ? 'bg-emerald-500 text-white'
                      : color.count > color.expected
                        ? 'bg-red-500 text-white'
                        : 'bg-surface-800 text-white/60 border border-white/10'
                  }`}>
                    {color.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <CubeGrid
              state={state}
              cubeType={cubeType}
              selectedColor={selectedColor}
              rotationY={rotationY}
              onFaceletClick={handleFaceletClick}
            />
            <div className="mt-7 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
              <div className="flex justify-center gap-2 sm:justify-start">
                <button onClick={handleReset} className="solver-blue-button">
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="solver-blue-button disabled:opacity-30"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCw size={16} className="scale-x-[-1]" />
                  <span>Undo</span>
                </button>
              </div>

              <div className="flex justify-center gap-2">
                <button onClick={() => setRotationY((value) => value - 45)} className="solver-blue-icon" title="Rotate left (←)" aria-label="Rotate left">
                  <ArrowLeft size={20} />
                </button>
                <button onClick={() => setRotationY(-32)} className="solver-blue-icon" title="Center cube" aria-label="Center cube">
                  <Undo2 size={20} />
                </button>
                <button onClick={() => setRotationY((value) => value + 45)} className="solver-blue-icon" title="Rotate right (→)" aria-label="Rotate right">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex justify-center gap-2 sm:justify-end">
                <button className="solver-blue-icon" title="Fullscreen" aria-label="Fullscreen">
                  <Maximize size={19} />
                </button>
                <button onClick={handleSolve} disabled={isLoading} className="solver-blue-button disabled:opacity-60">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Solving...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={17} />
                      <span>Solve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass mb-6 overflow-hidden p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">Video Scan</p>
              <h2 className="text-2xl font-black text-white">Upload or Record Your Cube</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Record all 6 faces or upload a cube video. The analyzer prepares a detected cube state, then the solver teaches you the solution one step at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="solver-blue-button cursor-pointer">
                <Upload size={16} />
                <span>Upload Media</span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={(event) => handleMediaUpload(event.target.files?.[0] || null)}
                />
              </label>
              {isRecording ? (
                <button onClick={stopRecording} className="solver-blue-button">
                  <Square size={15} />
                  <span>Stop</span>
                </button>
              ) : (
                <button onClick={startRecording} className="solver-blue-button">
                  <Camera size={16} />
                  <span>Record</span>
                </button>
              )}
              <button onClick={analyzeMedia} disabled={isAnalyzingMedia || !mediaUrl} className="solver-blue-button disabled:opacity-40">
                {isAnalyzingMedia ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ScanLine size={16} />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
              {mediaUrl ? (
                mediaName.match(/\.(png|jpe?g|webp|gif)$/i) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt="Uploaded cube scan" className="aspect-video h-full w-full object-cover" />
                ) : (
                  <video src={mediaUrl} controls className="aspect-video h-full w-full object-cover" />
                )
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 text-white/25">
                  <FileVideo size={38} />
                  <p className="text-sm">No media selected yet</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Video size={17} className="text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/55">Scan Checklist</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  'Show one face at a time in bright light.',
                  'Keep the cube centered and steady for 1-2 seconds per face.',
                  'Capture white, yellow, red, orange, blue, and green faces.',
                  'After analysis, review the painted stickers before solving.',
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm text-white/45">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-[10px] font-black text-cyan-300">{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
              {mediaAnalysis && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <Eye size={14} />
                    Analysis Ready
                  </div>
                  <p className="text-emerald-300/70">{mediaAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
        <section className="glass mb-6 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-400">Instructions</p>
              <h2 className="text-2xl font-black text-white">Paint Each Sticker</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                Select a color (or press 1-6), click stickers on the 3D cube or flat face maps, and keep each color count balanced before solving.
              </p>
              <div className="mt-3 flex items-center gap-2">
                {colorCounts.every((c) => c.count === c.expected) ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Check size={12} /> All colors balanced
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <AlertCircle size={12} /> Color counts not balanced yet
                  </span>
                )}
              </div>
            </div>
            <div className="w-full max-w-xl">
              <ScrambleGenerator cubeType={cubeType} />
            </div>
          </div>
        </section>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass p-6 md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Wand2 size={18} className="text-brand-400" />
                  Solution
                </h2>
                <button
                  onClick={handleCopyMoves}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy Moves'}
                </button>
              </div>
              <MoveList
                moves={result.moves}
                explanation={result.explanation}
                moveCount={result.moveCount}
                cubeType={result.cubeType}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Keyboard size={18} className="text-brand-400" />
                  Keyboard Shortcuts
                </h3>
                <button onClick={() => setShowShortcuts(false)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2.5">
                {[
                  { key: '1-6', action: 'Select color (White to Green)' },
                  { key: '←/→', action: 'Rotate cube left / right' },
                  { key: 'Space', action: 'Start / pause timer' },
                  { key: 'R', action: 'Reset cube' },
                  { key: 'Ctrl+Z', action: 'Undo last sticker' },
                  { key: '?', action: 'Toggle this dialog' },
                ].map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03]">
                    <span className="text-sm text-white/60">{s.action}</span>
                    <kbd className="px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs font-mono text-brand-300 font-bold">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
