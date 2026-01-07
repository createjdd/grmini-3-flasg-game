<script setup>
import { ref, computed } from 'vue'

const birthday = ref('')
const name = ref('')
const result = ref(null)
const isCalculating = ref(false)

const calculateNumerology = () => {
  if (!birthday.value) return

  isCalculating.value = true
  result.value = null

  // Simulate calculation lag for "digital magic" effect
  setTimeout(() => {
    const digits = birthday.value.replace(/-/g, '').split('').map(Number)
    let sum = digits.reduce((a, b) => a + b, 0)

    // Calculate Life Path Number (reduce to single digit unless 11, 22, 33)
    const reduce = (num) => {
      if (num === 11 || num === 22 || num === 33) return num
      if (num < 10) return num
      const s = String(num)
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0)
      return reduce(s)
    }

    const lifePathNumber = reduce(sum)

    result.value = {
      number: lifePathNumber,
      title: getNumberTitle(lifePathNumber),
      meaning: getNumberMeaning(lifePathNumber),
      traits: getNumberTraits(lifePathNumber),
      cycle: getLifeCycle(lifePathNumber),
    }
    isCalculating.value = false
  }, 1500)
}

const getNumberTitle = (n) => {
  const titles = {
    1: '开拓者 (The Pioneer)',
    2: '协调者 (The Peacemaker)',
    3: '表达者 (The Communicator)',
    4: '构建者 (The Builder)',
    5: '探索者 (The Explorer)',
    6: '养育者 (The Nurturer)',
    7: '求法者 (The Seeker)',
    8: '成就者 (The Powerhouse)',
    9: '博爱者 (The Humanitarian)',
    11: '精神先知 (The Visionary)',
    22: '大师级构建者 (The Master Builder)',
    33: '大师级导师 (The Master Teacher)',
  }
  return titles[n] || '探索中'
}

const getNumberMeaning = (n) => {
  const meanings = {
    1: '代表独立、自信和领导力。你注定要走不寻常的路。',
    2: '代表合作、平衡和直觉。你擅长外交和建立联系。',
    3: '代表创意、自我表达和社交。你有极强的艺术天赋。',
    4: '代表务实、勤奋和纪律。你喜欢稳定和打持久战。',
    5: '代表自由、多才多艺和冒险。你渴望变化和感官体验。',
    6: '代表责任、爱心和和谐。你是家庭和朋友的支柱。',
    7: '代表智慧、内省和分析。你热衷于挖掘事物的真相。',
    8: '代表权威、丰盛和果断。你与物质成就和事业有缘。',
    9: '代表同情、奉献和包容。你拥有古老的灵魂。',
    11: '充满直觉和灵感。你是连接物质世界与精神世界的桥梁。',
    22: '具有将宏大理想转化为现实的能力，是世界的改变者。',
    33: '代表最高等级的慈悲与治愈力，是纯粹的精神导师。',
  }
  return meanings[n] || ''
}

const getNumberTraits = (n) => {
  const traits = {
    1: ['领导力', '独创性', '野心', '自我'],
    2: ['敏锐', '优雅', '耐心', '温顺'],
    3: ['幽默', '乐观', '热情', '多言'],
    4: ['诚实', '固执', '逻辑', '可靠'],
    5: ['好奇', '变通', '反叛', '机智'],
    6: ['责任', '体贴', '正义', '奉献'],
    7: ['严谨', '孤傲', '求真', '直觉'],
    8: ['力量', '效率', '名誉', '坚毅'],
    9: ['无私', '浪漫', '觉醒', '深刻'],
    11: ['洞察力', '高度敏感', '神秘', '感召力'],
    22: ['远见', '卓越组织力', '无坚不摧', '理想主义者'],
    33: ['无条件爱', '疗愈', '服务至上', '宁静'],
  }
  return traits[n] || []
}

const getLifeCycle = (n) => {
  return [
    { stage: '形成期 (0-28岁)', focus: '建立自我认同与基础技能' },
    { stage: '产出期 (28-56岁)', focus: '个人潜力的最大化发挥与事业建立' },
    { stage: '收获期 (56岁+)', focus: '智慧传承与精神领域的深耕' },
  ]
}
</script>

<template>
  <div class="numerology-container">
    <div class="matrix-bg"></div>

    <div class="glass-panel">
      <header class="header">
        <el-button icon="Back" circle @click="$router.push('/')" />
        <h1>数字能量 & 生命灵数</h1>
      </header>

      <section class="input-area">
        <p class="desc">数字是宇宙的语言，每个人的诞生日期都蕴含着独特的共振频率。</p>
        <div class="form">
          <el-date-picker
            v-model="birthday"
            type="date"
            placeholder="选择你的出生日期"
            value-format="YYYY-MM-DD"
            class="full-width"
          />
          <el-button type="primary" class="calc-btn" @click="calculateNumerology" :loading="isCalculating">
            {{ isCalculating ? '能量计算中...' : '解码生命数字' }}
          </el-button>
        </div>
      </section>

      <transition name="fade">
        <section v-if="result" class="result-area">
          <div class="number-display">
            <span class="num-glow">{{ result.number }}</span>
            <div class="title-wrap">
              <h2>{{ result.title }}</h2>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>核心特质</h3>
              <p>{{ result.meaning }}</p>
              <div class="tags">
                <span v-for="tag in result.traits" :key="tag" class="tag"># {{ tag }}</span>
              </div>
            </div>

            <div class="info-card">
              <h3>生命周期</h3>
              <div class="cycle-list">
                <div v-for="item in result.cycle" :key="item.stage" class="cycle-item">
                  <span class="stage">{{ item.stage }}</span>
                  <span class="focus">{{ item.focus }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.numerology-container {
  min-height: 100vh;
  width: 100vw;
  background: #020617;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: #f8fafc;
}

.matrix-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 1;
}

.glass-panel {
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 800px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(90deg, #00ff41, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desc {
  color: #94a3b8;
  margin-bottom: 25px;
}

.form {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.full-width {
  flex: 1;
}

.calc-btn {
  background: #059669;
  border: none;
  font-weight: bold;
}

.result-area {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}

.number-display {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
}

.num-glow {
  font-size: 5rem;
  font-weight: 900;
  color: #00ff41;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
  font-family: 'Courier New', Courier, monospace;
}

.title-wrap h2 {
  font-size: 1.5rem;
  color: #ecfeff;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-card h3 {
  color: #00ff41;
  font-size: 1rem;
  margin-bottom: 15px;
}

.info-card p {
  line-height: 1.6;
  font-size: 0.95rem;
  color: #cbd5e0;
}

.tags {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(0, 255, 65, 0.1);
  color: #00ff41;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.cycle-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cycle-item {
  display: flex;
  flex-direction: column;
}

.stage {
  font-weight: bold;
  font-size: 0.85rem;
  color: #94a3b8;
}

.focus {
  font-size: 0.9rem;
  color: #e2e8f0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s, transform 0.8s;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 640px) {
  .form {
    flex-direction: column;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .number-display {
    flex-direction: column;
    text-align: center;
  }
}
</style>
