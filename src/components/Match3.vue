<script setup>
import { ref, onMounted } from 'vue'

const grid = ref([])
const score = ref(0)
const isProcessing = ref(false)
const selected = ref(null)

const emojis = ['🍎', '🍇', '🍊', '🍓', '🥝', '🫐']
const rows = 8
const cols = 8

const initGrid = () => {
  grid.value = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => emojis[Math.floor(Math.random() * emojis.length)])
    )
  removeInitialMatches()
}

const removeInitialMatches = () => {
  let hasMatches = true
  while (hasMatches) {
    hasMatches = false
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hMatch = checkMatch(r, c, 1, 0)
        const vMatch = checkMatch(r, c, 0, 1)
        if (hMatch.length >= 3 || vMatch.length >= 3) {
          grid.value[r][c] = emojis[Math.floor(Math.random() * emojis.length)]
          hasMatches = true
        }
      }
    }
  }
}

const checkMatch = (r, c, dr, dc) => {
  const match = [{ r, c }]
  const type = grid.value[r][c]
  let curR = r + dr
  let curC = c + dc
  while (curR >= 0 && curR < rows && curC >= 0 && curC < cols && grid.value[curR][curC] === type) {
    match.push({ r: curR, c: curC })
    curR += dr
    curC += dc
  }
  return match
}

const selectTile = async (r, c) => {
  if (isProcessing.value) return

  if (!selected.value) {
    selected.value = { r, c }
  } else {
    const s = selected.value
    const isAdjacent = Math.abs(s.r - r) + Math.abs(s.c - c) === 1

    if (isAdjacent) {
      isProcessing.value = true
      // Swap
      const temp = grid.value[r][c]
      grid.value[r][c] = grid.value[s.r][s.c]
      grid.value[s.r][s.c] = temp

      const hasMatch = await processMatches()

      if (!hasMatch) {
        // Swap back if no match
        grid.value[s.r][s.c] = grid.value[r][c]
        grid.value[r][c] = temp
      }
      isProcessing.value = false
    }
    selected.value = null
  }
}

const processMatches = async () => {
  let matched = false
  const toRemove = new Set()

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = checkMatch(r, c, 0, 1)
      const v = checkMatch(r, c, 1, 0)
      if (h.length >= 3) h.forEach((p) => toRemove.add(`${p.r},${p.c}`))
      if (v.length >= 3) v.forEach((p) => toRemove.add(`${p.r},${p.c}`))
    }
  }

  if (toRemove.size > 0) {
    matched = true
    score.value += toRemove.size * 10

    // Animate removal (simulated with delay)
    await new Promise((r) => setTimeout(r, 300))

    toRemove.forEach((pos) => {
      const [r, c] = pos.split(',').map(Number)
      grid.value[r][c] = null
    })

    // Drop down
    for (let c = 0; c < cols; c++) {
      let emptyRow = rows - 1
      for (let r = rows - 1; r >= 0; r--) {
        if (grid.value[r][c] !== null) {
          if (r !== emptyRow) {
            grid.value[emptyRow][c] = grid.value[r][c]
            grid.value[r][c] = null
          }
          emptyRow--
        }
      }
      for (let r = emptyRow; r >= 0; r--) {
        grid.value[r][c] = emojis[Math.floor(Math.random() * emojis.length)]
      }
    }

    // Check again
    await processMatches()
  }
  return matched
}

onMounted(initGrid)
</script>

<template>
  <div class="match3-game flex flex-col items-center gap-6 p-4">
    <div
      class="header w-full max-w-400px flex justify-between items-center bg-slate-800/50 p-3 rounded-2xl border border-slate-700"
    >
      <div class="score text-2xl font-black text-rose-500 tracking-wider">
        {{ score.toString().padStart(6, '0') }}
      </div>
      <el-button type="info" size="small" round @click="initGrid">Reset</el-button>
    </div>

    <div
      class="board bg-slate-900 p-2 rounded-xl grid grid-cols-8 gap-1 border-4 border-slate-800 shadow-2xl overflow-hidden"
    >
      <template v-for="(row, r) in grid" :key="'r' + r">
        <div
          v-for="(tile, c) in row"
          :key="r + '-' + c"
          class="tile w-40px h-40px md:(w-45px h-45px) flex items-center justify-center text-2xl cursor-pointer transition-all duration-200"
          :class="[
            selected?.r === r && selected?.c === c
              ? 'bg-white/20 scale-110 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10'
              : 'hover:bg-white/5',
            tile === null ? 'opacity-0 scale-50' : 'opacity-100 scale-100',
          ]"
          @click="selectTile(r, c)"
        >
          {{ tile }}
        </div>
      </template>
    </div>

    <div class="footer text-slate-500 text-xs italic">Swap adjacent fruits to match 3 or more!</div>
  </div>
</template>

<style scoped>
.board {
  user-select: none;
  touch-action: none;
}
.tile {
  -webkit-tap-highlight-color: transparent;
}
</style>
