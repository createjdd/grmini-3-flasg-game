<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Constants
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const columns = ref([])
const stock = ref([])
const foundations = ref(0)
const moves = ref(0)
const difficulty = ref(1) // 1: Easy (1 suit), 2: Medium (2 suits), 4: Hard (4 suits)

// Help System
const hintsUsed = ref(0)
const hintCard = ref(null) // { colIndex, cardIndex } - the card being highlighted
const showHint = ref(false)

// Temporary Storage (3 slots)
const tempSlots = ref([null, null, null])

// Calculate max hints based on difficulty
const maxHints = computed(() => {
  if (difficulty.value === 1) return 3 // Easy: 3 hints
  if (difficulty.value === 2) return 2 // Medium: 2 hints
  return 1 // Hard: 1 hint
})

const remainingHints = computed(() => maxHints.value - hintsUsed.value)

// Animation State
const isDealing = ref(false)
const dealingCards = ref([]) // Cards currently being animated
const completingCards = ref([]) // Cards completing a set
const showFireworks = ref(false)

// Drag State
const isDragging = ref(false)
const draggedStack = ref([]) // Array of card objects being dragged
const dragStartCol = ref(-1)
const dragStartIndex = ref(-1)
const dragStartSlot = ref(-1) // For temp slot dragging
const dragPos = ref({ x: 0, y: 0 }) // Current mouse pos
const dragOffset = ref({ x: 0, y: 0 }) // Offset from mouse to top-left of dragged stack

// Audio Context
let audioContext = null

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
}

// Play card dealing sound
const playDealSound = () => {
  initAudio()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05)

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.05)
}

// Play hint sound
const playHintSound = () => {
  initAudio()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}

// Play completion sound (fanfare)
const playCompleteSound = () => {
  initAudio()
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1)

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3)

    oscillator.start(audioContext.currentTime + i * 0.1)
    oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3)
  })
}

// Play victory fanfare
const playVictorySound = () => {
  initAudio()
  const melody = [
    { freq: 523.25, time: 0 },
    { freq: 659.25, time: 0.15 },
    { freq: 783.99, time: 0.3 },
    { freq: 1046.5, time: 0.45 },
    { freq: 783.99, time: 0.6 },
    { freq: 1046.5, time: 0.75 },
    { freq: 1318.51, time: 0.9 },
  ]

  melody.forEach(({ freq, time }) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + time)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.2)

    oscillator.start(audioContext.currentTime + time)
    oscillator.stop(audioContext.currentTime + time + 0.2)
  })
}

// Card factory
const createCard = (suit, value, faceUp = false) => ({
  suit,
  value,
  id: Math.random().toString(36).substr(2, 9),
  faceUp,
  numValue: VALUES.indexOf(value) + 1,
})

const initGame = () => {
  showFireworks.value = false
  hintsUsed.value = 0
  hintCard.value = null
  showHint.value = false
  tempSlots.value = [null, null, null]

  let deck = []

  let suitsToUse = []
  if (difficulty.value === 1) {
    suitsToUse = Array(8).fill('♠')
  } else if (difficulty.value === 2) {
    suitsToUse = [...Array(4).fill('♠'), ...Array(4).fill('♥')]
  } else {
    suitsToUse = [...Array(2).fill('♠'), ...Array(2).fill('♥'), ...Array(2).fill('♣'), ...Array(2).fill('♦')]
  }

  for (let s of suitsToUse) {
    for (let v of VALUES) {
      deck.push(createCard(s, v, false))
    }
  }

  deck.sort(() => Math.random() - 0.5)

  columns.value = Array(10)
    .fill([])
    .map(() => [])

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 6; j++) {
      const card = deck.pop()
      if (j === 5) card.faceUp = true
      columns.value[i].push(card)
    }
  }

  for (let i = 4; i < 10; i++) {
    for (let j = 0; j < 5; j++) {
      const card = deck.pop()
      if (j === 4) card.faceUp = true
      columns.value[i].push(card)
    }
  }

  stock.value = deck
  foundations.value = 0
  moves.value = 0
}

