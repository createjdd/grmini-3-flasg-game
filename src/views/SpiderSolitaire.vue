<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Constants
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const columns = ref([])
const stock = ref([])
const foundations = ref(0)
const moves = ref(0)
const difficulty = ref(1) // 1: Easy (1 suit), 2: Medium (2 suits), 4: Hard (4 suits)

// Drag State
const isDragging = ref(false)
const draggedStack = ref([]) // Array of card objects being dragged
const dragStartCol = ref(-1)
const dragStartIndex = ref(-1)
const dragPos = ref({ x: 0, y: 0 }) // Current mouse pos
const dragOffset = ref({ x: 0, y: 0 }) // Offset from mouse to top-left of dragged stack

// Card factory
const createCard = (suit, value, faceUp = false) => ({
  suit,
  value,
  id: Math.random().toString(36).substr(2, 9),
  faceUp,
  numValue: VALUES.indexOf(value) + 1,
})

const initGame = () => {
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

const dealRow = () => {
  if (stock.value.length === 0) return
  if (columns.value.some((col) => col.length === 0)) {
    alert('Columns cannot be empty to deal!')
    return
  }

  for (let i = 0; i < 10; i++) {
    if (stock.value.length > 0) {
      columns.value[i].push({ ...stock.value.pop(), faceUp: true })
    }
  }
  checkFoundations()
}

// Custom Drag Logic
const startDrag = (e, colIndex, cardIndex) => {
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
  draggedStack.value = col.slice(cardIndex)
  dragPos.value = { x: e.clientX, y: e.clientY }

  // Add global listeners
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
  // Find a column or empty column placeholder
  const colEl = elements.find((el) => el.dataset.colIndex !== undefined)

  if (colEl) {
    const targetColIndex = parseInt(colEl.dataset.colIndex)
    tryDrop(targetColIndex)
  }

  // Cleanup
  isDragging.value = false
  draggedStack.value = []
  dragStartCol.value = -1
  dragStartIndex.value = -1
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const tryDrop = (targetColIndex) => {
  // Cannot drop on self (though logic handles it, optimization)
  if (targetColIndex === dragStartCol.value) return

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
    // Execute Move
    const sourceCol = columns.value[dragStartCol.value]

    // Remove from source
    sourceCol.splice(dragStartIndex.value, draggedStack.value.length)

    // Face up new top
    if (sourceCol.length > 0) {
      sourceCol[sourceCol.length - 1].faceUp = true
    }

    // Add to target
    targetCol.push(...draggedStack.value)

    moves.value++
    checkFoundations()
  }
}

const checkFoundations = () => {
  for (let col of columns.value) {
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
      foundations.value++
      col.splice(col.length - 13, 13)
      if (col.length > 0) {
        col[col.length - 1].faceUp = true
      }
    }
  }
}

const setDifficulty = (diff) => {
  difficulty.value = diff
  initGame()
}

onMounted(initGame)
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div class="spider-solitaire min-h-screen bg-[#073318] text-white overflow-hidden relative font-sans select-none">
    <!-- Header -->
    <div class="header h-60px bg-[#0a4521] flex items-center justify-between px-6 shadow-lg relative z-10">
      <div class="flex items-center gap-4">
        <el-button icon="Back" circle plain type="success" @click="router.push('/')" />
        <h1 class="text-xl font-bold tracking-wide hidden md:block">Spider Solitaire</h1>

        <el-dropdown @command="setDifficulty">
          <el-button type="success" size="small" round>
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
        <div class="stat flex flex-col items-center">
          <span class="text-xs text-green-300 uppercase">Moves</span>
          <span class="font-mono font-bold text-lg">{{ moves }}</span>
        </div>
        <div class="stat flex flex-col items-center">
          <span class="text-xs text-green-300 uppercase">Sets</span>
          <span class="font-mono font-bold text-lg">{{ foundations }} / 8</span>
        </div>
      </div>

      <div class="actions">
        <el-button type="warning" plain size="small" @click="initGame">Restart</el-button>
      </div>
    </div>

    <!-- Game Board -->
    <div class="board h-[calc(100vh-60px)] p-4 flex flex-col gap-4">
      <!-- Top Area -->
      <div class="top-area h-120px flex justify-between items-start px-4">
        <div class="stock-pile relative cursor-pointer" @click="dealRow">
          <div
            v-if="stock.length > 0"
            class="card-back w-80px h-110px bg-blue-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center"
          >
            <div class="w-60px h-90px border border-white/30 rounded flex items-center justify-center">
              <span class="text-2xl">🕸️</span>
            </div>
          </div>
          <div
            v-if="stock.length > 0"
            class="absolute -top-1 -left-1 w-80px h-110px bg-blue-800 rounded-lg border-2 border-white pointer-events-none"
          ></div>
          <div
            v-else
            class="placeholder w-80px h-110px border-2 border-white/10 rounded-lg flex items-center justify-center text-white/20"
          >
            Empty
          </div>
        </div>

        <div class="foundations flex gap-2">
          <div
            v-for="n in 8"
            :key="n"
            class="pile w-80px h-110px border-2 border-white/10 rounded-lg flex items-center justify-center bg-black/10 transition-all duration-300"
            :class="{ 'bg-orange-500/20 border-orange-400': n <= foundations }"
          >
            <span v-if="n <= foundations" class="text-3xl">👑</span>
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
            class="w-full h-110px border-2 border-white/5 rounded-lg bg-white/5 absolute top-0 pointer-events-none"
          ></div>

          <!-- Cards -->
          <!-- We only render cards that are NOT being dragged from this column -->
          <template v-for="(card, cardIndex) in col" :key="card.id">
            <div
              class="card absolute w-full transition-all duration-200"
              :class="{ 'opacity-0': isDragging && dragStartCol === colIndex && cardIndex >= dragStartIndex }"
              :style="{ top: `${cardIndex * (card.faceUp ? 35 : 10)}px`, zIndex: cardIndex }"
              @mousedown="startDrag($event, colIndex, cardIndex)"
            >
              <div
                v-if="card.faceUp"
                class="card-face w-full h-110px bg-slate-100 rounded-lg shadow-md border border-slate-300 flex flex-col items-center justify-between p-1 select-none hover:shadow-lg"
                :class="card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-slate-900'"
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
                class="card-back w-full h-110px bg-blue-800 rounded-lg border border-white/50 shadow-sm flex items-center justify-center"
              >
                <div class="w-3/4 h-3/4 border border-white/20 rounded"></div>
              </div>
            </div>
          </template>
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
        class="card-face absolute w-80px md:w-90px h-110px bg-slate-100 rounded-lg shadow-2xl border border-slate-300 flex flex-col items-center justify-between p-1 select-none"
        :class="card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-slate-900'"
        :style="{ top: `${i * 35}px`, zIndex: 100 + i }"
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

    <!-- Win Screen -->
    <div v-if="foundations === 8" class="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
      <h1 class="text-6xl font-black text-yellow-400 mb-4 animate-bounce">VICTORY!</h1>
      <p class="text-2xl text-white mb-8">You solved the Spider!</p>
      <el-button type="warning" size="large" round @click="initGame">Play Again</el-button>
    </div>
  </div>
</template>

<style scoped>
.card,
.card-face {
  touch-action: none;
}
/* Ensure column hit area is full height */
.column {
  min-height: 400px;
}
/* Add perspective for nice flips if we wanted, but standard is fine */
</style>
