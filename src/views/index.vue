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
  <div class="home-container">
    <div class="glass-bg"></div>

    <div class="content">
      <header class="main-header">
        <h1 class="title">智趣空间</h1>
        <p class="subtitle">探索游戏魅力与科学奥秘</p>
      </header>

      <div class="categories-grid">
        <div v-for="cat in categories" :key="cat.title" class="category-section">
          <div class="category-header">
            <span class="cat-icon">{{ cat.icon }}</span>
            <h2 class="cat-title">{{ cat.title }}</h2>
          </div>

          <div class="items-list">
            <div v-for="item in cat.items" :key="item.name" class="entry-card" :class="item.type" @click="item.action">
              <span class="entry-icon">{{ item.icon }}</span>
              <span class="entry-name">{{ item.name }}</span>
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
.home-container {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  color: white;
  overflow-x: hidden;
}

.glass-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 30%, #1e293b 0%, #0f172a 100%);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 40px 20px;
}

.main-header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  letter-spacing: 4px;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.category-section {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cat-icon {
  font-size: 1.5rem;
}

.cat-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #e2e8f0;
}

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.entry-card {
  height: 120px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 256, 0.05);
}

.entry-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.entry-icon {
  font-size: 2.2rem;
  transition: transform 0.3s ease;
}

.entry-card:hover .entry-icon {
  transform: scale(1.1);
}

.entry-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #cbd5e0;
}

/* Variants */
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

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  .items-list {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
