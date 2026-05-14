'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCw, Layers, Info, ChevronRight, ChevronLeft, Play, Check, Box, Lightbulb, Award, Video, Grid3X3 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const notations = [
  { move: 'R', desc: 'Right face clockwise' },
  { move: "R'", desc: 'Right face counter-clockwise' },
  { move: 'R2', desc: 'Right face 180°' },
  { move: 'L', desc: 'Left face clockwise' },
  { move: "L'", desc: 'Left face counter-clockwise' },
  { move: 'U', desc: 'Up face clockwise' },
  { move: "U'", desc: 'Up face counter-clockwise' },
  { move: 'D', desc: 'Down face clockwise' },
  { move: 'F', desc: 'Front face clockwise' },
  { move: "F'", desc: 'Front face counter-clockwise' },
  { move: 'B', desc: 'Back face clockwise' },
  { move: "B'", desc: 'Back face counter-clockwise' },
];

const beginnerSteps3x3 = [
  {
    step: 1, title: 'White Cross', desc: 'Form a cross on the white face, ensuring edge colors match the center pieces of adjacent faces.',
    tip: 'Start with the daisy method — make a yellow center cross first, then flip edges down.',
    algorithm: "F R U R' U' F'",
    detail: 'Hold the cube with white on top. Find white edge pieces and bring them to form a plus-sign on top. Each edge\'s side color must match the center of that face.',
  },
  {
    step: 2, title: 'White Corners', desc: 'Insert the white corner pieces to complete the first layer.',
    tip: "Algorithm: R' D' R D — repeat until the corner is correctly placed.",
    algorithm: "R' D' R D",
    detail: 'Find white corner pieces in the bottom layer. Position the corner below where it needs to go, then repeat the algorithm up to 5 times until it slots in correctly.',
  },
  {
    step: 3, title: 'Middle Layer Edges', desc: 'Flip the cube upside down (yellow on top). Insert middle layer edges.',
    tip: "Right insert: U R U' R' U' F' U F | Left insert: U' L' U L U F U' F'",
    algorithm: "U R U' R' U' F' U F",
    detail: 'Turn the cube so yellow is on top. Find edge pieces in the top layer without yellow. Align the edge\'s front color with the matching center, then use the right or left insertion algorithm.',
  },
  {
    step: 4, title: 'Yellow Cross', desc: 'Form a cross on the yellow face (top).',
    tip: "Algorithm: F R U R' U' F' — you may need to repeat 1-3 times.",
    algorithm: "F R U R' U' F'",
    detail: 'You\'ll see one of: dot, L-shape, line, or cross on the yellow face. For dot → do algorithm once. For L → position L at top-left, do algorithm. For line → hold horizontal, do algorithm.',
  },
  {
    step: 5, title: 'Yellow Face (OLL)', desc: 'Orient all yellow pieces to face upward.',
    tip: "Sune algorithm: R U R' U R U2 R'",
    algorithm: "R U R' U R U2 R'",
    detail: 'Now make the entire top face yellow. Position yellow corners and apply the Sune algorithm. You may need to do it 1-3 times. Check orientation before each application.',
  },
  {
    step: 6, title: 'Position Corners (PLL)', desc: 'Move yellow corners to their correct positions.',
    tip: "Algorithm: U R U' L' U R' U' L",
    algorithm: "U R U' L' U R' U' L",
    detail: 'Look at the corner pieces — find a side where two adjacent corners match the same face color. Hold that side facing you and apply the algorithm to swap the other two corners.',
  },
  {
    step: 7, title: 'Position Edges (PLL)', desc: 'Move yellow edges to their correct positions to complete the cube!',
    tip: "Algorithm: R U' R U R U R U' R' U' R2",
    algorithm: "R U' R U R U R U' R' U' R2",
    detail: 'Find one correctly-placed edge (matching its center). Hold that face toward you and apply the algorithm. If no edge is correct, do the algorithm once from any position, then find the correct edge.',
  },
];

