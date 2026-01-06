<template>
  <div class="tarot-page">
    <div class="header">
      <h1>神秘塔罗</h1>
      <p>探索命运的指引</p>
    </div>

    <div class="main-content">
      <div v-if="gameState === 'start'" class="start-screen">
        <div class="spread-options">
          <div class="option-card" @click="startReading(1)">
            <h3>每日占卜</h3>
            <p>抽取一张牌，获得今日的启示</p>
          </div>
          <div class="option-card" @click="startReading(3)">
            <h3>时间之流</h3>
            <p>三牌阵：过去、现在、未来</p>
          </div>
        </div>

        <div class="rules-section">
          <h2>塔罗牌规则说明</h2>
          <div class="rules-content">
            <section>
              <h3>什么是塔罗牌？</h3>
              <p>
                塔罗牌是一种古老的占卜工具，由78张牌组成（本游戏使用22张大阿卡纳牌）。它们代表了人生的不同阶段、性格特质和宇宙法则。
              </p>
            </section>
            <section>
              <h3>如何进行占卜？</h3>
              <ul>
                <li><strong>静心：</strong> 在开始前，闭上眼，深呼吸，心中默念你想了解的问题。</li>
                <li><strong>选牌：</strong> 凭直觉点击卡牌阵型开始。</li>
                <li><strong>解读：</strong> 每一张牌都有正位和逆位之分，代表不同的能量导向。</li>
              </ul>
            </section>
            <section>
              <h3>关于牌阵</h3>
              <p><strong>每日占卜：</strong> 简单直接，适合了解当下的整体能量状态。</p>
              <p><strong>过去-现在-未来：</strong> 深入探索一个问题的因果脉络，帮助你从时间维度理解现状。</p>
            </section>
          </div>
        </div>
      </div>

      <div v-else class="game-screen">
        <div class="deck-area" :class="{ 'cards-drawn': drawnCards.length > 0 }">
          <div v-if="drawnCards.length === 0" class="shuffle-animation">
            <div
              class="card-back shadow"
              v-for="i in 10"
              :key="i"
              :class="{ 'is-shuffling': isShuffling }"
              :style="{
                transform: isShuffling ? '' : `translate(${i * 2}px, ${i * 2}px)`,
                animationDelay: `${i * 0.1}s`,
              }"
            >
              <div class="mystic-pattern"></div>
            </div>
            <button class="draw-btn" @click="drawAllCards" :disabled="isShuffling">
              {{ isShuffling ? '正在洗牌...' : '洗牌并抽牌' }}
            </button>
          </div>

          <div v-else class="spread-display" :class="`spread-${spreadSize}`">
            <div
              v-for="(card, index) in drawnCards"
              :key="index"
              class="card-container"
              :class="{ flipped: card.isFlipped }"
              @click="flipCard(index)"
            >
              <div class="card-inner">
                <div class="card-front">
                  <div class="card-image" :class="{ reversed: card.isReversed }">
                    <div class="card-icon">{{ card.data.icon }}</div>
                  </div>
                  <div class="card-info">
                    <span class="card-num">{{ card.data.num }}</span>
                    <h4 class="card-name">{{ card.data.name }} {{ card.isReversed ? '(逆位)' : '(正位)' }}</h4>
                  </div>
                </div>
                <div class="card-back">
                  <div class="mystic-pattern"></div>
                </div>
              </div>
              <div class="spread-label" v-if="spreadSize === 3">
                {{ ['过去', '现在', '未来'][index] }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedCardIdx !== null" class="interpretation-panel">
          <h3>
            {{ drawnCards[selectedCardIdx].data.name }} - {{ drawnCards[selectedCardIdx].isReversed ? '逆位' : '正位' }}
          </h3>
          <p class="meaning">
            {{
              drawnCards[selectedCardIdx].isReversed
                ? drawnCards[selectedCardIdx].data.reversed
                : drawnCards[selectedCardIdx].data.upright
            }}
          </p>
          <p class="description">{{ drawnCards[selectedCardIdx].data.description }}</p>
        </div>

        <div class="actions">
          <button class="back-btn" @click="resetGame">重新选择牌阵</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const gameState = ref('start') // start, game
const spreadSize = ref(1)
const drawnCards = ref([])
const selectedCardIdx = ref(null)
const isShuffling = ref(false)

const tarotData = [
  {
    num: '0',
    name: '愚者',
    icon: '🃏',
    upright: '新的开始、自由、纯真',
    reversed: '鲁莽、由于恐惧而停滞',
    description: '愚者代表一个新旅程的开始，充满了无限的可能性和纯粹的信心。',
  },
  {
    num: 'I',
    name: '魔术师',
    icon: '🪄',
    upright: '创造力、行动力、意志',
    reversed: '操纵、未开发的潜力',
    description: '魔术师代表着通过意志力将想法转化为现实的能力。',
  },
  {
    num: 'II',
    name: '女祭司',
    icon: '🌙',
    upright: '直觉、潜意识、智慧',
    reversed: '内心的混乱、被阻碍的直觉',
    description: '女祭司是潜意识的守护者，代表着深刻的直觉和精神洞察力。',
  },
  {
    num: 'III',
    name: '皇后',
    icon: '👑',
    upright: '丰饶、母性、感官享受',
    reversed: '创造力受阻、过度依赖',
    description: '皇后代表大地的母亲，象征着生命、艺术和感性的充盈。',
  },
  {
    num: 'IV',
    name: '皇帝',
    icon: '🏰',
    upright: '权威、结构、稳固',
    reversed: '暴政、缺乏自律',
    description: '皇帝代表秩序和权力，是行动的指引者和保护者。',
  },
  {
    num: 'V',
    name: '教皇',
    icon: '🕍',
    upright: '传统、精神引导、合群',
    reversed: '叛逆、挑战现状',
    description: '教皇代表传统的价值观和精神上的学习。',
  },
  {
    num: 'VI',
    name: '恋人',
    icon: '💖',
    upright: '爱、和谐、选择',
    reversed: '失衡、自爱受损',
    description: '恋人不仅仅关乎爱情，更关乎在价值观上的重要抉择。',
  },
  {
    num: 'VII',
    name: '战车',
    icon: '🏹',
    upright: '胜利、自控、决心',
    reversed: '失控、侵略性',
    description: '战车代表通过坚强的意志和专注力取得的胜利。',
  },
  {
    num: 'VIII',
    name: '力量',
    icon: '🦁',
    upright: '勇气、耐力、内在力量',
    reversed: '自我怀疑、软弱',
    description: '力量代表温柔的掌控，是通过爱而非暴力克服困难。',
  },
  {
    num: 'IX',
    name: '隐士',
    icon: '💡',
    upright: '内省、独处、寻求真理',
    reversed: '隔离、孤独、偏执',
    description: '隐士暗示着向内探索，寻求真相的旅程。',
  },
  {
    num: 'X',
    name: '命运之轮',
    icon: '🎡',
    upright: '运气、改变、命运',
    reversed: '厄运、抗拒改变',
    description: '命运之轮提醒我们，生活是循环往复的，改变是唯一的永恒。',
  },
  {
    num: 'XI',
    name: '正义',
    icon: '⚖️',
    upright: '公平、真理、因果',
    reversed: '不公、缺乏责任感',
    description: '正义代表着对他人的公平对待以及对自己行为的负责。',
  },
  {
    num: 'XII',
    name: '倒吊人',
    icon: '🧘',
    upright: '牺牲、新的视角、停滞',
    reversed: '无谓的牺牲、逃避现实',
    description: '倒吊人暗示通过暂时的停顿或牺牲来获得全新的视野。',
  },
  {
    num: 'XIII',
    name: '死神',
    icon: '💀',
    upright: '终结、转变、新生',
    reversed: '抗拒改变、恐惧停滞',
    description: '死神通常代表一个旧阶段的结束，为新事物腾出空间。',
  },
  {
    num: 'XIV',
    name: '节制',
    icon: '⚖️',
    upright: '平衡、平和、融合',
    reversed: '不均衡、过度享受',
    description: '节制代表在对立的力量中寻找中间地带。',
  },
  {
    num: 'XV',
    name: '恶魔',
    icon: '🔥',
    upright: '束缚、成瘾、唯物主义',
    reversed: '解脱、自我觉醒',
    description: '恶魔象征着我们内心的阴影和那些限制我们自由的欲望。',
  },
  {
    num: 'XVI',
    name: '高塔',
    icon: '⚡',
    upright: '突变、动荡、毁灭',
    reversed: '勉强避免灾难、恐惧改变',
    description: '高塔代表着根基的动摇和瞬间的崩塌，往往是真实觉醒的前提。',
  },
  {
    num: 'XVII',
    name: '星星',
    icon: '✨',
    upright: '希望、宁静、复兴',
    reversed: '失望、丧失信心',
    description: '星星是在黑暗之后带来的宁静，象征着疗愈和新的信念。',
  },
  {
    num: 'XVIII',
    name: '月亮',
    icon: '🌙',
    upright: '幻觉、恐惧、焦虑',
    reversed: '拨云见日、直面恐惧',
    description: '月亮揭示了事物的模糊性，需要我们依靠直觉穿透幻象。',
  },
  {
    num: 'XIX',
    name: '太阳',
    icon: '☀️',
    upright: '成就、喜悦、活力',
    reversed: '暂时的阴霾、不现实的乐观',
    description: '太阳是塔罗牌中最积极的牌之一，象征着光明、成功和活力。',
  },
  {
    num: 'XX',
    name: '审判',
    icon: '🔔',
    upright: '觉醒、使命感、重生',
    reversed: '自我怀疑、逃避召唤',
    description: '审判意味着清晰的自我评估和接受新的使命。',
  },
  {
    num: 'XXI',
    name: '世界',
    icon: '🌎',
    upright: '完成、成功、旅行',
    reversed: '延迟、未完成的事业',
    description: '世界代表一段旅程的完美终章，象征着成就与完整。',
  },
]

const startReading = (size) => {
  spreadSize.value = size
  gameState.value = 'game'
  drawnCards.value = []
  selectedCardIdx.value = null
}

const drawAllCards = () => {
  if (isShuffling.value) return
  isShuffling.value = true

  // Wait for shuffle animation
  setTimeout(() => {
    const deck = [...tarotData]
    const result = []
    for (let i = 0; i < spreadSize.value; i++) {
      const randomIdx = Math.floor(Math.random() * deck.length)
      const cardData = deck.splice(randomIdx, 1)[0]
      result.push({
        data: cardData,
        isReversed: Math.random() > 0.5,
        isFlipped: false,
      })
    }
    drawnCards.value = result
    isShuffling.value = false
  }, 2000)
}

const flipCard = (index) => {
  if (!drawnCards.value[index].isFlipped) {
    drawnCards.value[index].isFlipped = true
  }
  selectedCardIdx.value = index
}

const resetGame = () => {
  gameState.value = 'start'
  drawnCards.value = []
  selectedCardIdx.value = null
}
</script>

<style scoped>
.tarot-page {
  min-height: 100vh;
  background-color: #0b0f1a;
  background-image: radial-gradient(circle at 50% 50%, rgba(26, 31, 60, 0.5) 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h2v2H1V1zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2zm10 10h2v2h-2v-2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  color: #e2e8f0;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8, #c084fc, #e879f9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.header p {
  color: #94a3b8;
  font-size: 1.1rem;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
}

.spread-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}

.option-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-card:hover {
  transform: translateY(-5px);
  background: rgba(30, 41, 59, 0.6);
  border-color: #818cf8;
  box-shadow: 0 10px 30px -10px rgba(129, 140, 248, 0.3);
}

.option-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #f8fafc;
}

