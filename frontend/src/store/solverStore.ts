import { create } from 'zustand';
import { CubeColor, CubeType, SolveResponse } from '@/types';
import { solverAPI } from '@/services/api';

interface SolverState {
  cubeType: CubeType;
  state: CubeColor[];
  selectedColor: CubeColor;
  result: SolveResponse['data'] | null;
  isLoading: boolean;
  error: string | null;

  setCubeType: (type: CubeType) => void;
  setCubeState: (state: CubeColor[]) => void;
  setFacelet: (index: number, color: CubeColor) => void;
  setSelectedColor: (color: CubeColor) => void;
  resetCube: () => void;
  solveCube: () => Promise<void>;
  clearResult: () => void;
}

/** Grid size per cube type */
const GRID_SIZES: Record<CubeType, number> = {
  '2x2': 2,
  '3x3': 3,
  '4x4': 4,
  '5x5': 5,
};

const createEmptyState = (type: CubeType): CubeColor[] => {
  const gridSize = GRID_SIZES[type];
  const size = 6 * gridSize * gridSize; // 6 faces × n² facelets
  return Array.from({ length: size }, () => 'W');
};

export const useSolverStore = create<SolverState>((set, get) => ({
  cubeType: '3x3',
  state: createEmptyState('3x3'),
  selectedColor: 'W',
  result: null,
  isLoading: false,
  error: null,

  setCubeType: (type) => {
    set({ cubeType: type, state: createEmptyState(type), result: null, error: null });
  },

  setCubeState: (state) => {
    set({ state, result: null, error: null });
  },

  setFacelet: (index, color) => {
    const newState = [...get().state];
    newState[index] = color;
    set({ state: newState });
  },

  setSelectedColor: (color) => set({ selectedColor: color }),

  resetCube: () => {
    set({ state: createEmptyState(get().cubeType), result: null, error: null });
  },

  solveCube: async () => {
    set({ isLoading: true, error: null, result: null });
    try {
      const { cubeType, state } = get();
      const res = await solverAPI.solve({ cubeType, state });
      set({ result: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearResult: () => set({ result: null, error: null }),
}));
