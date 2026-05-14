'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Lightbulb, Layers, Play, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { CubeType } from '@/types';

interface MoveListProps {
  moves: string[];
  explanation: string[];
  moveCount: number;
  cubeType?: CubeType;
}

const PHASE_MOVE_COUNTS: Record<CubeType, number[]> = {
  '2x2': [1, 7, 7, 7],
  '3x3': [6, 8, 16, 6, 7, 8, 11],
  '4x4': [14, 18, 37, 18],
  '5x5': [21, 25, 40, 18],
};

const getStepTitle = (text: string, index: number) => {
  const [title] = text.split(':');
  if (/^(step|phase)\s+\d+/i.test(title)) return title.trim();
  return `Guide ${index + 1}`;
};

const buildGuideSteps = (moves: string[], explanation: string[], cubeType: CubeType = '3x3') => {
  const headings = explanation
    .map((text, index) => ({ text, index }))
    .filter((item) => /^(step|phase)\s+\d+/i.test(item.text));
  const counts = PHASE_MOVE_COUNTS[cubeType] || [];
  let moveCursor = 0;

  if (!headings.length) {
    return [{
      title: 'Solved',
      description: explanation[0] || 'The cube is already solved.',
      details: explanation.slice(1),
      moves,
      startMove: 1,
    }];
  }

  return headings.map((heading, headingIndex) => {
    const nextHeading = headings[headingIndex + 1];
    const details = explanation.slice(heading.index + 1, nextHeading?.index ?? explanation.length);
    const count = counts[headingIndex] ?? Math.ceil((moves.length - moveCursor) / Math.max(1, headings.length - headingIndex));
    const stepMoves = moves.slice(moveCursor, moveCursor + count);
    const startMove = moveCursor + 1;
    moveCursor += count;

    return {
      title: getStepTitle(heading.text, headingIndex),
      description: heading.text.replace(/^((step|phase)\s+\d+\s*:\s*)/i, ''),
      details,
      moves: headingIndex === headings.length - 1 ? [...stepMoves, ...moves.slice(moveCursor)] : stepMoves,
      startMove,
    };
  });
};

export default function MoveList({ moves, explanation, moveCount, cubeType = '3x3' }: MoveListProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showAllMoves, setShowAllMoves] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const guideSteps = buildGuideSteps(moves, explanation, cubeType);
  const currentStep = guideSteps[activeStep] || guideSteps[0];
  const progress = guideSteps.length > 0 ? ((activeStep + 1) / guideSteps.length) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 size={18} className="text-emerald-400" />
        </div>
        <div>
          <span className="text-emerald-400 font-bold text-base">
            Solved in {moveCount} moves
          </span>
          <p className="text-emerald-400/50 text-[10px] mt-0.5">Layer-by-layer method</p>
        </div>
      </div>
      <div className="rounded-2xl border border-brand-500/15 bg-brand-500/5 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-300">
              <Play size={13} />
              Guided Solve Player
            </div>
            <h3 className="text-xl font-black text-white">{currentStep.title}</h3>
            <p className="mt-1 text-sm leading-6 text-white/45">{currentStep.description}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/25">Step</p>
            <p className="font-mono text-lg font-black text-white">{activeStep + 1}/{guideSteps.length}</p>
          </div>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>

        <div className="mb-4 rounded-xl border border-white/[0.06] bg-black/15 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Do these moves</p>
          <div className="flex flex-wrap gap-1.5">
            {currentStep.moves.length ? currentStep.moves.map((move, index) => (
              <span key={`${move}-${index}`} className="rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 font-mono text-sm font-black text-cyan-200">
                {currentStep.startMove + index}. {move}
              </span>
            )) : (
              <span className="text-sm text-white/40">No moves needed for this step.</span>
            )}
          </div>
        </div>

        {!!currentStep.details.length && (
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {currentStep.details.map((detail) => (
              <div key={detail} className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm leading-6 text-white/45">
                {detail}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button onClick={() => setActiveStep(0)} className="solver-blue-button !min-h-[38px] !px-3 text-sm">
            <RotateCcw size={14} /> Restart
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveStep((value) => Math.max(0, value - 1))}
              disabled={activeStep === 0}
              className="solver-blue-button !min-h-[38px] !px-3 text-sm disabled:opacity-35"
            >
              <SkipBack size={14} /> Previous
            </button>
            <button
              onClick={() => setActiveStep((value) => Math.min(guideSteps.length - 1, value + 1))}
              disabled={activeStep === guideSteps.length - 1}
              className="solver-blue-button !min-h-[38px] !px-3 text-sm disabled:opacity-35"
            >
              Next <SkipForward size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Step-by-Step Guide</h3>
        </div>
        {explanation.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-left group"
            >
              <span className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500/25 transition-colors">
                {i + 1}
              </span>
              <p className="text-sm text-white/70 leading-relaxed flex-1">{step}</p>
              <ChevronDown size={14} className={`text-white/20 mt-1 shrink-0 transition-transform ${expandedStep === i ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Move Sequence</h3>
          </div>
          {moves.length > 12 && (
            <button
              onClick={() => setShowAllMoves(!showAllMoves)}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
            >
              {showAllMoves ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {showAllMoves ? 'Show less' : `Show all ${moves.length}`}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(showAllMoves ? moves : moves.slice(0, 20)).map((move, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/15 text-brand-300 text-sm font-mono font-bold hover:bg-brand-500/20 hover:border-brand-500/25 transition-all cursor-default"
            >
              {move}
              {i < (showAllMoves ? moves.length : Math.min(moves.length, 20)) - 1 && (
                <ArrowRight size={8} className="text-brand-500/30 ml-0.5" />
              )}
            </motion.span>
          ))}
          {!showAllMoves && moves.length > 20 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/30 text-sm font-mono">
              +{moves.length - 20} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
