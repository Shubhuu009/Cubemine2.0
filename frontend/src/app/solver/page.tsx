'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, ArrowLeft, ArrowRight, Maximize, RotateCcw,
  Undo2, Wand2, Timer as TimerIcon, Keyboard, X, Play, Pause,
  RotateCw, Copy, Check, Camera, Square, ScanLine,
  Eye, SwitchCamera,
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

const COLOR_HEX = COLORS.reduce((acc, color) => {
  acc[color.value] = color.hex;
  return acc;
}, {} as Record<CubeColor, string>);

type CameraFacingMode = 'environment' | 'user';

type Rgb = { r: number; g: number; b: number };

type SampleCandidate = {
  index: number;
  rgb: Rgb;
  scores: Record<CubeColor, number>;
};

type ColorDecision = {
  color: CubeColor;
  confidence: number;
  score: number;
  runnerUp: number;
};

type ScannedFace = {
  id: number;
  label: string;
  samples: SampleCandidate[];
  colors: CubeColor[];
  confidence: number;
  capturedAt: number;
};

type ScanReport = {
  colors: CubeColor[];
  confidence: number;
  counts: Record<CubeColor, number>;
  valid: boolean;
  message: string;
  details: string[];
};

const COLOR_REFERENCES: Record<CubeColor, Rgb> = {
  W: { r: 248, g: 250, b: 252 },
  Y: { r: 255, g: 210, b: 38 },
  R: { r: 239, g: 63, b: 70 },
  O: { r: 255, g: 122, b: 24 },
  B: { r: 59, g: 130, b: 246 },
  G: { r: 34, g: 197, b: 94 },
};

const CUBE_COLORS: CubeColor[] = ['W', 'Y', 'R', 'O', 'B', 'G'];

const SCAN_FACE_ORDER = ['Up', 'Right', 'Front', 'Down', 'Left', 'Back'];

const emptyColorCounts = () => CUBE_COLORS.reduce((acc, color) => {
  acc[color] = 0;
  return acc;
}, {} as Record<CubeColor, number>);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const srgbToLinear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

const rgbToLab = ({ r, g, b }: Rgb) => {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  let x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  let y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  let z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;

  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;

  const f = (value: number) => (value > 0.008856 ? Math.cbrt(value) : (7.787 * value) + (16 / 116));
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
};

const COLOR_LABS = CUBE_COLORS.reduce((acc, color) => {
  acc[color] = rgbToLab(COLOR_REFERENCES[color]);
  return acc;
}, {} as Record<CubeColor, ReturnType<typeof rgbToLab>>);

const scoreColor = (
  rgb: Rgb,
  color: CubeColor,
  references: Record<CubeColor, ReturnType<typeof rgbToLab>> = COLOR_LABS,
) => {
  const lab = rgbToLab(rgb);
  const reference = references[color];
  const dl = lab.l - reference.l;
  const da = lab.a - reference.a;
  const db = lab.b - reference.b;
  return Math.sqrt(dl * dl + da * da + db * db);
};

const classifyRgb = (
  rgb: Rgb,
  references: Record<CubeColor, ReturnType<typeof rgbToLab>> = COLOR_LABS,
): ColorDecision => {
  const ranked = CUBE_COLORS
    .map((color) => ({ color, score: scoreColor(rgb, color, references) }))
    .sort((a, b) => a.score - b.score);
  const best = ranked[0];
  const runnerUp = ranked[1]?.score ?? best.score;
  const separationConfidence = clamp01((runnerUp - best.score) / 28);
  const distanceConfidence = clamp01(1 - best.score / 90);

  return {
    color: best.color,
    score: best.score,
    runnerUp,
    confidence: clamp01(separationConfidence * 0.68 + distanceConfidence * 0.32),
  };
};

const sampleGridCandidates = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  startIndex: number,
): SampleCandidate[] => {
  const side = Math.min(width, height) * 0.62;
  const left = (width - side) / 2;
  const top = (height - side) / 2;
  const cell = side / gridSize;
  const candidates: SampleCandidate[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const sampleSide = Math.max(2, Math.floor(cell * 0.48));
      const x = Math.floor(left + col * cell + (cell - sampleSide) / 2);
      const y = Math.floor(top + row * cell + (cell - sampleSide) / 2);
      const imageData = context.getImageData(x, y, sampleSide, sampleSide).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count += 1;
      }

      const rgb = { r: r / count, g: g / count, b: b / count };
      const scores = CUBE_COLORS.reduce((acc, color) => {
        acc[color] = scoreColor(rgb, color);
        return acc;
      }, {} as Record<CubeColor, number>);

      candidates.push({
        index: startIndex + row * gridSize + col,
        rgb,
        scores,
      });
    }
  }

  return candidates;
};

