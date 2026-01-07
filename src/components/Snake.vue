<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const canvas = ref(null)
const score = ref(0)
const bestScore = ref(localStorage.getItem('snake-best') || 0)
const isPlaying = ref(false)
const gameOver = ref(false)

let ctx = null
let gameLoop = null
const gridSize = 20
let snake = [{ x: 10, y: 10 }]
let food = { x: 15, y: 15 }
let dx = 1
let dy = 0
let nextDx = 1
let nextDy = 0

const initGame = () => {
  score.value = 0
  gameOver.value = false
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]
  dx = 1
  dy = 0
  nextDx = 1
  nextDy = 0
  spawnFood()
  isPlaying.value = true
  startGameLoop()
}

const spawnFood = () => {
  food = {
    x: Math.floor(Math.random() * (canvas.value.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.value.height / gridSize)),
  }
}

const draw = () => {
  if (!ctx) return

  // Clear canvas
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw grid (subtle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < canvas.value.width; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvas.value.height)
    ctx.stroke()
  }
  for (let i = 0; i < canvas.value.height; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(canvas.value.width, i)
    ctx.stroke()
  }

  // Draw Food
  ctx.shadowBlur = 15
  ctx.shadowColor = '#f43f5e'
  ctx.fillStyle = '#fb7185'
  ctx.beginPath()
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2)
  ctx.fill()

  // Draw Snake
  ctx.shadowBlur = 10
  ctx.shadowColor = '#10b981'
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#34d399' : '#059669'
    ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2)
  })

  ctx.shadowBlur = 0
}

const update = () => {
  dx = nextDx
  dy = nextDy

  const head = { x: snake[0].x + dx, y: snake[0].y + dy }

  // Wall collision
  if (head.x < 0 || head.x >= canvas.value.width / gridSize || head.y < 0 || head.y >= canvas.value.height / gridSize) {
    endGame()
    return
  }

  // Self collision
  if (snake.some((part) => part.x === head.x && part.y === head.y)) {
    endGame()
    return
  }

  snake.unshift(head)

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    spawnFood()
    if (score.value > bestScore.value) {
      bestScore.value = score.value
      localStorage.setItem('snake-best', bestScore.value)
    }
  } else {
    snake.pop()
  }
}

const startGameLoop = () => {
  if (gameLoop) clearInterval(gameLoop)
  gameLoop = setInterval(() => {
    update()
    draw()
  }, 100)
}

const endGame = () => {
  clearInterval(gameLoop)
  isPlaying.value = false
  gameOver.value = true
}

const handleKeyDown = (e) => {
  if (e.key === 'ArrowUp' && dy === 0) {
    nextDx = 0
    nextDy = -1
  }
  if (e.key === 'ArrowDown' && dy === 0) {
    nextDx = 0
    nextDy = 1
  }
  if (e.key === 'ArrowLeft' && dx === 0) {
    nextDx = -1
    nextDy = 0
  }
  if (e.key === 'ArrowRight' && dx === 0) {
    nextDx = 1
    nextDy = 0
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  draw()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  clearInterval(gameLoop)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="snake-game flex flex-col items-center gap-6 p-4 font-sans">
    <div class="header w-full flex justify-between items-center max-w-440px">
      <div class="stats flex gap-4">
        <div class="bg-slate-800/50 border border-slate-700 px-4 py-1 rounded-full text-sm">
          Score: <span class="text-emerald-400 font-bold ml-1">{{ score }}</span>
        </div>
        <div class="bg-slate-800/50 border border-slate-700 px-4 py-1 rounded-full text-sm">
          Best: <span class="text-rose-400 font-bold ml-1">{{ bestScore }}</span>
        </div>
      </div>
      <el-button type="success" size="small" round @click="initGame" v-if="!isPlaying">
        {{ gameOver ? 'Play Again' : 'Start Game' }}
      </el-button>
    </div>

    <div class="canvas-wrapper relative">
      <canvas
        ref="canvas"
        width="400"
        height="400"
        class="bg-slate-950 border-2 border-emerald-500/30 rounded-lg shadow-2xl"
      ></canvas>

      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 rounded-lg"
      >
        <h2 class="text-5xl font-black text-emerald-500 tracking-tighter italic">GAME OVER</h2>
        <p class="text-slate-400 uppercase tracking-widest text-xs">Total Score: {{ score }}</p>
        <el-button type="success" size="large" @click="initGame" round>Restart System</el-button>
      </div>

      <div
        v-if="!isPlaying && !gameOver"
        class="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 transition-opacity"
      >
        <div class="text-emerald-400 text-6xl opacity-20">🐍</div>
      </div>
    </div>

    <div class="controls-guide sm:flex hidden gap-6 mt-2">
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">Arrows</span>
        <span class="text-xs text-slate-500">Navigate</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