const beginnerSteps2x2 = [
  {
    step: 1, title: 'First Layer', desc: 'Solve one complete face and make sure the sides match too.',
    tip: "Use intuition — place corners one by one with R' D' R D.",
    algorithm: "R' D' R D",
    detail: 'Pick a color (usually white). Place white corners one at a time so that white is on the bottom and the side colors align with their respective faces.',
  },
  {
    step: 2, title: 'Orient Last Layer', desc: 'Flip all pieces on the opposite face to the correct orientation.',
    tip: "Algorithm: R U R' U R U2 R'",
    algorithm: "R U R' U R U2 R'",
    detail: 'All pieces on the top should now show yellow (if bottom is white). Use the Sune algorithm and repeat until all top pieces face up correctly.',
  },
  {
    step: 3, title: 'Permute Last Layer', desc: 'Swap pieces on the last layer to their correct positions.',
    tip: "Algorithm: R U' L' U R' U' L",
    algorithm: "R U' L' U R' U' L",
    detail: 'Find two corners that need to swap. Hold them on the right side and apply the algorithm. The cube should now be solved!',
  },
];

const beginnerSteps4x4 = [
  { step: 1, title: 'Solve Centers', desc: 'Build a 2×2 center block on each of the 6 faces.', tip: 'Use inner slice moves: r, l, u, d to position centers without disturbing others.', algorithm: "r U r' U r U2 r'", detail: 'Start with white and yellow (opposite) centers, then solve the 4 remaining side centers. Use Rw and Lw wide moves.' },
  { step: 2, title: 'Pair Edges', desc: 'Match the two edge halves on every edge to form "dedges".', tip: "Uw' R U R' F R' F' R Uw", algorithm: "Uw' R U R' F R' F' R Uw", detail: 'Find two matching edge pieces. Place one in the top layer and one in the middle, then use the algorithm to pair them.' },
  { step: 3, title: 'Solve as 3×3', desc: 'With centers and edges paired, solve it like a regular 3×3.', tip: 'Use the standard beginner method (cross → corners → middle → OLL → PLL).', algorithm: "R U R' U R U2 R'", detail: 'The cube now behaves exactly like a 3×3. Apply the layer-by-layer method.' },
  { step: 4, title: 'Fix Parity', desc: 'Handle OLL and PLL parity — unique to even-layered cubes.', tip: "OLL Parity: r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'", algorithm: "r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'", detail: 'If one edge is flipped (OLL parity) or two edges need swapping (PLL parity), apply the respective parity algorithm.' },
];

