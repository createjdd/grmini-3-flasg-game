<script setup>
import { ref, onMounted } from 'vue'

const cards = ref([])
const flippedCards = ref([])
const matchedCount = ref(0)
const moves = ref(0)
const isProcessing = ref(false)

const icons = ['🌌', '⭐', '🌙', '🔭', '🪐', '👽', '🛸', '☄️']

const initGame = () => {
  const deck = [...icons, ...icons]
    .sort(() => Math.random() - 0.5)
    .map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false,
    }))
  cards.value = deck
  flippedCards.value = []
  matchedCount.value = 0
  moves.value = 0
  isProcessing.value = false
}

const flipCard = (card) => {
  if (isProcessing.value || card.isFlipped || card.isMatched) return

  card.isFlipped = true
  flippedCards.value.push(card)

  if (flippedCards.value.length === 2) {
    moves.value++
    checkMatch()
  }
}

const checkMatch = () => {
  isProcessing.value = true
  const [card1, card2] = flippedCards.value

  if (card1.icon === card2.icon) {
    card1.isMatched = true
    card2.isMatched = true
    matchedCount.value += 2
    flippedCards.value = []
    isProcessing.value = false
  } else {
    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      flippedCards.value = []
      isProcessing.value = false
    }, 1000)
  }
}

onMounted(initGame)
</script>

<template>
  <div class="memory-game flex flex-col items-center gap-8 p-4 font-sans">
    <div
      class="header w-full max-w-400px flex justify-between items-center bg-slate-800/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md"
    >
      <div class="stats flex gap-6">
        <div class="flex flex-col">
          <span class="text-0.6rem text-slate-500 uppercase tracking-tighter">Moves</span>
          <span class="text-1.2rem font-bold text-blue-400">{{ moves }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-0.6rem text-slate-500 uppercase tracking-tighter">Matches</span>
          <span class="text-1.2rem font-bold text-emerald-400">{{ matchedCount / 2 }} / {{ icons.length }}</span>
        </div>
      </div>
      <el-button type="info" size="small" round plain @click="initGame">Restart</el-button>
    </div>

    <div class="grid grid-cols-4 gap-3 md:gap-4 max-w-450px w-full">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card-container h-80px md:h-100px perspective-1000 cursor-pointer"
        @click="flipCard(card)"
      >
        <div
          class="card-inner relative w-full h-full transition-transform duration-500 preserve-3d"
          :class="{ 'rotate-y-180': card.isFlipped || card.isMatched }"
        >
          <!-- Front -->
          <div
            class="card-front absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center backface-hidden shadow-lg"
          >
            <span class="text-2xl opacity-20 grayscale">✨</span>
          </div>
          <!-- Back -->
          <div
            class="card-back absolute inset-0 border-2 rounded-xl flex items-center justify-center backface-hidden rotate-y-180 shadow-xl"
            :class="card.isMatched ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-700 border-slate-600'"
          >
            <span class="text-3xl md:text-4xl">{{ card.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="matchedCount === cards.length"
      class="win-banner animate-bounce px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 font-bold tracking-widest uppercase text-sm"
    >
      Victory! System Synchronized
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