const buildCalibratedReferences = (candidates: SampleCandidate[]) => {
  const groups = CUBE_COLORS.reduce((acc, color) => {
    acc[color] = [];
    return acc;
  }, {} as Record<CubeColor, Rgb[]>);

  candidates.forEach((candidate) => {
    const decision = classifyRgb(candidate.rgb);
    if (decision.confidence >= 0.35) {
      groups[decision.color].push(candidate.rgb);
    }
  });

  return CUBE_COLORS.reduce((acc, color) => {
    const group = groups[color];
    if (group.length < 2) {
      acc[color] = COLOR_LABS[color];
      return acc;
    }

    const channelMedian = (channel: keyof Rgb) => {
      const values = group.map((rgb) => rgb[channel]).sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)];
    };

    acc[color] = rgbToLab({
      r: channelMedian('r'),
      g: channelMedian('g'),
      b: channelMedian('b'),
    });
    return acc;
  }, {} as Record<CubeColor, ReturnType<typeof rgbToLab>>);
};

const classifyCandidates = (
  candidates: SampleCandidate[],
  references: Record<CubeColor, ReturnType<typeof rgbToLab>> = COLOR_LABS,
) => {
  const decisions = candidates.map((candidate) => classifyRgb(candidate.rgb, references));
  const counts = emptyColorCounts();
  decisions.forEach((decision) => {
    counts[decision.color] += 1;
  });

  return {
    colors: decisions.map((decision) => decision.color),
    counts,
    confidence: decisions.length
      ? decisions.reduce((sum, decision) => sum + decision.confidence, 0) / decisions.length
      : 0,
    decisions,
  };
};

const rebalanceDetectedColors = (
  candidates: SampleCandidate[],
  expectedPerColor: number,
  references: Record<CubeColor, ReturnType<typeof rgbToLab>> = COLOR_LABS,
) => {
  const assignments = new Map<number, CubeColor>();
  const remaining = CUBE_COLORS.reduce((acc, color) => {
    acc[color] = expectedPerColor;
    return acc;
  }, {} as Record<CubeColor, number>);

  const ranked = candidates
    .flatMap((candidate) => CUBE_COLORS.map((color) => ({
      index: candidate.index,
      color,
      score: scoreColor(candidate.rgb, color, references),
    })))
    .sort((a, b) => a.score - b.score);

  ranked.forEach(({ index, color }) => {
    if (assignments.has(index) || remaining[color] <= 0) return;
    assignments.set(index, color);
    remaining[color] -= 1;
  });

  candidates.forEach((candidate) => {
    if (assignments.has(candidate.index)) return;
    const fallback = CUBE_COLORS.find((color) => remaining[color] > 0) || 'W';
    assignments.set(candidate.index, fallback);
    remaining[fallback] -= 1;
  });

  return candidates
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((candidate) => assignments.get(candidate.index) || 'W');
};

