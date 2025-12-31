<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const BOARD_SIZE = 15
const board = ref(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))) // 0: empty, 1: black, 2: white
const currentPlayer = ref(1) // 1: black, 2: white
const gameOver = ref(false)
const lastMove = ref(null)

const resetGame = () => {
  board.value = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
  currentPlayer.value = 1
  gameOver.value = false
  lastMove.value = null
}

const placePiece = (r, c) => {
  if (gameOver.value || board.value[r][c] !== 0) return

  board.value[r][c] = currentPlayer.value
  lastMove.value = { r, c }

  if (checkWin(r, c)) {
    gameOver.value = true
    ElMessage.success(`${currentPlayer.value === 1 ? '黑棋' : '白棋'} 获胜！`)
    return
  }

  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1
}

const checkWin = (r, c) => {
  const p = board.value[r][c]
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ]

  for (const [dr, dc] of directions) {
    let count = 1

    // Check one direction
    let nr = r + dr
    let nc = c + dc
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board.value[nr][nc] === p) {
      count++
      nr += dr
      nc += dc
    }

    // Check opposite direction
    nr = r - dr
    nc = c - dc
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board.value[nr][nc] === p) {
      count++
      nr -= dr
      nc -= dc
    }

    if (count >= 5) return true
  }
  return false
}
</script>

<template>
  <div class="gobang-container">
    <div class="game-info">
      <div class="status">
        <span class="label">当前回合:</span>
        <div :class="['piece-indicator', currentPlayer === 1 ? 'black' : 'white']"></div>
        <span class="value">{{ currentPlayer === 1 ? '黑棋' : '白棋' }}</span>
      </div>
      <el-button type="primary" size="small" @click="resetGame">重新开始</el-button>
    </div>

    <div class="board-wrapper">
      <div class="board">
        <!-- Vertical and Horizontal lines -->
        <div class="lines">
          <div v-for="i in BOARD_SIZE" :key="'h' + i" class="h-line" :style="{ top: (i - 1) * 30 + 15 + 'px' }"></div>
          <div v-for="i in BOARD_SIZE" :key="'v' + i" class="v-line" :style="{ left: (i - 1) * 30 + 15 + 'px' }"></div>
        </div>

        <!-- Star points (standard gobang marks) -->
        <div class="stars">
          <div class="star" style="top: 105px; left: 105px"></div>
          <div class="star" style="top: 105px; left: 345px"></div>
          <div class="star" style="top: 225px; left: 225px"></div>
          <div class="star" style="top: 345px; left: 105px"></div>
          <div class="star" style="top: 345px; left: 345px"></div>
        </div>

        <div class="cells">
          <div v-for="r in BOARD_SIZE" :key="'r' + r" class="row">
            <div v-for="c in BOARD_SIZE" :key="'c' + c" class="cell" @click="placePiece(r - 1, c - 1)">
              <div
                v-if="board[r - 1][c - 1] !== 0"
                :class="[
                  'piece',
                  board[r - 1][c - 1] === 1 ? 'black' : 'white',
                  lastMove?.r === r - 1 && lastMove?.c === c - 1 ? 'last' : '',
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gobang-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 480px;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.piece-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.piece-indicator.black {
  background: #000;
}
.piece-indicator.white {
  background: #fff;
  border: 1px solid #ccc;
}

.board-wrapper {
  background: #e6b34d;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.1);
}

.board {
  position: relative;
  width: 450px;
  height: 450px;
}

.lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.h-line {
  position: absolute;
  left: 15px;
  right: 15px;
  height: 1px;
  background: #333;
}

.v-line {
  position: absolute;
  top: 15px;
  bottom: 15px;
  width: 1px;
  background: #333;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.cells {
  position: relative;
  width: 100%;
  height: 100%;
}

.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1;
}

.piece {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #444, #000);
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
}

.piece.last::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #f56c6c;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>