// Find possible moves
const findPossibleMoves = () => {
  const possibleMoves = []

  // Check each column for movable sequences
  for (let colIndex = 0; colIndex < columns.value.length; colIndex++) {
    const col = columns.value[colIndex]

    for (let cardIndex = 0; cardIndex < col.length; cardIndex++) {
      const card = col[cardIndex]
      if (!card.faceUp) continue

      // Check if this starts a valid sequence
      let isValidSequence = true
      for (let i = cardIndex; i < col.length - 1; i++) {
        const current = col[i]
        const next = col[i + 1]
        if (current.numValue !== next.numValue + 1 || current.suit !== next.suit) {
          isValidSequence = false
          break
        }
      }

      if (!isValidSequence) continue

      // Check if this sequence can be placed on another column
      for (let targetColIndex = 0; targetColIndex < columns.value.length; targetColIndex++) {
        if (targetColIndex === colIndex) continue

        const targetCol = columns.value[targetColIndex]

        // Can place on empty column (prefer not to move K to empty unless necessary)
        if (targetCol.length === 0 && card.numValue !== 13) {
          possibleMoves.push({
            fromCol: colIndex,
            fromIndex: cardIndex,
            toCol: targetColIndex,
            priority: 1,
          })
        }

        // Can place on top of another card
        if (targetCol.length > 0) {
          const targetTop = targetCol[targetCol.length - 1]
          if (targetTop.numValue === card.numValue + 1) {
            // Higher priority if same suit (better for completing sets)
            const priority = targetTop.suit === card.suit ? 10 : 5
            possibleMoves.push({
              fromCol: colIndex,
              fromIndex: cardIndex,
              toCol: targetColIndex,
              priority,
            })
          }
        }
      }
    }
  }

  // Sort by priority (higher is better)
  possibleMoves.sort((a, b) => b.priority - a.priority)

  return possibleMoves
}

// Use hint
const useHint = () => {
  if (remainingHints.value <= 0) {
    alert('没有剩余提示次数了！')
    return
  }

  // Clear previous hint
  showHint.value = false
  hintCard.value = null

  const possibleMoves = findPossibleMoves()

  if (possibleMoves.length === 0) {
    // No moves available, suggest dealing
    if (stock.value.length > 0) {
      alert('💡 提示：没有可移动的牌，请点击左上角发牌！')
    } else {
      alert('💡 提示：没有可移动的牌了，游戏可能无法完成。')
    }
    hintsUsed.value++
    playHintSound()
    return
  }

  // Highlight the best move
  const bestMove = possibleMoves[0]
  hintCard.value = { colIndex: bestMove.fromCol, cardIndex: bestMove.fromIndex, toCol: bestMove.toCol }
  showHint.value = true
  hintsUsed.value++
  playHintSound()

  // Auto-hide hint after 3 seconds
  setTimeout(() => {
    showHint.value = false
    hintCard.value = null
  }, 3000)
}

// Get column element position
const getColumnPosition = (colIndex) => {
  const colEl = document.querySelector(`[data-col-index="${colIndex}"]`)
  if (!colEl) return { x: 0, y: 0 }
  const rect = colEl.getBoundingClientRect()
  return { x: rect.left, y: rect.top }
}

// Get stock pile position
const getStockPosition = () => {
  const stockEl = document.querySelector('.stock-pile')
  if (!stockEl) return { x: 0, y: 0 }
  const rect = stockEl.getBoundingClientRect()
  return { x: rect.left, y: rect.top }
}

// Animated deal row
const dealRow = async () => {
  if (stock.value.length === 0) return
  if (isDealing.value) return
  if (columns.value.some((col) => col.length === 0)) {
    alert('Columns cannot be empty to deal!')
    return
  }

  isDealing.value = true
  const stockPos = getStockPosition()

  // Deal cards one by one with animation
  for (let i = 0; i < 10; i++) {
    if (stock.value.length > 0) {
      const card = { ...stock.value.pop(), faceUp: true }
      const colPos = getColumnPosition(i)
      const col = columns.value[i]
      const targetTop = getCardTop(i, col.length)

      // Create animating card
      const animCard = {
        ...card,
        startX: stockPos.x,
        startY: stockPos.y,
        endX: colPos.x,
        endY: colPos.y + targetTop,
        colIndex: i,
      }

      dealingCards.value.push(animCard)
      playDealSound()

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 80))

      // Add card to column
      columns.value[i].push(card)

      // Remove from animating
      await new Promise((resolve) => setTimeout(resolve, 150))
      dealingCards.value = dealingCards.value.filter((c) => c.id !== animCard.id)
    }
  }

  isDealing.value = false
  checkFoundations()
}

