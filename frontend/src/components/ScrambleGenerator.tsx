'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Copy, Check, RotateCw } from 'lucide-react';
import { CubeType } from '@/types';

const MOVES_2x2 = ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'F2'];
const MOVES_3x3 = ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2'];
const MOVES_4x4 = [...MOVES_3x3, 'Rw', "Rw'", 'Rw2', 'Lw', "Lw'", 'Lw2', 'Uw', "Uw'", 'Uw2', 'Dw', "Dw'", 'Dw2', 'Fw', "Fw'", 'Fw2', 'Bw', "Bw'", 'Bw2'];
const MOVES_5x5 = [...MOVES_4x4, '3Rw', "3Rw'", '3Rw2', '3Lw', "3Lw'", '3Uw', "3Uw'", '3Dw', "3Dw'", '3Fw', "3Fw'"];

const MOVE_SETS: Record<CubeType, string[]> = {
  '2x2': MOVES_2x2,
  '3x3': MOVES_3x3,
  '4x4': MOVES_4x4,
  '5x5': MOVES_5x5,
};

const SCRAMBLE_LENGTHS: Record<CubeType, number> = {
  '2x2': 9,
  '3x3': 20,
  '4x4': 40,
  '5x5': 60,
};

function getBaseFace(move: string): string {
  // Extract the base face letter: "3Rw'" → "R", "Rw2" → "R", "R'" → "R"
  const cleaned = move.replace(/^[0-9]+/, ''); // remove leading numbers
  return cleaned[0];
}

function getOpposite(face: string): string {
  const map: Record<string, string> = { R: 'L', L: 'R', U: 'D', D: 'U', F: 'B', B: 'F' };
  return map[face] || '';
}

function generateScramble(cubeType: CubeType): string[] {
  const moves = MOVE_SETS[cubeType] || MOVES_3x3;
  const length = SCRAMBLE_LENGTHS[cubeType] || 20;
  const scramble: string[] = [];
  let lastFace = '';
  let secondLastFace = '';

  for (let i = 0; i < length; i++) {
    let move: string;
    let face: string;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
      face = getBaseFace(move);
    } while (face === lastFace || (face === secondLastFace && getOpposite(face) === lastFace));

    scramble.push(move);
    secondLastFace = lastFace;
    lastFace = face;
  }

  return scramble;
}

interface ScrambleGeneratorProps {
  cubeType: CubeType;
}

export default function ScrambleGenerator({ cubeType }: ScrambleGeneratorProps) {
  const [scramble, setScramble] = useState<string[]>(() => generateScramble(cubeType));
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Regenerate when cubeType changes
  useEffect(() => {
    setScramble(generateScramble(cubeType));
  }, [cubeType]);

  const regenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setScramble(generateScramble(cubeType));
      setIsGenerating(false);
    }, 200);
  }, [cubeType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(scramble.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shuffle size={14} className="text-brand-400" />
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Scramble</p>
          <span className="text-[10px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded font-mono">{scramble.length} moves</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-white/30 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
            title="Copy scramble"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={regenerate}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-white/30 hover:text-brand-400 hover:bg-brand-500/10 transition-all disabled:opacity-30"
            title="Generate new scramble"
          >
            <RotateCw size={14} className={isGenerating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={scramble.join('')}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar"
        >
          {scramble.map((move, i) => (
            <motion.span
              key={`${move}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm font-mono text-brand-300 font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-default"
            >
              {move}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