const beginnerSteps5x5 = [
  { step: 1, title: 'Solve Centers', desc: 'Build a 3×3 center block on each of the 6 faces (9 pieces each).', tip: 'Start with opposite faces (white/yellow), then adjacent.', algorithm: "r U r' U r U2 r'", detail: 'The 5×5 has a fixed center piece per face. Build the 3×3 center grid around it using inner slice moves.' },
  { step: 2, title: 'Pair Tredges', desc: 'Match the three edge pieces per edge into "tredges" (triple edges).', tip: "Use freeslice: Uw' R U R' F R' F' R Uw", algorithm: "Uw' R U R' F R' F' R Uw", detail: 'Each edge has 3 parts. Pair the outer two first, then insert the inner wing piece. Repeat for all 12 tredges.' },
  { step: 3, title: 'Solve as 3×3', desc: 'With centers built and tredges paired, solve using the beginner 3×3 method.', tip: 'Cross → Corners → Middle → OLL → PLL — same as 3×3.', algorithm: "F R U R' U' F'", detail: 'The cube is now effectively a 3×3. Apply layer-by-layer.' },
  { step: 4, title: 'Fix Edge Parity', desc: 'If one edge is flipped, apply the edge flip parity algorithm.', tip: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'", algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'", detail: 'On a 5×5, you can encounter an edge flip parity. Apply the algorithm once to correct it.' },
];

const youtubeVideos = [
  { id: 'R-R0KrXvNBc', title: '3×3 Beginner Tutorial — Full Solve', cube: '3x3', channel: 'JPerm', gradient: 'from-brand-500 to-purple-600' },
  { id: '1t1OL2zN0LQ', title: '2×2 Beginner Tutorial — Easy Method', cube: '2x2', channel: 'JPerm', gradient: 'from-green-500 to-emerald-600' },
  { id: 'KGvQRaK1mvs', title: '4×4 Beginner Tutorial — Yau Method', cube: '4x4', channel: 'JPerm', gradient: 'from-amber-500 to-orange-600' },
  { id: '1XXFwuB1gRk', title: '5×5 Beginner Tutorial — Reduction', cube: '5x5', channel: 'JPerm', gradient: 'from-rose-500 to-pink-600' },
  { id: 'MS5jByTX_pk', title: 'F2L Intuitive Tutorial', cube: '3x3', channel: 'JPerm', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'f_Yor-DIkUE', title: 'How to be Sub-20 on 3×3', cube: '3x3', channel: 'JPerm', gradient: 'from-violet-500 to-fuchsia-600' },
];

function AlgorithmViewer({ algorithm }: { algorithm: string }) {
  const moves = algorithm.split(' ');
  const [currentStep, setCurrentStep] = useState(-1);

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-2 mb-3">
        <Play size={12} className="text-brand-400" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Algorithm Stepper</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {moves.map((move, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-all ${
              i === currentStep
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110'
                : i < currentStep
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {i < currentStep && <Check size={10} className="inline mr-1" />}
            {move}
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))}
          disabled={currentStep <= -1}
          className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(moves.length - 1, currentStep + 1))}
          disabled={currentStep >= moves.length - 1}
          className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => setCurrentStep(-1)}
          className="text-[10px] text-white/30 hover:text-white/50 transition-colors ml-2"
        >
          Reset
        </button>
        <span className="text-[10px] text-white/20 ml-auto">
          {currentStep >= 0 ? `Step ${currentStep + 1} of ${moves.length}` : 'Click a move to start'}
        </span>
      </div>
    </div>
  );
}