// Spacing Logic
const getCardTop = (colIndex, cardIndex) => {
  const col = columns.value[colIndex]
  let top = 0
  for (let i = 0; i < cardIndex; i++) {
    top += col[i].faceUp ? 35 : 12
  }
  return top
}

const getDragStackTop = (index) => {
  return index * 35
}

// Custom Drag Logic
const startDrag = (e, colIndex, cardIndex) => {
  if (isDealing.value) return

  const col = columns.value[colIndex]
  const card = col[cardIndex]

  // Validation
  if (!card.faceUp) return

  // Check sequence
  for (let i = cardIndex; i < col.length - 1; i++) {
    const current = col[i]
    const next = col[i + 1]
    if (current.numValue !== next.numValue + 1 || current.suit !== next.suit) {
      return
    }
  }

  // Calculate offset
  const rect = e.currentTarget.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }

  // Initialize drag
  isDragging.value = true
  dragStartCol.value = colIndex
  dragStartIndex.value = cardIndex
  dragStartSlot.value = -1
  draggedStack.value = col.slice(cardIndex)
  dragPos.value = { x: e.clientX, y: e.clientY }

  // Add global listeners
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// Drag from temp slot
const startDragFromSlot = (e, slotIndex) => {
  const card = tempSlots.value[slotIndex]
  if (!card) return

  const rect = e.currentTarget.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }

  isDragging.value = true
  dragStartCol.value = -1
  dragStartIndex.value = -1
  dragStartSlot.value = slotIndex
  draggedStack.value = [card]
  dragPos.value = { x: e.clientX, y: e.clientY }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  dragPos.value = { x: e.clientX, y: e.clientY }
}

const onMouseUp = (e) => {
  if (!isDragging.value) return

  // Detect drop target
  const elements = document.elementsFromPoint(e.clientX, e.clientY)
  const colEl = elements.find((el) => el.dataset.colIndex !== undefined)
  const slotEl = elements.find((el) => el.dataset.slotIndex !== undefined)

  if (colEl) {
    const targetColIndex = parseInt(colEl.dataset.colIndex)
    tryDrop(targetColIndex)
  } else if (slotEl && draggedStack.value.length === 1) {
    // Drop single card to temp slot
    const slotIndex = parseInt(slotEl.dataset.slotIndex)
    tryDropToSlot(slotIndex)
  }

  // Cleanup
  isDragging.value = false
  draggedStack.value = []
  dragStartCol.value = -1
  dragStartIndex.value = -1
  dragStartSlot.value = -1
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const tryDropToSlot = (slotIndex) => {
  if (tempSlots.value[slotIndex] !== null) return // Slot occupied
  if (draggedStack.value.length !== 1) return // Only single cards

  const card = draggedStack.value[0]

  if (dragStartSlot.value >= 0) {
    // Moving from one slot to another
    tempSlots.value[dragStartSlot.value] = null
  } else if (dragStartCol.value >= 0) {
    // Moving from column to slot
    const sourceCol = columns.value[dragStartCol.value]
    sourceCol.splice(dragStartIndex.value, 1)
    if (sourceCol.length > 0) {
      sourceCol[sourceCol.length - 1].faceUp = true
    }
  }

  tempSlots.value[slotIndex] = card
  moves.value++
}

const tryDrop = (targetColIndex) => {
  // Cannot drop on self (though logic handles it, optimization)
  if (targetColIndex === dragStartCol.value && dragStartSlot.value < 0) return

  const targetCol = columns.value[targetColIndex]
  const baseCard = draggedStack.value[0]

  let valid = false

  if (targetCol.length === 0) {
    valid = true
  } else {
    const targetTop = targetCol[targetCol.length - 1]
    if (targetTop.numValue === baseCard.numValue + 1) {
      valid = true
    }
  }

  if (valid) {
    if (dragStartSlot.value >= 0) {
      // Coming from temp slot
      tempSlots.value[dragStartSlot.value] = null
    } else {
      // Coming from column
      const sourceCol = columns.value[dragStartCol.value]
      sourceCol.splice(dragStartIndex.value, draggedStack.value.length)
      if (sourceCol.length > 0) {
        sourceCol[sourceCol.length - 1].faceUp = true
      }
    }

    // Add to target
    targetCol.push(...draggedStack.value)

    moves.value++
    checkFoundations()
  }
}

const checkFoundations = async () => {
  for (let colIndex = 0; colIndex < columns.value.length; colIndex++) {
    const col = columns.value[colIndex]
    if (col.length < 13) continue

    const sequence = col.slice(col.length - 13)
    if (sequence[sequence.length - 1].numValue !== 1) continue

    const suit = sequence[0].suit
    let isComplete = true
    for (let i = 0; i < 13; i++) {
      if (sequence[i].numValue !== 13 - i || sequence[i].suit !== suit) {
        isComplete = false
        break
      }
    }

    if (isComplete) {
      // Animate the completion
      const colPos = getColumnPosition(colIndex)
      const startTop = getCardTop(colIndex, col.length - 13)

      // Add cards to completing animation
      const cardsToAnimate = sequence.map((card, i) => ({
        ...card,
        startX: colPos.x,
        startY: colPos.y + startTop + i * 35,
        delay: i * 30,
      }))

      completingCards.value = cardsToAnimate
      playCompleteSound()

      // Remove from column
      col.splice(col.length - 13, 13)
      if (col.length > 0) {
        col[col.length - 1].faceUp = true
      }

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 800))
      completingCards.value = []

      foundations.value++

      // Check for victory
      if (foundations.value === 8) {
        await nextTick()
        showFireworks.value = true
        playVictorySound()
      }
    }
  }
}

