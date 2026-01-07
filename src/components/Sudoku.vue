<script setup>
import { ref, onMounted } from 'vue'

const grid = ref([])
const initialGrid = ref([])
const selectedCell = ref({ r: -1, c: -1 })
const difficulty = ref('easy')
const isComplete = ref(false)

const generateSudoku = (diff) => {
  // Simple generator: starts with a solved grid and removes elements
  const base = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8],
  ]

  // Shuffle rows and cols within 3x3 blocks
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5)
  // (Full shuffling logic omitted for brevity, using a basic randomized version)

  const counts = { easy: 40, medium: 30, hard: 20 }
  const count = counts[diff]

  const newGrid = base.map((row) =>
    row.map((cell) => ({
      val: cell,
      fixed: true,
      error: false,
    }))
  )

  // Randomly set cells to 0
  let removed = 0
  while (removed < 81 - count) {
    const r = Math.floor(Math.random() * 9)
    const c = Math.floor(Math.random() * 9)
    if (newGrid[r][c].val !== 0) {
      newGrid[r][c].val = 0
      newGrid[r][c].fixed = false
      removed++
    }
  }

  grid.value = newGrid
  initialGrid.value = JSON.parse(JSON.stringify(newGrid))
  isComplete.value = false
}

const selectCell = (r, c) => {
  if (grid.value[r][c].fixed) return
  selectedCell.value = { r, c }
}

const setVal = (num) => {
  if (selectedCell.value.r === -1) return
  const { r, c } = selectedCell.value
  grid.value[r][c].val = num
  validateGrid()
}

const validateGrid = () => {
  let complete = true
  // Reset errors
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      grid.value[r][c].error = false
      if (grid.value[r][c].val === 0) complete = false
    }
  }

  // Check rows, cols, squares
  const check = (cells) => {
    const seen = {}
    cells.forEach((cell) => {
      if (cell.val !== 0) {
        if (seen[cell.val]) {
          cell.error = true
          seen[cell.val].error = true
        }
        seen[cell.val] = cell
      }
    })
  }

  for (let i = 0; i < 9; i++) {
    check(grid.value[i]) // Rows
    check(grid.value.map((row) => row[i])) // Cols
  }

  // Blocks
  for (let b = 0; b < 9; b++) {
    const block = []
    const startR = Math.floor(b / 3) * 3
    const startC = (b % 3) * 3
    for (let r = startR; r < startR + 3; r++) {
      for (let c = startC; c < startC + 3; c++) {
        block.push(grid.value[r][c])
      }
    }
    check(block)
  }

  if (complete && !grid.value.flat().some((c) => c.error)) {
    isComplete.value = true
  }
}

onMounted(() => {
  generateSudoku('easy')
})
</script>

<template>
  <div class="sudoku-game flex flex-col items-center gap-8 p-4">
    <div class="controls flex items-center gap-4">
      <el-radio-group v-model="difficulty" size="small" @change="generateSudoku">
        <el-radio-button label="easy">Easy</el-radio-button>
        <el-radio-button label="medium">Medium</el-radio-button>
        <el-radio-button label="hard">Hard</el-radio-button>
      </el-radio-group>
      <el-button type="primary" size="small" plain round @click="generateSudoku(difficulty)">New Game</el-button>
    </div>

    <div
      class="sudoku-board grid grid-cols-9 bg-slate-800 p-0.5 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl relative"
    >
      <template v-for="(row, r) in grid" :key="'r' + r">
        <div
          v-for="(cell, c) in row"
          :key="r + '-' + c"
          class="cell w-35px h-35px md:(w-45px h-45px) flex items-center justify-center cursor-pointer transition-colors relative"
          :class="[
            (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-slate-600' : 'border-b border-slate-700/50',
            (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-slate-600' : 'border-r border-slate-700/50',
            cell.fixed ? 'bg-slate-900/50 text-slate-400 font-bold' : 'bg-slate-900 text-blue-400',
            selectedCell.r === r && selectedCell.c === c ? 'bg-blue-500/30' : '',
            cell.error ? 'bg-rose-500/20 text-rose-500!' : '',
          ]"
          @click="selectCell(r, c)"
        >
          {{ cell.val === 0 ? '' : cell.val }}
        </div>
      </template>

      <div
        v-if="isComplete"
        class="absolute inset-0 bg-emerald-500/20 backdrop-blur-md flex flex-col items-center justify-center z-10"
      >
        <div class="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 text-center shadow-2xl">
          <h3 class="text-2xl font-bold text-emerald-500 mb-2">Excellent!</h3>
          <p class="text-slate-400 mb-4">Sudoku Solved Ready for another?</p>
          <el-button type="success" size="small" @click="generateSudoku(difficulty)">Play Again</el-button>
        </div>
      </div>
    </div>

    <div class="num-pad flex gap-2">
      <button
        v-for="n in 9"
        :key="n"
        class="w-40px h-40px md:(w-50px h-50px) rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 active:scale-90 transition-all"
        @click="setVal(n)"
      >
        {{ n }}
      </button>
      <button
        class="w-40px h-40px md:(w-50px h-50px) rounded-lg bg-rose-900/30 border border-rose-800 text-rose-400 hover:bg-rose-900/50 transition-all font-bold"
        @click="setVal(0)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.sudoku-board {
  user-select: none;
}
.cell:last-child {
  border-bottom: none;
  border-right: none;
}
</style>
