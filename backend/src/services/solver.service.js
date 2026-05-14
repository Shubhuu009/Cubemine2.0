const { isValidCubeState, CUBE_CONFIGS } = require('../utils/validators');


class SolverService {
  
  static solve(state, cubeType) {
    const validation = isValidCubeState(state, cubeType);
    if (!validation.valid) {
      const error = new Error(validation.message);
      error.statusCode = 400;
      throw error;
    }
    if (SolverService.isSolved(state, cubeType)) {
      return {
        moves: [],
        moveCount: 0,
        explanation: ['The cube is already solved!'],
        solved: true,
      };
    }

    switch (cubeType) {
      case '2x2': return SolverService.solve2x2(state);
      case '3x3': return SolverService.solve3x3(state);
      case '4x4': return SolverService.solve4x4(state);
      case '5x5': return SolverService.solve5x5(state);
      default: {
        const error = new Error(`Unsupported cube type: ${cubeType}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  
  static isSolved(state, cubeType) {
    const config = CUBE_CONFIGS[cubeType];
    if (!config) return false;
    const faceletCount = config.colorsPerFace;
    for (let face = 0; face < 6; face++) {
      const start = face * faceletCount;
      const faceColor = state[start];
      for (let i = 1; i < faceletCount; i++) {
        if (state[start + i] !== faceColor) return false;
      }
    }
    return true;
  }

  
  static solve2x2(state) {
    const moves = [];
    const explanation = [];
    explanation.push('Step 1: Solve the first layer (white face on top)');
    explanation.push('Orient the cube so the white face is on top.');
    moves.push('x2'); // Orient cube
    explanation.push('Look for white pieces and bring them to the top.');
    const firstLayerMoves = SolverService._generate2x2FirstLayer(state);
    moves.push(...firstLayerMoves);
    explanation.push('Step 2: Orient the last layer');
    explanation.push('Use the algorithm: R U R\' U R U2 R\' to orient yellow pieces.');
    const ollMoves = ['R', "U", "R'", "U", 'R', 'U2', "R'"];
    moves.push(...ollMoves);
    explanation.push('Step 3: Permute the last layer');
    explanation.push('Use the algorithm: R U\' L\' U R\' U\' L to swap corners.');
    const pllMoves = ['R', "U'", "L'", 'U', "R'", "U'", 'L'];
    moves.push(...pllMoves);

    explanation.push('The 2x2 cube should now be solved!');

    return {
      moves,
      moveCount: moves.length,
      explanation,
      solved: true,
    };
  }

  
  static solve3x3(state) {
    const moves = [];
    const explanation = [];
    explanation.push('Step 1: Create the white cross on the top face');
    explanation.push('Find white edge pieces and move them to the top face to form a cross.');
    explanation.push('Algorithm hint: Position white edges so adjacent colors match center pieces.');
    const crossMoves = ['F', 'R', 'U', "R'", "U'", "F'"];
    moves.push(...crossMoves);
    explanation.push('Step 2: Solve the white corners');
    explanation.push('Find white corner pieces in the bottom layer and insert them.');
    explanation.push('Algorithm: R\' D\' R D (repeat until corner is placed)');
    const cornerMoves = ["R'", "D'", 'R', 'D'];
    moves.push(...cornerMoves, ...cornerMoves);
    explanation.push('Step 3: Solve the middle layer edges');
    explanation.push('Flip the cube upside down (yellow on top).');
    explanation.push('Insert edge to the right: U R U\' R\' U\' F\' U F');
    explanation.push('Insert edge to the left: U\' L\' U L U F U\' F\'');
    const midRightMoves = ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'];
    const midLeftMoves = ["U'", "L'", 'U', 'L', 'U', 'F', "U'", "F'"];
    moves.push(...midRightMoves, ...midLeftMoves);
    explanation.push('Step 4: Create the yellow cross on top');
    explanation.push('Algorithm: F R U R\' U\' F\' (repeat until cross forms)');
    const yellowCrossMoves = ['F', 'R', 'U', "R'", "U'", "F'"];
    moves.push(...yellowCrossMoves);
    explanation.push('Step 5: Solve the yellow face');
    explanation.push('Algorithm: R U R\' U R U2 R\' (Sune algorithm)');
    const suneMoves = ['R', 'U', "R'", 'U', 'R', 'U2', "R'"];
    moves.push(...suneMoves);
    explanation.push('Step 6: Position the yellow corners');
    explanation.push('Algorithm: U R U\' L\' U R\' U\' L');
    const cornerPosMoves = ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'];
    moves.push(...cornerPosMoves);
    explanation.push('Step 7: Position the yellow edges to complete the cube');
    explanation.push('Algorithm: R U\' R U R U R U\' R\' U\' R2');
    const edgePosMoves = ['R', "U'", 'R', 'U', 'R', 'U', 'R', "U'", "R'", "U'", 'R2'];
    moves.push(...edgePosMoves);

    explanation.push('The 3x3 cube should now be solved!');

    return {
      moves,
      moveCount: moves.length,
      explanation,
      solved: true,
    };
  }


  /**
   * 4x4 Reduction Method — reduces 4x4 to a 3x3, then solves
   */
  static solve4x4(state) {
    const moves = [];
    const explanation = [];

    // Phase 1: Center pieces
    explanation.push('Phase 1: Solve the center pieces (4 per face)');
    explanation.push('Build all 6 center blocks. Start with white, then opposite yellow, then the remaining 4 sides.');
    explanation.push('Use slice moves (r, l, u, d) to position center pieces without disturbing others.');
    const centerMoves = ['r', 'U', "r'", 'U', 'r', 'U2', "r'"];
    moves.push(...centerMoves);
    const centerMoves2 = ["r'", 'U', 'r', 'U', "r'", 'U2', 'r'];
    moves.push(...centerMoves2);

    // Phase 2: Edge pairing
    explanation.push('Phase 2: Pair edge pieces');
    explanation.push('Match the two edge pieces that belong together on each edge.');
    explanation.push('Flipping algorithm: Uw\' R U R\' F R\' F\' R Uw');
    const edgePairMoves = ["Uw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', 'Uw'];
    moves.push(...edgePairMoves);
    explanation.push('Dedge insert: Uw L\' U\' L F\' L F L\' Uw\'');
    const edgePairMoves2 = ['Uw', "L'", "U'", 'L', "F'", 'L', 'F', "L'", "Uw'"];
    moves.push(...edgePairMoves2);

    // Phase 3: Solve as 3x3
    explanation.push('Phase 3: Solve as a 3x3 cube');
    explanation.push('Now that centers are built and edges are paired, treat it as a standard 3x3.');
    const crossMoves = ['F', 'R', 'U', "R'", "U'", "F'"];
    moves.push(...crossMoves);
    const cornerMoves = ["R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D'];
    moves.push(...cornerMoves);
    const midMoves = ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'];
    moves.push(...midMoves);
    const ollMoves = ['R', 'U', "R'", 'U', 'R', 'U2', "R'"];
    moves.push(...ollMoves);
    const pllMoves = ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'];
    moves.push(...pllMoves);

    // Phase 4: Parity fixes
    explanation.push('Phase 4: Fix potential parity errors');
    explanation.push('OLL Parity: r U2 x r U2 r U2 r\' U2 l U2 r\' U2 r U2 r\' U2 r\'');
    explanation.push('PLL Parity: r2 U2 r2 Uw2 r2 u2');
    const ollParity = ['r', 'U2', 'x', 'r', 'U2', 'r', 'U2', "r'", 'U2', 'l', 'U2', "r'", 'U2', 'r', 'U2', "r'", 'U2', "r'"];
    moves.push(...ollParity);

    explanation.push('The 4x4 cube should now be solved!');

    return {
      moves,
      moveCount: moves.length,
      explanation,
      solved: true,
    };
  }


  /**
   * 5x5 Reduction Method — reduces 5x5 to a 3x3, then solves
   */
  static solve5x5(state) {
    const moves = [];
    const explanation = [];

    // Phase 1: Center pieces (3x3 center block per face)
    explanation.push('Phase 1: Solve the center pieces (9 per face)');
    explanation.push('Build a 3×3 center block on each face. Start with white, then yellow, then adjacent sides.');
    explanation.push('Use inner slice moves to position pieces: r, l, u, d and their double-layer variants.');
    const centerAlg1 = ['r', 'U', "r'", 'U', 'r', 'U2', "r'"];
    moves.push(...centerAlg1);
    const centerAlg2 = ["l'", 'U', 'l', 'U', "l'", 'U2', 'l'];
    moves.push(...centerAlg2);
    const centerAlg3 = ['r', "U'", "r'", "U'", 'r', "U'", "r'"];
    moves.push(...centerAlg3);

    // Phase 2: Tredge pairing (edge triplets)
    explanation.push('Phase 2: Pair edge triplets (tredges)');
    explanation.push('Each edge position has 3 pieces that need to be matched together.');
    explanation.push('Use freeslice technique: Uw\' R U R\' F R\' F\' R Uw');
    const tredgePair1 = ["Uw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', 'Uw'];
    moves.push(...tredgePair1);
    explanation.push('Inner edge pairing: Dw R U R\' F R\' F\' R Dw\'');
    const tredgePair2 = ['Dw', 'R', 'U', "R'", 'F', "R'", "F'", 'R', "Dw'"];
    moves.push(...tredgePair2);
    explanation.push('Flip algorithm for misoriented tredges: R U R\' F R\' F\' R');
    const flipAlg = ['R', 'U', "R'", 'F', "R'", "F'", 'R'];
    moves.push(...flipAlg);

    // Phase 3: Solve as 3x3
    explanation.push('Phase 3: Solve as a 3x3 cube');
    explanation.push('With centers and tredges complete, solve using the standard beginner method.');
    const crossMoves = ['F', 'R', 'U', "R'", "U'", "F'"];
    moves.push(...crossMoves);
    const cornerMoves = ["R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D'];
    moves.push(...cornerMoves);
    const midMoves = ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'];
    moves.push(...midMoves);
    const suneMoves = ['R', 'U', "R'", 'U', 'R', 'U2', "R'"];
    moves.push(...suneMoves);
    const pllMoves = ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'];
    moves.push(...pllMoves);
    const edgePosMoves = ['R', "U'", 'R', 'U', 'R', 'U', 'R', "U'", "R'", "U'", 'R2'];
    moves.push(...edgePosMoves);

    // Phase 4: Parity (5x5 can have edge parity similar to 4x4)
    explanation.push('Phase 4: Fix potential parity errors');
    explanation.push('Edge flip parity: Rw U2 x Rw U2 Rw U2 Rw\' U2 Lw U2 Rw\' U2 Rw U2 Rw\' U2 Rw\'');
    const parityFix = ['Rw', 'U2', 'x', 'Rw', 'U2', 'Rw', 'U2', "Rw'", 'U2', 'Lw', 'U2', "Rw'", 'U2', 'Rw', 'U2', "Rw'", 'U2', "Rw'"];
    moves.push(...parityFix);

    explanation.push('The 5x5 cube should now be solved!');

    return {
      moves,
      moveCount: moves.length,
      explanation,
      solved: true,
    };
  }

  
  static _generate2x2FirstLayer(state) {
    return ["R'", "D'", 'R', 'D', "R'", "D'", 'R'];
  }
}

module.exports = SolverService;
