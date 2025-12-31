<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
}

const currentDifficulty = ref('easy')
const gameState = ref('ready') // ready, playing, won, lost
const timer = ref(0)
const mineCount = ref(0)
const flagCount = ref(0)
let timerInterval = null

const grid = ref([])

const initGame = () => {
  const { rows, cols, mines } = difficulties[currentDifficulty.value]
  mineCount.value = mines
  flagCount.value = 0
  timer.value = 0
  gameState.value = 'ready'
  clearInterval(timerInterval)

  grid.value = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  )
}

const startGame = (firstR, firstC) => {
  const { rows, cols, mines } = difficulties[currentDifficulty.value]
  let minesPlaced = 0
  while (minesPlaced < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!grid.value[r][c].isMine && (r !== firstR || c !== firstC)) {
      grid.value[r][c].isMine = true
      minesPlaced++
    }
  }

  // Calculate neighbor mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid.value[r][c].isMine) {
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid.value[nr][nc].isMine) {
              count++
            }
          }
        }
        grid.value[r][c].neighborMines = count
      }
    }
  }

  gameState.value = 'playing'
  timerInterval = setInterval(() => {
    timer.value++
  }, 1000)
}

const reveal = (r, c) => {
  if (
    gameState.value === 'lost' ||
    gameState.value === 'won' ||
    grid.value[r][c].isFlagged ||
    grid.value[r][c].isRevealed
  )
    return

  if (gameState.value === 'ready') {
    startGame(r, c)
  }

  const cell = grid.value[r][c]
  cell.isRevealed = true

  if (cell.isMine) {
    endGame(false)
    return
  }

  if (cell.neighborMines === 0) {
    const { rows, cols } = difficulties[currentDifficulty.value]
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          reveal(nr, nc)
        }
      }
    }
  }

  checkWin()
}

const toggleFlag = (e, r, c) => {
  e.preventDefault()
  if (gameState.value !== 'playing' && gameState.value !== 'ready') return
  const cell = grid.value[r][c]
  if (cell.isRevealed) return

  cell.isFlagged = !cell.isFlagged
  flagCount.value += cell.isFlagged ? 1 : -1
}

const checkWin = () => {
  const { rows, cols, mines } = difficulties[currentDifficulty.value]
  let revealedCount = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid.value[r][c].isRevealed) revealedCount++
    }
  }

  if (revealedCount === rows * cols - mines) {
    endGame(true)
  }
}

const endGame = (isWin) => {
  gameState.value = isWin ? 'won' : 'lost'
  clearInterval(timerInterval)

  // Reveal all mines if lost
  if (!isWin) {
    grid.value.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isMine) cell.isRevealed = true
      })
    )
    ElMessage.error('游戏结束，你踩到地雷了！')
  } else {
    ElMessage.success(`恭喜！你赢了！用时 ${timer.value} 秒`)
  }
}

watch(currentDifficulty, () => {
  initGame()
})

onMounted(() => {
  initGame()
})

const getCellClass = (cell) => {
  return {
    cell: true,
    revealed: cell.isRevealed,
    mine: cell.isRevealed && cell.isMine,
    flagged: cell.isFlagged && !cell.isRevealed,
    [`mines-${cell.neighborMines}`]: cell.isRevealed && !cell.isMine && cell.neighborMines > 0,
  }
}
</script>

<template>
  <div class="minesweeper-container">
    <div class="game-header">
      <el-radio-group v-model="currentDifficulty" size="small">
        <el-radio-button label="easy">初级</el-radio-button>
        <el-radio-button label="medium">中级</el-radio-button>
        <el-radio-button label="hard">高级</el-radio-button>
      </el-radio-group>

      <div class="stats">
        <div class="stat-item">
          <span class="label">🚩</span>
          <span class="value">{{ mineCount - flagCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">⏱️</span>
          <span class="value">{{ timer }}</span>
        </div>
      </div>

      <el-button type="primary" size="small" @click="initGame">重新开始</el-button>
    </div>

    <div class="grid-scroll-wrapper">
      <div
        class="grid"
        :style="{
          gridTemplateRows: `repeat(${difficulties[currentDifficulty].rows}, 30px)`,
          gridTemplateColumns: `repeat(${difficulties[currentDifficulty].cols}, 30px)`,
        }"
      >
        <template v-for="(row, r) in grid" :key="r">
          <div
            v-for="(cell, c) in row"
            :key="c"
            :class="getCellClass(cell)"
            @click="reveal(r, c)"
            @contextmenu="toggleFlag($event, r, c)"
          >
            <span v-if="cell.isRevealed && cell.isMine">💣</span>
            <span v-else-if="cell.isRevealed && cell.neighborMines > 0">{{ cell.neighborMines }}</span>
            <span v-else-if="cell.isFlagged && !cell.isRevealed">🚩</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.minesweeper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px;
  user-select: none;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stats {
  display: flex;
  gap: 20px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 1.2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.grid-scroll-wrapper {
  max-width: 90vw;
  max-height: 70vh;
  overflow: auto;
  border: 4px solid #dcdfe6;
  border-radius: 4px;
}

.grid {
  display: grid;
  gap: 1px;
  background-color: #909399;
  padding: 1px;
}

.cell {
  width: 30px;
  height: 30px;
  background-color: #c0c4cc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.1s;
  box-shadow: inset 2px 2px 0 #ebeef5, inset -2px -2px 0 #909399;
}

.cell:hover:not(.revealed) {
  background-color: #dcdfe6;
}

.cell.revealed {
  background-color: #ebeef5;
  box-shadow: none;
  cursor: default;
}

.cell.mine {
  background-color: #f56c6c;
}

.cell.flagged {
  color: #f56c6c;
}

.mines-1 {
  color: #409eff;
}
.mines-2 {
  color: #67c23a;
}
.mines-3 {
  color: #f56c6c;
}
.mines-4 {
  color: #9c27b0;
}
.mines-5 {
  color: #ff9800;
}
.mines-6 {
  color: #00bcd4;
}
.mines-7 {
  color: #3f51b5;
}
.mines-8 {
  color: #000000;
}
</style>