function StepCard({ step, isExpanded, onToggle, gradient, labelColor }: {
  step: typeof beginnerSteps3x3[0];
  isExpanded: boolean;
  onToggle: () => void;
  gradient: string;
  labelColor: string;
}) {
  return (
    <motion.div
      layout
      className="card cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0`}>
          {step.step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
            <ChevronRight size={16} className={`text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
          <p className="text-sm text-white/50 mb-3">{step.desc}</p>
          <div className={`flex items-start gap-2 p-3 rounded-lg ${labelColor}/5 border ${labelColor}/10`}>
            <Info size={14} className={`${labelColor} shrink-0 mt-0.5`} />
            <p className={`text-xs ${labelColor}/80 font-mono`}>{step.tip}</p>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Detailed Explanation</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{step.detail}</p>
                </div>
                <AlgorithmViewer algorithm={step.algorithm} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'3x3' | '2x2' | '4x4' | '5x5' | 'videos'>('3x3');
  const [expanded3x3, setExpanded3x3] = useState<number | null>(null);
  const [expanded2x2, setExpanded2x2] = useState<number | null>(null);
  const [expanded4x4, setExpanded4x4] = useState<number | null>(null);
  const [expanded5x5, setExpanded5x5] = useState<number | null>(null);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20"
            >
              <BookOpen size={24} className="text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Learn to Solve</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Interactive step-by-step guides with algorithm steppers, plus ad-free video tutorials. Master 2×2 through 5×5!
          </p>
        </motion.div>
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
              <RotateCw size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Move Notation</h2>
              <p className="text-xs text-white/30">Master these before you begin</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="glass p-6">
            <p className="text-sm text-white/50 mb-4">
              Each letter represents a face of the cube. A letter alone means clockwise 90°.
              An apostrophe (&#39;) means counter-clockwise. A 2 means 180°.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {notations.map((n, i) => (
                <motion.div
                  key={n.move}
                  variants={fadeUp}
                  custom={i + 2}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors group"
                >
                  <span className="font-mono font-bold text-brand-400 text-lg w-8 group-hover:scale-110 transition-transform">{n.move}</span>
                  <span className="text-xs text-white/50">{n.desc}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs text-white/30 font-bold uppercase tracking-wider mb-3">Face Reference</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { face: 'U', name: 'Up', color: 'bg-white' },
                  { face: 'D', name: 'Down', color: 'bg-yellow-400' },
                  { face: 'F', name: 'Front', color: 'bg-green-500' },
                  { face: 'B', name: 'Back', color: 'bg-blue-500' },
                  { face: 'R', name: 'Right', color: 'bg-red-500' },
                  { face: 'L', name: 'Left', color: 'bg-orange-500' },
                ].map((f) => (
                  <div key={f.face} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded ${f.color}`} />
                    <span className="text-xs font-mono font-bold text-white/60">{f.face}</span>
                    <span className="text-[10px] text-white/30">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="flex rounded-xl bg-white/[0.04] p-1 gap-1 flex-wrap justify-center">
            {[
              { key: '2x2' as const, label: '2×2', steps: 3, icon: <Box size={14} />, gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
              { key: '3x3' as const, label: '3×3', steps: 7, icon: <Layers size={14} />, gradient: 'from-brand-500 to-purple-600', shadow: 'shadow-brand-500/20' },
              { key: '4x4' as const, label: '4×4', steps: 4, icon: <Grid3X3 size={14} />, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
              { key: '5x5' as const, label: '5×5', steps: 4, icon: <Grid3X3 size={14} />, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
              { key: 'videos' as const, label: 'Videos', steps: 0, icon: <Video size={14} />, gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 sm:px-5 py-2.5 text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow}`
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.steps > 0 && <span className="text-[10px] opacity-60">({tab.steps})</span>}
              </button>
            ))}
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          {activeTab === 'videos' ? (
            <motion.section key="videos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <Video size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Video Tutorials</h2>
                  <p className="text-xs text-white/30">Ad-free YouTube videos • Watch and learn</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {youtubeVideos.map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card group overflow-hidden !p-0">
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full rounded-t-2xl"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${video.gradient} text-white`}>{video.cube}</span>
                        <span className="text-[10px] text-white/30">{video.channel}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : activeTab === '4x4' ? (
            <motion.section key="4x4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><Grid3X3 size={20} /></div>
                <div><h2 className="text-2xl font-bold text-white">4×4 Reduction Method</h2><p className="text-xs text-white/30">Centers → Edges → 3×3 • 4 phases</p></div>
                <div className="ml-auto"><span className="stat-badge !bg-amber-500/10 !text-amber-400 !border-amber-500/20"><Award size={10} />Intermediate</span></div>
              </div>
              <div className="mb-6 glass p-3"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-white/30 font-bold uppercase">Progress</span></div><div className="flex gap-1">{beginnerSteps4x4.map((s) => (<button key={s.step} onClick={() => setExpanded4x4(expanded4x4 === s.step ? null : s.step)} className={`flex-1 h-2 rounded-full transition-all ${expanded4x4 !== null && s.step <= expanded4x4 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-white/[0.06]'}`} title={`Step ${s.step}: ${s.title}`} />))}</div></div>
              <div className="space-y-4">{beginnerSteps4x4.map((s) => (<StepCard key={s.step} step={s} isExpanded={expanded4x4 === s.step} onToggle={() => setExpanded4x4(expanded4x4 === s.step ? null : s.step)} gradient="from-amber-500 to-orange-500" labelColor="text-amber" />))}</div>
            </motion.section>
          ) : activeTab === '5x5' ? (
            <motion.section key="5x5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400"><Grid3X3 size={20} /></div>
                <div><h2 className="text-2xl font-bold text-white">5×5 Reduction Method</h2><p className="text-xs text-white/30">Centers → Tredges → 3×3 • 4 phases</p></div>
                <div className="ml-auto"><span className="stat-badge !bg-rose-500/10 !text-rose-400 !border-rose-500/20"><Award size={10} />Advanced</span></div>
              </div>
              <div className="mb-6 glass p-3"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-white/30 font-bold uppercase">Progress</span></div><div className="flex gap-1">{beginnerSteps5x5.map((s) => (<button key={s.step} onClick={() => setExpanded5x5(expanded5x5 === s.step ? null : s.step)} className={`flex-1 h-2 rounded-full transition-all ${expanded5x5 !== null && s.step <= expanded5x5 ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-white/[0.06]'}`} title={`Step ${s.step}: ${s.title}`} />))}</div></div>
              <div className="space-y-4">{beginnerSteps5x5.map((s) => (<StepCard key={s.step} step={s} isExpanded={expanded5x5 === s.step} onToggle={() => setExpanded5x5(expanded5x5 === s.step ? null : s.step)} gradient="from-rose-500 to-pink-500" labelColor="text-rose" />))}</div>
            </motion.section>
          ) : activeTab === '3x3' ? (
            <motion.section key="3x3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Layers size={20} /></div><div><h2 className="text-2xl font-bold text-white">3×3 Beginner Method</h2><p className="text-xs text-white/30">Layer-by-layer approach • 7 steps</p></div><div className="ml-auto"><span className="stat-badge"><Award size={10} />Beginner Friendly</span></div></div>
              <div className="mb-6 glass p-3"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-white/30 font-bold uppercase">Progress</span></div><div className="flex gap-1">{beginnerSteps3x3.map((s) => (<button key={s.step} onClick={() => setExpanded3x3(expanded3x3 === s.step ? null : s.step)} className={`flex-1 h-2 rounded-full transition-all ${expanded3x3 !== null && s.step <= expanded3x3 ? 'bg-gradient-to-r from-brand-500 to-purple-500' : 'bg-white/[0.06]'}`} title={`Step ${s.step}: ${s.title}`} />))}</div></div>
              <div className="space-y-4">{beginnerSteps3x3.map((s) => (<StepCard key={s.step} step={s} isExpanded={expanded3x3 === s.step} onToggle={() => setExpanded3x3(expanded3x3 === s.step ? null : s.step)} gradient="from-brand-500 to-purple-500" labelColor="text-brand" />))}</div>
            </motion.section>
          ) : (
            <motion.section key="2x2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400"><Box size={20} /></div><div><h2 className="text-2xl font-bold text-white">2×2 Beginner Method</h2><p className="text-xs text-white/30">Pocket cube • 3 steps</p></div><div className="ml-auto"><span className="stat-badge !bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20"><Award size={10} />Quick to Learn</span></div></div>
              <div className="mb-6 glass p-3"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] text-white/30 font-bold uppercase">Progress</span></div><div className="flex gap-1">{beginnerSteps2x2.map((s) => (<button key={s.step} onClick={() => setExpanded2x2(expanded2x2 === s.step ? null : s.step)} className={`flex-1 h-2 rounded-full transition-all ${expanded2x2 !== null && s.step <= expanded2x2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/[0.06]'}`} title={`Step ${s.step}: ${s.title}`} />))}</div></div>
              <div className="space-y-4">{beginnerSteps2x2.map((s) => (<StepCard key={s.step} step={s} isExpanded={expanded2x2 === s.step} onToggle={() => setExpanded2x2(expanded2x2 === s.step ? null : s.step)} gradient="from-green-500 to-emerald-500" labelColor="text-green" />))}</div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