const setDifficulty = (diff) => {
  difficulty.value = diff
  initGame()
}

// Firework class for canvas
class Firework {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.x = Math.random() * canvas.width
    this.y = canvas.height
    this.targetY = Math.random() * (canvas.height * 0.5)
    this.speed = 3 + Math.random() * 3
    this.exploded = false
    this.particles = []
    this.hue = Math.random() * 360
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed
      if (this.y <= this.targetY) {
        this.explode()
      }
    } else {
      this.particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.alpha -= 0.01
      })
      this.particles = this.particles.filter((p) => p.alpha > 0)
    }
  }

  explode() {
    this.exploded = true
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        hue: this.hue + Math.random() * 30,
      })
    }
  }

  draw() {
    if (!this.exploded) {
      this.ctx.beginPath()
      this.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2)
      this.ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`
      this.ctx.fill()
    } else {
      this.particles.forEach((p) => {
        this.ctx.beginPath()
        this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`
        this.ctx.fill()
      })
    }
  }

  isDead() {
    return this.exploded && this.particles.length === 0
  }
}

let fireworks = []
let animationId = null

const startFireworks = () => {
  const canvas = document.getElementById('fireworks-canvas')
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')

  fireworks = []

  const animate = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add new fireworks
    if (Math.random() < 0.08) {
      fireworks.push(new Firework(canvas))
    }

    fireworks.forEach((f) => {
      f.update()
      f.draw()
    })

    fireworks = fireworks.filter((f) => !f.isDead())

    if (showFireworks.value) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animate()
}

