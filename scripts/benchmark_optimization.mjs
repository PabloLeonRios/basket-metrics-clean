// scripts/benchmark_optimization.mjs
const N = 1000; // Number of players

// Mock data
const allPlayers = Array.from({ length: N }, (_, i) => ({
  _id: `id_${i}`,
  name: `Player ${i}`,
}));

const careerAverages = allPlayers.map((p) => ({
  _id: p._id,
  avgPoints: Math.random() * 20,
}));

// Function to measure
function originalLogic() {
  return allPlayers.map((player) => {
    // Simulating .equals behavior with string comparison for mock
    const pStats = careerAverages.find((stat) => stat._id === player._id);
    return {
      _id: player._id.toString(),
      name: player.name,
      careerAverages: pStats || null,
    };
  });
}

function optimizedLogic() {
  const statsMap = new Map();
  careerAverages.forEach((stat) => {
    statsMap.set(stat._id.toString(), stat);
  });

  return allPlayers.map((player) => {
    const pStats = statsMap.get(player._id.toString());
    return {
      _id: player._id.toString(),
      name: player.name,
      careerAverages: pStats || null,
    };
  });
}

console.log(`Running benchmark with N=${N} players...`);

const startOriginal = performance.now();
const resOriginal = originalLogic();
const endOriginal = performance.now();
console.log(`Original Logic: ${(endOriginal - startOriginal).toFixed(4)}ms`);

const startOptimized = performance.now();
const resOptimized = optimizedLogic();
const endOptimized = performance.now();
console.log(`Optimized Logic: ${(endOptimized - startOptimized).toFixed(4)}ms`);

// Basic verification
if (resOriginal.length !== resOptimized.length)
  throw new Error('Length mismatch');
for (let i = 0; i < resOriginal.length; i++) {
  if (resOriginal[i]._id !== resOptimized[i]._id)
    throw new Error(`ID mismatch at ${i}`);
  if (
    resOriginal[i].careerAverages?._id.toString() !==
    resOptimized[i].careerAverages?._id.toString()
  ) {
    throw new Error(`Stat ID mismatch at ${i}`);
  }
}
console.log('Verification successful: Results are identical.');
