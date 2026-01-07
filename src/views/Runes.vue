<script setup>
import { ref } from 'vue'

const drawnRunes = ref([])
const isDrawing = ref(false)

const runeData = [
  { symbol: 'ᚠ', name: 'Fehu', meaning: '财富、繁荣', desc: '象征流动的能量和物质财富。' },
  { symbol: 'ᚢ', name: 'Uruz', meaning: '力量、耐力', desc: '象征野牛的力量和原始的生命力。' },
  { symbol: 'ᚦ', name: 'Thurisaz', meaning: '冲突、守护', desc: '象征雷神之锤，保护与破坏并存。' },
  { symbol: 'ᚨ', name: 'Ansuz', meaning: '沟通、灵感', desc: '象征神启和语言的力量。' },
  { symbol: 'ᚱ', name: 'Raido', meaning: '旅行、节奏', desc: '象征旅程和生活的节律。' },
  { symbol: 'ᚲ', name: 'Kenaz', meaning: '火、洞察', desc: '象征真理的火炬和创造力。' },
  { symbol: 'ᚷ', name: 'Gebo', meaning: '礼物、平衡', desc: '象征伙伴关系和互惠。' },
  { symbol: 'ᚹ', name: 'Wunjo', meaning: '喜悦、和谐', desc: '象征纯粹的快乐和归属感。' },
  { symbol: 'ᚺ', name: 'Hagalaz', meaning: '风暴、剧变', desc: '象征不可控的自然力量和变革。' },
  { symbol: 'ᚾ', name: 'Nauthiz', meaning: '需求、磨炼', desc: '象征匮乏带来的动力和自我克制。' },
  { symbol: 'ᛁ', name: 'Isa', meaning: '冰、静止', desc: '象征冻结、延迟和内在的专注。' },
  { symbol: 'header:Jera', name: 'Jera', meaning: '收获、周期', desc: '象征因果报应和劳动的成果。' },
  { symbol: 'ᛇ', name: 'Eihwaz', meaning: '耐力、转变', desc: '象征世界之树，连接生死的韧性。' },
  { symbol: 'ᛈ', name: 'Perthro', meaning: '秘密、机遇', desc: '象征命运之杯和未知的可能性。' },
  { symbol: 'ᛉ', name: 'Algiz', meaning: '保护、连接', desc: '象征神圣的守护和直觉。' },
  { symbol: 'ᛊ', name: 'Sowilo', meaning: '太阳、成功', desc: '象征胜利的光芒和治愈的力量。' },
  { symbol: 'ᛏ', name: 'Tiwaz', meaning: '正义、牺牲', desc: '象征勇气的战神，追求荣耀与秩序。' },
  { symbol: 'ᛒ', name: 'Berkano', meaning: '重生、成长', desc: '象征白桦树，代表孕育与新的开始。' },
  { symbol: 'ᛖ', name: 'Ehwaz', meaning: '伙伴、速度', desc: '象征马，代表团队间的信任与协作。' },
  { symbol: 'ᛗ', name: 'Mannaz', meaning: '人类、意识', desc: '象征自我认知和社会纽带。' },
  { symbol: 'ᛚ', name: 'Laguz', meaning: '水、流体', desc: '象征潜意识、幻想与生命的流动。' },
  { symbol: 'ᛝ', name: 'Ingwaz', meaning: '潜力、圆满', desc: '象征种子，代表潜藏的力量和收尾。' },
  { symbol: 'ᛟ', name: 'Othala', meaning: '遗产、家园', desc: '象征家族的传统和坚实的根基。' },
  { symbol: 'ᛞ', name: 'Dagaz', meaning: '破晓、明晰', desc: '象征转折点和突然的觉悟。' },
]

const drawRune = () => {
  if (isDrawing.value) return
  isDrawing.value = true
  drawnRunes.value = []

  setTimeout(() => {
    // Pick 3 random runes for a spread
    const shuffled = [...runeData].sort(() => 0.5 - Math.random())
    drawnRunes.value = shuffled.slice(0, 3)
    isDrawing.value = false
  }, 1200)
}
</script>

<template>
  <div class="runes-container">
    <div class="ancient-overlay"></div>

    <div class="content">
      <header class="header">
        <el-button icon="Back" circle @click="$router.push('/')" />
        <h1>卢恩符文 (Runes)</h1>
      </header>

      <section class="sacred-space" @click="drawRune">
        <div class="rune-bag" :class="{ shake: isDrawing }">
          <div class="bag-icon">🌑</div>
          <p>{{ isDrawing ? '正在感知符文能量...' : '点击袋子，抽取你的指引' }}</p>
        </div>
      </section>

      <div class="rune-spread">
        <div v-for="(rune, index) in drawnRunes" :key="index" class="rune-card">
          <div class="stone">
            <span class="symbol">{{ rune.symbol }}</span>
          </div>
          <div class="rune-info">
            <h3>{{ rune.name }}</h3>
            <span class="meaning">{{ rune.meaning }}</span>
            <p class="desc">{{ rune.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.runes-container {
  min-height: 100vh;
  width: 100vw;
  background: #1a1512;
  color: #d2c0a8;
  padding: 40px;
  position: relative;
  overflow-x: hidden;
}

.ancient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://www.transparenttextures.com/patterns/dark-leather.png');
  opacity: 0.2;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 60px;
}

.header h1 {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  letter-spacing: 4px;
  color: #e5e7eb;
}

.sacred-space {
  text-align: center;
  margin-bottom: 80px;
  cursor: pointer;
}

.rune-bag {
  display: inline-block;
  padding: 40px;
  border: 2px dashed rgba(210, 192, 168, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.rune-bag:hover {
  background: rgba(210, 192, 168, 0.05);
  border-color: #d2c0a8;
}

.bag-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.shake {
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0% {
    transform: translate(0, 0) rotate(0);
  }
  25% {
    transform: translate(-5px, 0) rotate(-5deg);
  }
  50% {
    transform: translate(0, 5px) rotate(0);
  }
  75% {
    transform: translate(5px, 0) rotate(5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0);
  }
}

.rune-spread {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.rune-card {
  width: 280px;
  background: rgba(255, 255, 255, 0.03);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(210, 192, 168, 0.1);
  text-align: center;
  animation: slideUp 0.8s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stone {
  width: 100px;
  height: 120px;
  margin: 0 auto 25px;
  background: #2d2a2a;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 0.5), 5px 5px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid #3d3b3b;
}

.symbol {
  font-size: 3.5rem;
  color: #f3f4f6;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.rune-info h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #f3f4f6;
}

.meaning {
  display: block;
  font-size: 0.9rem;
  color: #fbbf24;
  margin-bottom: 15px;
  font-weight: bold;
}

.desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .rune-card {
    width: 100%;
  }
}
</style>