const validateScanReport = (
  candidates: SampleCandidate[],
  colors: CubeColor[],
  expectedPerColor: number,
  confidence: number,
): ScanReport => {
  const counts = emptyColorCounts();
  colors.forEach((color) => {
    counts[color] += 1;
  });

  const details = CUBE_COLORS
    .filter((color) => counts[color] !== expectedPerColor)
    .map((color) => `${color}: ${counts[color]}/${expectedPerColor}`);

  if (candidates.length !== expectedPerColor * 6) {
    details.push(`Expected ${expectedPerColor * 6} stickers, sampled ${candidates.length}.`);
  }

  if (confidence < 0.42) {
    details.push('Low color confidence. Use brighter light and fill the guide square with the cube face.');
  }

  return {
    colors,
    confidence,
    counts,
    valid: details.length === 0,
    message: details.length === 0
      ? `Scan validated with ${Math.round(confidence * 100)}% color confidence.`
      : `Scan needs another pass: ${details.join(', ')}`,
    details,
  };
};

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
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<CameraFacingMode>('environment');
  const [liveScan, setLiveScan] = useState<ScanReport | null>(null);
  const [scannedFaces, setScannedFaces] = useState<ScannedFace[]>([]);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveScanFrameRef = useRef<number | null>(null);
  const lastLiveScanAtRef = useRef(0);

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
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!liveVideoRef.current) return;
    liveVideoRef.current.srcObject = mediaStreamRef.current;
  }, [isScanning]);

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

    const counts = emptyColorCounts();
    state.forEach((color) => {
      counts[color] += 1;
    });
    const invalidCounts = CUBE_COLORS
      .filter((color) => counts[color] !== expectedPerColor)
      .map((color) => `${color}: ${counts[color]}/${expectedPerColor}`);
    if (state.length !== expectedPerColor * 6 || invalidCounts.length > 0) {
      const message = invalidCounts.length > 0
        ? `Invalid cube state. Fix color counts: ${invalidCounts.join(', ')}.`
        : `Invalid cube state. Expected ${expectedPerColor * 6} stickers.`;
      setScanStatus(message);
      showToast(message, 'error');
      return;
    }

    try {
      await solveCube(solveTime);
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
    resetScanFaces();
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

  const stopCameraStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  };

  const getCameraStream = async (facingMode: CameraFacingMode) => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
  };

  const startScanner = async () => {
    try {
      stopCameraStream();
      setLiveScan(null);
      setScanReport(null);
      setScannedFaces([]);
      const stream = await getCameraStream(cameraFacingMode);
      mediaStreamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      setScanStatus(null);
      setIsScanning(true);
      showToast('Scanner started. Click each face in order.', 'info');
    } catch {
      showToast('Camera permission was blocked or unavailable.', 'error');
    }
  };

  const stopScanner = () => {
    stopCameraStream();
    setIsScanning(false);
    showToast(scannedFaces.length > 0 ? 'Scanner paused. Captured faces were kept.' : 'Camera stopped', 'info');
  };

  const switchCamera = () => {
    const nextMode: CameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    showToast(`Camera set to ${nextMode === 'environment' ? 'back' : 'front'} lens`, 'info');
  };

  const sampleVideoElement = (video: HTMLVideoElement, startIndex: number) => {
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error('Camera frame is not ready yet.');
    }

    const canvas = liveCanvasRef.current || document.createElement('canvas');
    liveCanvasRef.current = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas analysis is unavailable in this browser.');

    const maxWidth = 720;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.max(320, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(180, Math.round(video.videoHeight * scale));
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return sampleGridCandidates(context, canvas.width, canvas.height, gridSize, startIndex);
  };

  const buildReportFromCandidates = (candidates: SampleCandidate[]) => {
    const references = buildCalibratedReferences(candidates);
    const raw = classifyCandidates(candidates, references);
    const balancedColors = rebalanceDetectedColors(candidates, expectedPerColor, references);
    const balancedDecisions = candidates.map((candidate, index) => ({
      color: balancedColors[index],
      decision: classifyRgb(candidate.rgb, references),
    }));
    const balancedConfidence = balancedDecisions.length
      ? balancedDecisions.reduce((sum, item) => {
        const colorPenalty = item.color === item.decision.color ? 1 : 0.72;
        return sum + item.decision.confidence * colorPenalty;
      }, 0) / balancedDecisions.length
      : 0;

    const rawCountDistance = CUBE_COLORS.reduce((sum, color) => (
      sum + Math.abs(raw.counts[color] - expectedPerColor)
    ), 0);
    const report = validateScanReport(
      candidates,
      balancedColors,
      expectedPerColor,
      Math.min(raw.confidence, balancedConfidence),
    );

    if (rawCountDistance > expectedPerColor * 1.8) {
      report.valid = false;
      report.details.push(`Raw color balance is too far off (${rawCountDistance} misplaced color votes).`);
      report.message = `Scan needs another pass: ${report.details.join(', ')}`;
    }

    return report;
  };

  const captureCurrentFace = () => {
    if (!isScanning || !liveVideoRef.current) {
      showToast('Start the camera before capturing a face.', 'error');
      return;
    }
    if (scannedFaces.length >= 6) {
      showToast('All 6 faces are already captured. Apply or reset the scan.', 'info');
      return;
    }

    try {
      const faceIndex = scannedFaces.length;
      const samples = sampleVideoElement(liveVideoRef.current, faceIndex * expectedPerColor);
      const preview = classifyCandidates(samples);
      if (preview.confidence < 0.28) {
        showToast('Face is too blurry or dim. Hold still in brighter light.', 'error');
        return;
      }

      const nextFaces = [
        ...scannedFaces,
        {
          id: faceIndex,
          label: SCAN_FACE_ORDER[faceIndex],
          samples,
          colors: preview.colors,
          confidence: preview.confidence,
          capturedAt: Date.now(),
        },
      ];
      setScannedFaces(nextFaces);
      setScanReport(null);
      showToast(`${SCAN_FACE_ORDER[faceIndex]} face captured`, 'success');

      if (nextFaces.length === 6) {
        const report = buildReportFromCandidates(nextFaces.flatMap((face) => face.samples));
        setScanReport(report);
        if (report.valid) {
          setCubeState(report.colors);
          setScanStatus(report.message);
          showToast('Scan validated and applied to the cube.', 'success');
        } else {
          setScanStatus(null);
          showToast('Scan is not reliable yet. Retake the weak faces.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Could not capture this face.', 'error');
    }
  };

  const resetScanFaces = () => {
    setScannedFaces([]);
    setScanReport(null);
    setLiveScan(null);
    setScanStatus(null);
  };

  const retakeLastFace = () => {
    if (scannedFaces.length === 0) return;
    const removedFace = scannedFaces[scannedFaces.length - 1];
    setScannedFaces((faces) => faces.slice(0, -1));
    setScanReport(null);
    setScanStatus(null);
    showToast(`${removedFace.label} face removed. Capture it again.`, 'info');
  };

  const applyCapturedScan = () => {
    if (scannedFaces.length !== 6) {
      showToast(`Capture ${6 - scannedFaces.length} more face${6 - scannedFaces.length === 1 ? '' : 's'} before applying.`, 'error');
      return;
    }

    const report = buildReportFromCandidates(scannedFaces.flatMap((face) => face.samples));
    setScanReport(report);
    if (!report.valid) {
      setScanStatus(null);
      showToast('Scan is not reliable yet. Retake the weak faces.', 'error');
      return;
    }
    setScanStatus(report.message);
    setCubeState(report.colors);
    showToast('Scan validated and applied to the cube.', 'success');
  };

  const gridSize = parseInt(cubeType.charAt(0));
  const expectedPerColor = gridSize * gridSize; // 4, 9, 16, or 25

  useEffect(() => {
    if (!isScanning) {
      if (liveScanFrameRef.current) cancelAnimationFrame(liveScanFrameRef.current);
      liveScanFrameRef.current = null;
      return;
    }

    const scanFrame = (timestamp: number) => {
      if (timestamp - lastLiveScanAtRef.current > 180 && liveVideoRef.current?.readyState) {
        lastLiveScanAtRef.current = timestamp;
        try {
          const samples = sampleVideoElement(liveVideoRef.current, 0);
          const preview = classifyCandidates(samples);
          setLiveScan({
            colors: preview.colors,
            confidence: preview.confidence,
            counts: preview.counts,
            valid: preview.confidence >= 0.35,
            message: preview.confidence >= 0.35
              ? `Live color confidence ${Math.round(preview.confidence * 100)}%`
              : 'Hold the face flatter, closer, and in brighter light.',
            details: [],
          });
        } catch {
          // The video element can be briefly unready immediately after permission is granted.
        }
      }
      liveScanFrameRef.current = requestAnimationFrame(scanFrame);
    };

    liveScanFrameRef.current = requestAnimationFrame(scanFrame);
    return () => {
      if (liveScanFrameRef.current) cancelAnimationFrame(liveScanFrameRef.current);
      liveScanFrameRef.current = null;
    };
  }, [isScanning, gridSize]);

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
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">Click Scan</p>
              <h2 className="text-2xl font-black text-white">Capture Your Cube Face by Face</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Open the camera, center one face inside the guide, and click capture for each side. CUBEMINE checks the colors and fills the cube for you.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={switchCamera}
                disabled={isScanning}
                className="solver-blue-button disabled:opacity-40"
                title="Switch camera before scanning"
              >
                <SwitchCamera size={16} />
                <span>{cameraFacingMode === 'environment' ? 'Back' : 'Front'}</span>
              </button>
              {isScanning ? (
                <button onClick={stopScanner} className="solver-blue-button">
                  <Square size={15} />
                  <span>Stop</span>
                </button>
              ) : (
                <button onClick={startScanner} className="solver-blue-button">
                  <Camera size={16} />
                  <span>Start Camera</span>
                </button>
              )}
              {isScanning && (
                <button onClick={captureCurrentFace} className="solver-blue-button">
                  <ScanLine size={16} />
                  <span>{scannedFaces.length < 6 ? `Capture ${SCAN_FACE_ORDER[scannedFaces.length]}` : 'Captured'}</span>
                </button>
              )}
              <button
                onClick={resetScanFaces}
                disabled={scannedFaces.length === 0 && !scanReport}
                className="solver-blue-button disabled:opacity-40"
              >
                <RotateCcw size={15} />
                <span>Reset Scan</span>
              </button>
              <button
                onClick={retakeLastFace}
                disabled={scannedFaces.length === 0}
                className="solver-blue-button disabled:opacity-40"
              >
                <Undo2 size={15} />
                <span>Retake Face</span>
              </button>
              <button onClick={applyCapturedScan} disabled={scannedFaces.length !== 6} className="solver-blue-button disabled:opacity-40">
                <Check size={16} />
                <span>Apply Scan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
              {isScanning ? (
                <div className="relative aspect-video">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Live Camera
                  </div>
                  <div className="absolute right-3 top-3 rounded-full border border-cyan-300/30 bg-black/45 px-3 py-1 text-xs font-bold text-cyan-100">
                    {liveScan ? `${Math.round(liveScan.confidence * 100)}%` : 'Scanning'}
                  </div>
                  <div className="pointer-events-none absolute inset-[19%] border border-cyan-300/60 shadow-[0_0_0_999px_rgba(0,0,0,0.24)]">
                    {liveScan && (
                      <div className="grid h-full w-full gap-1 bg-black/15 p-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                        {liveScan.colors.map((color, index) => (
                          <div
                            key={`${color}-${index}`}
                            className="rounded-[4px] border border-black/35 opacity-80"
                            style={{ backgroundColor: COLOR_HEX[color] }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/70">
                    {scannedFaces.length < 6
                      ? `Next: ${SCAN_FACE_ORDER[scannedFaces.length]} face. Fill the guide and tap Capture.`
                      : 'All faces captured. Apply the scan or reset to try again.'}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center text-white/30">
                  <Camera size={38} />
                  <p className="text-sm font-semibold text-white/45">Camera is off</p>
                  <p className="max-w-sm text-xs leading-5 text-white/25">
                    Start the camera, place the current cube face inside the guide, then click the capture button.
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Camera size={17} className="text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/55">Scan Checklist</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  'Show one face at a time in bright light.',
                  'Keep the cube centered and steady before clicking capture.',
                  'Use the Back/Front camera button before scanning if the wrong lens opens.',
                  'Capture white, yellow, red, orange, blue, and green faces.',
                  'After applying the scan, review the painted stickers before solving.',
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm text-white/45">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-[10px] font-black text-cyan-300">{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SCAN_FACE_ORDER.map((label, index) => {
                  const face = scannedFaces[index];
                  return (
                    <div
                      key={label}
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        face
                          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                          : index === scannedFaces.length && isScanning
                            ? 'border-cyan-300/30 bg-cyan-500/10 text-cyan-100'
                            : 'border-white/[0.06] bg-white/[0.03] text-white/35'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">{label}</span>
                        {face ? <Check size={13} /> : <span className="text-[10px]">{index + 1}</span>}
                      </div>
                      <div className="mt-1 text-[10px] opacity-70">
                        {face ? `${Math.round(face.confidence * 100)}% confidence` : 'Waiting'}
                      </div>
                      {face && (
                        <div className="mt-2 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                          {face.colors.map((color, colorIndex) => (
                            <span
                              key={`${label}-${colorIndex}`}
                              className="aspect-square rounded-[2px] border border-black/25"
                              style={{ backgroundColor: COLOR_HEX[color] }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {scanReport && (
                <div className={`mt-4 rounded-xl border p-3 text-sm ${
                  scanReport.valid
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/25 bg-amber-500/10 text-amber-200'
                }`}>
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    {scanReport.valid ? <Check size={14} /> : <AlertCircle size={14} />}
                    {scanReport.valid ? 'Scan Validated' : 'Scan Needs Retake'}
                  </div>
                  <p className="opacity-75">{scanReport.message}</p>
                </div>
              )}
              {scanStatus && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <Eye size={14} />
                    Scan Applied
                  </div>
                  <p className="text-emerald-300/70">{scanStatus}</p>
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
