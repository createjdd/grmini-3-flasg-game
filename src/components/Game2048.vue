<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const grid = ref([])
const score = ref(0)
const bestScore = ref(localStorage.getItem('2048-best') || 0)
const gameOver = ref(false)

const initGrid = () => {
  grid.value = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0))
  score.ref = 0
  gameOver.value = false
  addRandomTile()
  addRandomTile()
}

const addRandomTile = () => {
  const emptyCells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid.value[r][c] === 0) emptyCells.push({ r, c })
    }
  }
  if (emptyCells.length > 0) {
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    grid.value[r][c] = Math.random() < 0.9 ? 2 : 4
  }
}

const move = (direction) => {
  if (gameOver.value) return
  let moved = false
  const newGrid = JSON.parse(JSON.stringify(grid.value))

  const rotate = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse())

  // Normalize direction to "Left"
  let rotations = 0
  if (direction === 'up') rotations = 3
  if (direction === 'right') rotations = 2
  if (direction === 'down') rotations = 1

  let tempGrid = newGrid
  for (let i = 0; i < rotations; i++) tempGrid = rotate(tempGrid)

  // Move left logic
  for (let r = 0; r < 4; r++) {
    let row = tempGrid[r].filter((v) => v !== 0)
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2
        score.value += row[i]
        row.splice(i + 1, 1)
        moved = true
      }
    }
    const newRow = row.concat(Array(4 - row.length).fill(0))
    if (JSON.stringify(tempGrid[r]) !== JSON.stringify(newRow)) moved = true
    tempGrid[r] = newRow
  }

  // Rotate back
  for (let i = 0; i < (4 - rotations) % 4; i++) tempGrid = rotate(tempGrid)

  if (moved) {
    grid.value = tempGrid
    addRandomTile()
    checkGameOver()
    if (score.value > bestScore.value) {
      bestScore.value = score.value
      localStorage.setItem('2048-best', bestScore.value)
    }
  }
}

const checkGameOver = () => {
  // Check for empty cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid.value[r][c] === 0) return
    }
  }
  // Check for adjacent same values
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (r < 3 && grid.value[r][c] === grid.value[r + 1][c]) return
      if (c < 3 && grid.value[r][c] === grid.value[r][c + 1]) return
    }
  }
  gameOver.value = true
}

const handleKeyDown = (e) => {
  const keys = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
  }
  if (keys[e.key]) {
    e.preventDefault()
    move(keys[e.key])
  }
}

onMounted(() => {
  initGrid()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const getTileClass = (val) => {
  if (val === 0) return 'bg-white/5'
  const colors = {
    2: 'bg-slate-200 text-slate-800',
    4: 'bg-slate-300 text-slate-800',
    8: 'bg-orange-200 text-slate-800 shadow-[0_0_15px_rgba(251,146,60,0.5)]',
    16: 'bg-orange-300 text-white shadow-[0_0_15px_rgba(251,146,60,0.6)]',
    32: 'bg-orange-400 text-white shadow-[0_0_20px_rgba(251,146,60,0.7)]',
    64: 'bg-orange-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.8)]',
    128: 'bg-yellow-200 text-slate-800 text-2xl shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    256: 'bg-yellow-300 text-white text-2xl shadow-[0_0_25px_rgba(234,179,8,0.6)]',
    512: 'bg-yellow-400 text-white text-2xl shadow-[0_0_30px_rgba(234,179,8,0.7)]',
    1024: 'bg-yellow-500 text-white text-xl shadow-[0_0_30px_rgba(234,179,8,0.8)]',
    2048: 'bg-yellow-600 text-white text-xl shadow-[0_0_35px_rgba(234,179,8,0.9)]',
  }
  return colors[val] || 'bg-slate-800 text-white'
}
</script>

<template>
  <div class="game-container flex flex-col items-center gap-6 p-4">
    <div class="header w-full max-w-400px flex justify-between items-center">
      <div class="score-boxes flex gap-2">
        <div class="bg-white/10 px-4 py-2 rounded-xl text-center min-w-80px">
          <div class="text-0.7rem text-slate-400 uppercase">Score</div>
          <div class="text-1.2rem font-700 tracking-wider">{{ score }}</div>
        </div>
        <div class="bg-white/10 px-4 py-2 rounded-xl text-center min-w-80px">
          <div class="text-0.7rem text-slate-400 uppercase">Best</div>
          <div class="text-1.2rem font-700 tracking-wider text-yellow-500">{{ bestScore }}</div>
        </div>
      </div>
      <el-button type="warning" round @click="initGrid">Restart</el-button>
    </div>

    <div class="board-wrapper relative">
      <div class="board bg-white/5 p-3 rounded-2xl grid grid-cols-4 gap-3 w-360px h-360px md:(w-400px h-400px)">
        <template v-for="(row, r) in grid" :key="'row-' + r">
          <div
            v-for="(cell, c) in row"
            :key="r + '-' + c"
            class="tile flex items-center justify-center rounded-xl font-800 text-3xl transition-all duration-150 transform"
            :class="getTileClass(cell)"
          >
            {{ cell === 0 ? '' : cell }}
          </div>
        </template>
      </div>

      <transition name="fade">
        <div
          v-if="gameOver"
          class="absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-4 z-10"
        >
          <h2 class="text-4xl font-bold text-white tracking-widest">GAME OVER</h2>
          <p class="text-slate-300">Final Score: {{ score }}</p>
          <el-button type="primary" size="large" round @click="initGrid">Try Again</el-button>
        </div>
      </transition>
    </div>

    <div class="controls text-slate-400 text-sm hidden md:block">
      Use <b>Arrow Keys</b> or <b>WASD</b> to move tiles
    </div>
  </div>
</template>

<style scoped>
.game-container {
  font-family: 'Inter', sans-serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tile {
  user-select: none;
}
</style>
