<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Constants
const SUITS = ['♠', '♥', '♣', '♦']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
// Simplified for now: 1 suit (Spades) x 8 decks for Easy mode standard spider layout
// Actually standard 1 suit is 8 decks of spades. 104 cards total.
const TOTAL_CARDS = 104

const columns = ref([])
const stock = ref([])
const foundations = ref(0)
const moves = ref(0)
const isDragging = ref(false)
const draggedCard = ref(null)
const draggedSource = ref(null) // { colIndex, cardIndex }

// Card factory
const createCard = (suit, value, faceUp = false) => ({
  suit,
  value,
  id: Math.random().toString(36).substr(2, 9),
  faceUp,
  numValue: VALUES.indexOf(value) + 1,
})

const initGame = () => {
  // Create 8 decks of Spades for "Easy" mode
  let deck = []
  for (let i = 0; i < 8; i++) {
    for (let v of VALUES) {
      deck.push(createCard('♠', v, false))
    }
  }

  // Shuffle
  deck.sort(() => Math.random() - 0.5)

  // Setup columns
  // 10 columns. First 4 have 6 cards, next 6 have 5 cards.
  // Top card face up.
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
  // Cannot deal if any column is empty
  if (columns.value.some((col) => col.length === 0)) {
    alert('Columns cannot be empty to deal!')
    return
  }

  for (let i = 0; i < 10; i++) {
    if (stock.value.length > 0) {
      const card = stock.value.pop()
      card.faceUp = true
      columns.value[i].push(card)
    }
  }
  checkFoundations()
}

// Drag functionality
const onDragStart = (e, colIndex, cardIndex) => {
  const col = columns.value[colIndex]
  const card = col[cardIndex]

  // Can only drag if face up
  if (!card.faceUp) {
    e.preventDefault()
    return
  }

  // Can only drag if all cards below are in sequence
  // Check sequence from cardIndex to end
  for (let i = cardIndex; i < col.length - 1; i++) {
    if (col[i].numValue !== col[i + 1].numValue + 1) {
      e.preventDefault()
      return
    }
  }

  draggedCard.value = col.slice(cardIndex) // Array of cards being dragged
  draggedSource.value = { colIndex, cardIndex }
  isDragging.value = true

  // Set drag image/effect
  e.dataTransfer.effectAllowed = 'move'
  // Use a transparent image or handle visual feedback
}

const onDragOver = (e) => {
  e.preventDefault() // Allow drop
}

const onDrop = (e, targetColIndex) => {
  e.preventDefault()
  if (!draggedCard.value) return

  const targetCol = columns.value[targetColIndex]
  const cardsToMove = draggedCard.value
  const sourceColIdx = draggedSource.value.colIndex

  // Logic to allow drop
  // 1. Empty column: Any card can go
  // 2. Non-empty: Top card must be +1 of moving card base

  const baseMoveCard = cardsToMove[0]

  let valid = false
  if (targetCol.length === 0) {
    valid = true
  } else {
    const targetCard = targetCol[targetCol.length - 1]
    if (targetCard.numValue === baseMoveCard.numValue + 1) {
      valid = true
    }
  }

  if (valid) {
    // Execute move
    // Remove from source
    const sourceCol = columns.value[sourceColIdx]
    sourceCol.splice(draggedSource.value.cardIndex, cardsToMove.length)

    // Reveal new top card in source if exists
    if (sourceCol.length > 0) {
      sourceCol[sourceCol.length - 1].faceUp = true
    }

    // Add to target
    targetCol.push(...cardsToMove)
    moves.value++
    checkFoundations()
  }

  // Reset
  draggedCard.value = null
  draggedSource.value = null
  isDragging.value = false
}

const checkFoundations = () => {
  // Check all columns for A-K sequence (which is K down to A)
  for (let col of columns.value) {
    if (col.length < 13) continue

    // Check end of column for K..A sequence
    // A has numValue 1, K has 13
    // We need 1, 2, 3... 13 at the end? specific order is K(13) -> Q(12) ... -> A(1)

    // If we have a sequence from K down to A (bottom is A)
    // We look for a run of 13 cards: K..A

    // Let's implement simpler check: from end, verify 1, 2, 3...
    let run = 1
    for (let i = col.length - 1; i > 0; i--) {
      if (col[i].numValue + 1 === col[i - 1].numValue && col[i].suit === col[i - 1].suit) {
        run++
      } else {
        break
      }
    }

    if (run >= 13) {
      // Must be A to K?
      // Bottom card (col[length-1]) should be A (1)
      if (col[col.length - 1].numValue === 1) {
        // Found a complete set!
        foundations.value++
        // Remove them
        col.splice(col.length - 13, 13)

        // Flip new top if needed
        if (col.length > 0) {
          col[col.length - 1].faceUp = true
        }
      }
    }
  }
}

onMounted(initGame)
</script>

<template>
  <div class="spider-solitaire min-h-screen bg-[#073318] text-white overflow-hidden relative font-sans select-none">
    <!-- Header -->
    <div class="header h-60px bg-[#0a4521] flex items-center justify-between px-6 shadow-lg relative z-10">
      <div class="flex items-center gap-4">
        <el-button icon="Back" circle plain type="success" @click="router.push('/')" />
        <h1 class="text-xl font-bold tracking-wide">Spider Solitaire</h1>
      </div>

      <div class="stats flex gap-8">
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
        <el-button type="success" plain size="small" @click="initGame">New Game</el-button>
      </div>
    </div>

    <!-- Game Board -->
    <div class="board h-[calc(100vh-60px)] p-4 flex flex-col gap-4">
      <!-- Top Area: Stock & Foundations Placeholder -->
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
      <div class="tableau flex-1 flex justify-center gap-2 md:gap-4 overflow-hidden">
        <div
          v-for="(col, colIndex) in columns"
          :key="colIndex"
          class="column w-80px md:w-90px relative min-h-200px"
          @dragover="onDragOver"
          @drop="onDrop($event, colIndex)"
        >
          <!-- Column placeholder -->
          <div class="w-full h-110px border-2 border-white/5 rounded-lg bg-white/5 absolute top-0"></div>

          <!-- Cards -->
          <div
            v-for="(card, cardIndex) in col"
            :key="card.id"
            class="card absolute w-full transition-all duration-200"
            :style="{ top: `${cardIndex * 25}px`, zIndex: cardIndex }"
            draggable="true"
            @dragstart="onDragStart($event, colIndex, cardIndex)"
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
.card {
  touch-action: none;
}
</style>