watch(showFireworks, (val) => {
  if (val) {
    nextTick(() => {
      startFireworks()
    })
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
})

onMounted(initGame)
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div
    class="spider-solitaire min-h-screen text-amber-100 overflow-hidden relative font-serif select-none wood-background"
  >
    <!-- Header -->
    <div class="header h-60px flex items-center justify-between px-6 shadow-lg relative z-10 header-wood">
      <div class="flex items-center gap-4">
        <el-button icon="Back" circle @click="router.push('/')" class="vintage-btn" />
        <h1
          class="text-xl font-bold tracking-wide hidden md:block text-amber-200 drop-shadow-md"
          style="font-family: 'Georgia', serif"
        >
          🕷️ Spider Solitaire
        </h1>

        <el-dropdown @command="setDifficulty">
          <el-button size="small" round class="vintage-btn-primary">
            Difficulty:
            {{ difficulty === 1 ? 'Easy (1 Suit)' : difficulty === 2 ? 'Medium (2 Suits)' : 'Hard (4 Suits)' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="1">Easy (1 Suit)</el-dropdown-item>
              <el-dropdown-item :command="2">Medium (2 Suits)</el-dropdown-item>
              <el-dropdown-item :command="4">Hard (4 Suits)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="stats flex gap-4 md:gap-8">
        <div class="stat flex flex-col items-center stat-box">
          <span class="text-xs text-amber-400 uppercase tracking-wider">Moves</span>
          <span class="font-mono font-bold text-lg text-amber-100">{{ moves }}</span>
        </div>
        <div class="stat flex flex-col items-center stat-box">
          <span class="text-xs text-amber-400 uppercase tracking-wider">Sets</span>
          <span class="font-mono font-bold text-lg text-amber-100">{{ foundations }} / 8</span>
        </div>
      </div>

      <div class="actions flex gap-2">
        <el-button size="small" @click="useHint" class="vintage-btn-hint" :disabled="remainingHints <= 0">
          💡 提示 ({{ remainingHints }})
        </el-button>
        <el-button size="small" @click="initGame" class="vintage-btn-warning">🔄 Restart</el-button>
      </div>
    </div>

    <!-- Game Board -->
    <div class="board h-[calc(100vh-60px)] p-4 flex flex-col gap-4">
      <!-- Top Area -->
      <div class="top-area h-120px flex justify-between items-start px-4">
        <div class="stock-pile relative cursor-pointer" @click="dealRow">
          <!-- 根据剩余落数动态显示堆叠效果 -->
          <template v-if="stock.length > 0">
            <!-- 底层牌堆 - 根据剩余落数显示 -->
            <div
              v-for="n in Math.ceil(stock.length / 10)"
              :key="n"
              class="absolute w-80px h-110px stock-card rounded-lg pointer-events-none"
              :style="{
                top: `${-(Math.ceil(stock.length / 10) - n) * 4}px`,
                left: `${-(Math.ceil(stock.length / 10) - n) * 2}px`,
                opacity: n === Math.ceil(stock.length / 10) ? 1 : 0.7 - (Math.ceil(stock.length / 10) - n) * 0.1,
                zIndex: n,
              }"
            >
              <div v-if="n === Math.ceil(stock.length / 10)" class="vintage-pattern"></div>
            </div>
            <!-- 可点击的覆盖层 -->
            <div class="absolute w-80px h-110px z-10 cursor-pointer"></div>
            <!-- 剩余落数显示 -->
            <div
              class="absolute -bottom-2 -right-2 z-20 bg-amber-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-300 pointer-events-none"
            >
              {{ Math.ceil(stock.length / 10) }}
            </div>
          </template>
          <div
            v-else
            class="placeholder w-80px h-110px border-2 border-amber-900/30 rounded-lg flex items-center justify-center text-amber-700/50 bg-amber-950/20"
          >
            Empty
          </div>
        </div>

        <div class="foundations flex gap-2">
          <div
            v-for="n in 8"
            :key="n"
            class="pile w-80px h-110px border-2 rounded-lg flex items-center justify-center transition-all duration-300"
            :class="n <= foundations ? 'foundation-complete' : 'foundation-empty'"
          >
            <span v-if="n <= foundations" class="text-3xl drop-shadow-lg">🏆</span>
            <span v-else class="text-amber-800/30 text-2xl">♠</span>
          </div>
        </div>
      </div>

      <!-- Tableau Columns -->
      <div class="tableau flex-1 flex justify-center gap-2 md:gap-4 overflow-hidden relative">
        <div
          v-for="(col, colIndex) in columns"
          :key="colIndex"
          class="column w-80px md:w-90px relative min-h-200px"
          :data-col-index="colIndex"
        >
          <!-- Column placeholder for hit testing -->
          <div class="w-full h-full absolute top-0 left-0 z-0" :data-col-index="colIndex"></div>
          <div
            class="w-full h-110px border-2 border-amber-900/20 rounded-lg bg-amber-950/15 absolute top-0 pointer-events-none column-slot"
            :class="{ 'hint-target': showHint && hintCard && hintCard.toCol === colIndex }"
          ></div>

          <!-- Cards -->
          <template v-for="(card, cardIndex) in col" :key="card.id">
            <div
              class="card absolute w-full transition-all duration-200"
              :class="{
                'opacity-0': isDragging && dragStartCol === colIndex && cardIndex >= dragStartIndex,
                'hint-card': showHint && hintCard && hintCard.colIndex === colIndex && cardIndex >= hintCard.cardIndex,
              }"
              :style="{ top: `${getCardTop(colIndex, cardIndex)}px`, zIndex: cardIndex }"
              @mousedown="startDrag($event, colIndex, cardIndex)"
            >
              <div
                v-if="card.faceUp"
                class="card-face-vintage w-full h-110px rounded-lg shadow-md flex flex-col items-center justify-between p-1 select-none"
                :class="card.suit === '♥' || card.suit === '♦' ? 'card-red' : 'card-black'"
              >
                <div class="top-l self-start text-xs font-bold leading-none flex flex-col items-center">
                  <span>{{ card.value }}</span>
                  <span>{{ card.suit }}</span>
                </div>
                <div class="center text-3xl">{{ card.suit }}</div>
                <div class="bot-r self-end text-xs font-bold leading-none flex flex-col items-center rotate-180">
                  <span>{{ card.value }}</span>
                  <span>{{ card.suit }}</span>
                </div>
              </div>

              <div
                v-else
                class="card-back-vintage w-full h-110px rounded-lg shadow-sm flex items-center justify-center relative overflow-hidden"
              >
                <!-- Vintage Card back pattern -->
                <div class="vintage-pattern"></div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Temporary Storage Area (Bottom Left) -->
      <div class="temp-storage absolute bottom-4 left-4 flex gap-2">
        <div class="temp-label text-amber-400 text-xs uppercase tracking-wider mr-2 flex items-center">临时存放</div>
        <div
          v-for="(slot, slotIndex) in tempSlots"
          :key="slotIndex"
          class="temp-slot w-70px h-100px border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
          :class="slot ? 'border-amber-500' : 'border-amber-900/30 bg-amber-950/30'"
          :data-slot-index="slotIndex"
          @mousedown="slot ? startDragFromSlot($event, slotIndex) : null"
        >
          <template v-if="slot">
            <div
              class="card-face-vintage w-full h-full rounded-lg shadow-md flex flex-col items-center justify-between p-1 select-none"
              :class="slot.suit === '♥' || slot.suit === '♦' ? 'card-red' : 'card-black'"
            >
              <div class="top-l self-start text-xs font-bold leading-none flex flex-col items-center">
                <span>{{ slot.value }}</span>
                <span>{{ slot.suit }}</span>
              </div>
              <div class="center text-2xl">{{ slot.suit }}</div>
              <div class="bot-r self-end text-xs font-bold leading-none flex flex-col items-center rotate-180">
                <span>{{ slot.value }}</span>
                <span>{{ slot.suit }}</span>
              </div>
            </div>
          </template>
          <span v-else class="text-amber-800/30 text-lg">{{ slotIndex + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Dealing Animation Layer -->
    <div class="fixed inset-0 pointer-events-none z-40">
      <div
        v-for="card in dealingCards"
        :key="card.id"
        class="dealing-card absolute w-80px h-110px"
        :style="{
          '--start-x': card.startX + 'px',
          '--start-y': card.startY + 'px',
          '--end-x': card.endX + 'px',
          '--end-y': card.endY + 'px',
        }"
      >
        <div
          class="card-face-vintage w-full h-full rounded-lg shadow-xl flex flex-col items-center justify-between p-1"
          :class="card.suit === '♥' || card.suit === '♦' ? 'card-red' : 'card-black'"
        >
          <div class="top-l self-start text-xs font-bold leading-none flex flex-col items-center">
            <span>{{ card.value }}</span>
            <span>{{ card.suit }}</span>
          </div>
          <div class="center text-3xl">{{ card.suit }}</div>
          <div class="bot-r self-end text-xs font-bold leading-none flex flex-col items-center rotate-180">
            <span>{{ card.value }}</span>
            <span>{{ card.suit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Completion Animation Layer -->
    <div class="fixed inset-0 pointer-events-none z-45">
      <div
        v-for="(card, i) in completingCards"
        :key="card.id"
        class="completing-card absolute w-80px h-110px"
        :style="{
          left: card.startX + 'px',
          top: card.startY + 'px',
          animationDelay: card.delay + 'ms',
        }"
      >
        <div
          class="card-face-vintage w-full h-full rounded-lg shadow-xl flex flex-col items-center justify-between p-1"
          :class="card.suit === '♥' || card.suit === '♦' ? 'card-red' : 'card-black'"
        >
          <div class="top-l self-start text-xs font-bold leading-none flex flex-col items-center">
            <span>{{ card.value }}</span>
            <span>{{ card.suit }}</span>
          </div>
          <div class="center text-3xl">{{ card.suit }}</div>
          <div class="bot-r self-end text-xs font-bold leading-none flex flex-col items-center rotate-180">
            <span>{{ card.value }}</span>
            <span>{{ card.suit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Drag Layer -->
    <div
      v-if="isDragging"
      class="drag-layer fixed pointer-events-none z-50 overflow-visible"
      :style="{
        left: `${dragPos.x - dragOffset.x}px`,
        top: `${dragPos.y - dragOffset.y}px`,
        width: '80px',
      }"
    >
      <div
        v-for="(card, i) in draggedStack"
        :key="card.id"
        class="card-face-vintage absolute w-80px md:w-90px h-110px rounded-lg shadow-2xl flex flex-col items-center justify-between p-1 select-none"
        :class="card.suit === '♥' || card.suit === '♦' ? 'card-red' : 'card-black'"
        :style="{ top: `${getDragStackTop(i)}px`, zIndex: 100 + i }"
      >
        <div class="top-l self-start text-xs font-bold leading-none flex flex-col items-center">
          <span>{{ card.value }}</span>
          <span>{{ card.suit }}</span>
        </div>
        <div class="center text-3xl">{{ card.suit }}</div>
        <div class="bot-r self-end text-xs font-bold leading-none flex flex-col items-center rotate-180">
          <span>{{ card.value }}</span>
          <span>{{ card.suit }}</span>
        </div>
      </div>
    </div>

    <!-- Win Screen with Fireworks -->
    <div v-if="foundations === 8" class="win-screen absolute inset-0 z-50 flex flex-col items-center justify-center">
      <canvas id="fireworks-canvas" class="absolute inset-0"></canvas>
      <div class="win-content text-center relative z-10">
        <h1
          class="text-6xl font-black text-amber-300 mb-4 animate-bounce drop-shadow-lg"
          style="font-family: 'Georgia', serif"
        >
          🏆 VICTORY! 🏆
        </h1>
        <p class="text-2xl text-amber-100 mb-8">You conquered the Spider!</p>
        <el-button size="large" round @click="initGame" class="vintage-btn-warning text-lg">🔄 Play Again</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card,
.card-face-vintage {
  touch-action: none;
}

.column {
  min-height: 400px;
}

/* 毛毡桌面背景 - 柔和护眼 */
.wood-background {
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
    linear-gradient(180deg, #1a4d3a 0%, #0d3527 50%, #0a2a1f 100%);
  background-color: #0d3527;
}

/* 顶部导航木纹 */
.header-wood {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%),
    linear-gradient(90deg, #5d4037 0%, #6d4c41 50%, #5d4037 100%);
  border-bottom: 3px solid #3e2723;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 统计数据框 */
.stat-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

/* 复古按钮样式 */
.vintage-btn {
  background: linear-gradient(180deg, #8d6e63 0%, #6d4c41 100%) !important;
  border: 2px solid #4e342e !important;
  color: #fff8e1 !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.vintage-btn:hover {
  background: linear-gradient(180deg, #a1887f 0%, #8d6e63 100%) !important;
}

.vintage-btn-primary {
  background: linear-gradient(180deg, #5d4037 0%, #3e2723 100%) !important;
  border: 2px solid #3e2723 !important;
  color: #ffe082 !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.vintage-btn-warning {
  background: linear-gradient(180deg, #f9a825 0%, #f57f17 100%) !important;
  border: 2px solid #e65100 !important;
  color: #3e2723 !important;
  font-weight: bold !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.vintage-btn-hint {
  background: linear-gradient(180deg, #7986cb 0%, #5c6bc0 100%) !important;
  border: 2px solid #3949ab !important;
  color: #fff !important;
  font-weight: bold !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.vintage-btn-hint:hover {
  background: linear-gradient(180deg, #9fa8da 0%, #7986cb 100%) !important;
}

.vintage-btn-hint:disabled {
  background: linear-gradient(180deg, #9e9e9e 0%, #757575 100%) !important;
  border-color: #616161 !important;
  cursor: not-allowed;
}

/* 牌堆卡片背面 */
.stock-card {
  background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 50%, #7b1fa2 100%);
  border: 3px solid #ffd54f;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3);
}

/* 复古图案 */
.vintage-pattern {
  position: absolute;
  inset: 6px;
  border: 2px solid #ffd54f;
  border-radius: 4px;
  background: repeating-linear-gradient(
      45deg,
      transparent 0px,
      transparent 8px,
      rgba(255, 213, 79, 0.1) 8px,
      rgba(255, 213, 79, 0.1) 16px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0px,
      transparent 8px,
      rgba(255, 213, 79, 0.1) 8px,
      rgba(255, 213, 79, 0.1) 16px
    );
}

.vintage-pattern::before {
  content: '♠';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  color: #ffd54f;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 基础区域 */
.foundation-empty {
  background: rgba(62, 39, 35, 0.4);
  border-color: rgba(255, 193, 7, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.foundation-complete {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 152, 0, 0.3) 100%);
  border-color: #ffb300;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.4), inset 0 0 10px rgba(255, 193, 7, 0.2);
}

/* 列槽位 */
.column-slot {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 复古卡牌正面 */
.card-face-vintage {
  background: linear-gradient(180deg, #fffef7 0%, #f5f0e1 50%, #ede5d0 100%);
  border: 2px solid #8d6e63;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  font-family: 'Georgia', 'Times New Roman', serif;
}

.card-face-vintage:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.card-red {
  color: #b71c1c;
}

.card-black {
  color: #1a1a1a;
}

/* 复古卡牌背面 */
.card-back-vintage {
  background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 50%, #7b1fa2 100%);
  border: 2px solid #ffd54f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.3);
}

/* 提示动画 */
.hint-card {
  animation: hint-pulse 0.5s ease-in-out infinite alternate;
}

.hint-target {
  animation: hint-target-pulse 0.5s ease-in-out infinite alternate;
  border-color: #4caf50 !important;
  background: rgba(76, 175, 80, 0.3) !important;
}

@keyframes hint-pulse {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  100% {
    transform: scale(1.02);
    filter: brightness(1.2);
    box-shadow: 0 0 20px rgba(255, 235, 59, 0.6);
  }
}

@keyframes hint-target-pulse {
  0% {
    box-shadow: inset 0 0 10px rgba(76, 175, 80, 0.3);
  }
  100% {
    box-shadow: inset 0 0 20px rgba(76, 175, 80, 0.6), 0 0 15px rgba(76, 175, 80, 0.4);
  }
}

/* 临时存放区 */
.temp-storage {
  z-index: 20;
}

.temp-slot {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.temp-slot:hover {
  border-color: rgba(255, 193, 7, 0.5);
}

/* 发牌动画 */
.dealing-card {
  animation: deal-fly 0.2s ease-out forwards;
}

@keyframes deal-fly {
  0% {
    left: var(--start-x);
    top: var(--start-y);
    transform: rotate(-10deg) scale(0.9);
  }
  100% {
    left: var(--end-x);
    top: var(--end-y);
    transform: rotate(0deg) scale(1);
  }
}

/* 完成序列动画 */
.completing-card {
  animation: complete-fly 0.6s ease-in-out forwards;
}

@keyframes complete-fly {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-100px) scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-300px) scale(0.5) rotate(360deg);
    opacity: 0;
  }
}

/* 胜利界面 */
.win-screen {
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%);
}

.win-content {
  background: linear-gradient(180deg, rgba(139, 90, 43, 0.8) 0%, rgba(93, 64, 55, 0.8) 100%);
  padding: 48px 64px;
  border-radius: 16px;
  border: 3px solid #ffb300;
  box-shadow: 0 0 40px rgba(255, 193, 7, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2);
}

#fireworks-canvas {
  width: 100%;
  height: 100%;
}
</style>
