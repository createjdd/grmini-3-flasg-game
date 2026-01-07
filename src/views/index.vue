<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Minesweeper from '../components/Minesweeper.vue'
import Gobang from '../components/Gobang.vue'

const router = useRouter()
const showMinesweeper = ref(false)
const showGobang = ref(false)

const goTo = (path) => {
  router.push(path)
}

const categories = [
  {
    title: '休闲板块',
    icon: '🎮',
    items: [
      { name: '经典扫雷', icon: '💣', action: () => (showMinesweeper.value = true), type: 'primary' },
      { name: '五子棋', icon: '⚔️', action: () => (showGobang.value = true), type: 'primary' },
    ],
  },
  {
    title: '神秘探索',
    icon: '🔮',
    items: [
      { name: '塔罗占卜', icon: '🃏', action: () => goTo('/tarot'), type: 'danger' },
      { name: '生命灵数', icon: '🔢', action: () => goTo('/numerology'), type: 'danger' },
      { name: '每日星座', icon: '✨', action: () => goTo('/astrology'), type: 'danger' },
      { name: '卢恩符文', icon: 'ᚱ', action: () => goTo('/runes'), type: 'danger' },
    ],
  },
  {
    title: '科学与数学',
    icon: '🧬',
    items: [
      { name: '3D 函数演示', icon: '📐', action: () => goTo('/coordinate-3d'), type: 'success' },
      { name: '点位可视化', icon: '📍', action: () => goTo('/points'), type: 'success' },
      { name: '月相盈亏', icon: '🌙', action: () => goTo('/moon-phases'), type: 'warning' },
    ],
  },
]
</script>

<template>
  <div
    class="home-container h-screen w-screen relative flex items-center justify-center bg-slate-950 text-white overflow-x-hidden"
  >
    <div class="glass-bg" absolute inset-0 z-1 bg-gradient-to-br from-slate-900 to-black></div>

    <div class="content" relative z-2 w-full max-w-1200px px-20px py-40px>
      <header class="main-header" text-center mb-60px>
        <h1 class="title" text-56px font-800 title-gradient mb-10px tracking-2px>智趣空间</h1>
        <p class="subtitle" text-1.2rem color-slate-400 tracking-4px>探索游戏魅力与科学奥秘</p>
      </header>

      <div class="categories-grid flex flex-row flex-wrap justify-center gap-30px">
        <div
          v-for="cat in categories"
          :key="cat.title"
          class="category-section glass-bg rounded-24px p-30px min-w-300px flex-1"
        >
          <div class="category-header flex items-center gap-15px mb-20px pb-15px border-b border-white-5">
            <span class="cat-icon text-1.8rem">{{ cat.icon }}</span>
            <h2 class="cat-title text-1.4rem font-700 text-slate-100">{{ cat.title }}</h2>
          </div>

          <div class="items-list grid grid-cols-1 gap-15px">
            <div
              v-for="item in cat.items"
              :key="item.name"
              class="entry-card flex items-center gap-20px p-20px bg-white-3 rounded-20px border border-white-5 transition-all duration-300 cursor-pointer active:scale-95 hover:(-translate-y-5px bg-white-8 border-white-20 shadow-xl)"
              :class="item.type"
              @click="item.action"
            >
              <span class="entry-icon text-2.5rem">{{ item.icon }}</span>
              <div class="flex flex-col">
                <span class="entry-name text-1.15rem font-600 text-slate-200">{{ item.name }}</span>
                <span class="text-0.8rem text-slate-400">点击进入探索</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Dialogs -->
    <el-dialog v-model="showMinesweeper" title="扫雷游戏" width="850px" destroy-on-close align-center>
      <Minesweeper />
    </el-dialog>

    <el-dialog v-model="showGobang" title="五子棋" width="850px" destroy-on-close align-center>
      <Gobang />
    </el-dialog>
  </div>
</template>

<style scoped>
/* Only keeping essential or complex styles not easily covered by atomic classes */
.entry-card.primary:hover {
  border-color: #3b82f6;
}
.entry-card.danger:hover {
  border-color: #ef4444;
}
.entry-card.success:hover {
  border-color: #10b981;
}
.entry-card.warning:hover {
  border-color: #f59e0b;
}

.entry-card:hover .entry-icon {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .items-list {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