.rules-section {
  background: rgba(30, 41, 59, 0.2);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.rules-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #c084fc;
}

.rules-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.rules-content h3 {
  color: #818cf8;
  margin-bottom: 0.75rem;
}

.rules-content ul {
  padding-left: 1.25rem;
}

.rules-content li {
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

/* Game Screen */
.deck-area {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.shuffle-animation {
  position: relative;
  width: 180px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-back {
  width: 180px;
  height: 300px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 4px solid #334155;
  border-radius: 1rem;
  position: absolute;
}

.mystic-pattern {
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0l25 25-25 25L0 25z' stroke='%23334155' fill='none' stroke-width='1'/%3E%3C/svg%3E");
  opacity: 0.3;
}

.draw-btn {
  position: relative;
  z-index: 10;
  padding: 1rem 2rem;
  background: #818cf8;
  color: white;
  border: none;
  border-radius: 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.draw-btn:hover:not(:disabled) {
  background: #6366f1;
  transform: scale(1.05);
}

.draw-btn:disabled {
  background: #475569;
  cursor: wait;
}

.card-back.is-shuffling {
  animation: shuffle-move 1.5s infinite ease-in-out;
}

@keyframes shuffle-move {
  0%,
  100% {
    transform: translate(0, 0) rotate(0);
  }
  25% {
    transform: translate(-100px, -20px) rotate(-10deg);
  }
  50% {
    transform: translate(100px, 20px) rotate(10deg);
  }
  75% {
    transform: translate(0, -40px) rotate(5deg);
  }
}

.spread-display {
  display: flex;
  gap: 3rem;
  justify-content: center;
  perspective: 1000px;
}

.card-container {
  width: 180px;
  height: 300px;
  cursor: pointer;
  position: relative;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.card-container.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 1rem;
  border: 4px solid #818cf8;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-front {
  transform: rotateY(180deg);
  background: #f8fafc;
  color: #1e293b;
  border-color: #c084fc;
}

.card-image {
  font-size: 5rem;
  margin-bottom: 2rem;
  transition: transform 0.3s;
}

.card-image.reversed {
  transform: rotate(180deg);
}

.card-info {
  position: absolute;
  bottom: 2rem;
  width: 100%;
}

.card-num {
  display: block;
  font-size: 0.9rem;
  font-weight: bold;
  color: #64748b;
}

.card-name {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.spread-label {
  position: absolute;
  bottom: -40px;
  width: 100%;
  text-align: center;
  font-weight: 600;
  color: #818cf8;
}

.interpretation-panel {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 3rem;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.meaning {
  font-size: 1.25rem;
  font-weight: 600;
  color: #c084fc;
  margin-bottom: 1rem;
}

.description {
  color: #cbd5e1;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

@media (max-width: 768px) {
  .spread-options {
    grid-template-columns: 1fr;
  }
  .spread-display {
    flex-direction: column;
    align-items: center;
    gap: 5rem;
  }
}
</style>
