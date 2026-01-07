<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const birthday = ref('')
const zodiacInfo = ref(null)
const canvasContainer = ref(null)
const isCalculating = ref(false)

// Three.js Scene Setup (Starfield)
let scene, camera, renderer, stars
const initStarfield = () => {
  if (!canvasContainer.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  // Create stars
  const starsGeo = new THREE.BufferGeometry()
  const starCount = 5000
  const posArray = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  const starsMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff })
  stars = new THREE.Points(starsGeo, starsMat)
  scene.add(stars)

  const animate = () => {
    requestAnimationFrame(animate)
    stars.rotation.y += 0.0005
    stars.rotation.x += 0.0002
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  if (!canvasContainer.value) return
  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

onMounted(() => {
  initStarfield()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
})

const getZodiac = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const signs = [
    { name: '摩羯座', range: [1, 20], icon: '♑', element: '土象', trait: '务实、坚毅' },
    { name: '水瓶座', range: [2, 19], icon: '♒', element: '风象', trait: '创新、博爱' },
    { name: '双鱼座', range: [3, 20], icon: '♓', element: '水象', trait: '浪漫、敏感' },
    { name: '白羊座', range: [4, 20], icon: '♈', element: '火象', trait: '热情、勇敢' },
    { name: '金牛座', range: [5, 21], icon: '♉', element: '土象', trait: '稳重、执着' },
    { name: '双子座', range: [6, 21], icon: '♊', element: '风象', trait: '机智、多变' },
    { name: '巨蟹座', range: [7, 23], icon: '♋', element: '水象', trait: '温柔、细腻' },
    { name: '狮子座', range: [8, 23], icon: '♌', element: '火象', trait: '自信、大方' },
    { name: '处女座', range: [9, 23], icon: '♍', element: '土象', trait: '守序、细心' },
    { name: '天秤座', range: [10, 23], icon: '♎', element: '风象', trait: '公正、优雅' },
    { name: '天蝎座', range: [11, 22], icon: '♏', element: '水象', trait: '深沉、神秘' },
    { name: '射手座', range: [12, 22], icon: '♐', element: '火象', trait: '乐观、自由' },
  ]

  const thresholds = [20, 19, 20, 20, 21, 21, 23, 23, 23, 23, 22, 22]
  let index = month - 1
  if (day < thresholds[index]) {
    index = (index + 11) % 12
  }

  return signs[index]
}

const updateHoroscope = () => {
  if (!birthday.value) return
  isCalculating.value = true

  setTimeout(() => {
    const sign = getZodiac(birthday.value)
    zodiacInfo.value = {
      ...sign,
      horoscope: {
        today: '由于星象运行至吉位，今天你的能量非常充沛。适合进行重要的决策或开启新的计划。',
        love: '感情运势平稳，适合深度的共同话题交流。',
        career: '工作中可能会遇到一些小的挑战，但你的耐心将化解一切。',
        wealth: '财富运势上升，可能会有意外的小惊喜。',
      },
    }
    isCalculating.value = false
  }, 1000)
}
</script>

<template>
  <div class="astrology-container">
    <div class="starfield" ref="canvasContainer"></div>

    <div class="ui-overlay">
      <header class="header">
        <el-button icon="Back" circle @click="$router.push('/')" />
        <h1>星盘与每日星座</h1>
      </header>

      <div class="main-content">
        <div class="input-card">
          <p class="guide">输入你的生日，连接属于你的恒星能量。</p>
          <div class="form">
            <el-date-picker
              v-model="birthday"
              type="date"
              placeholder="选择生日"
              value-format="YYYY-MM-DD"
              @change="updateHoroscope"
            />
          </div>
        </div>

        <transition name="scale">
          <div v-if="zodiacInfo" class="report-card">
            <div class="sign-header">
              <span class="sign-icon">{{ zodiacInfo.icon }}</span>
              <div class="sign-meta">
                <h2>{{ zodiacInfo.name }}</h2>
                <span class="element-tag">{{ zodiacInfo.element }} 元素</span>
              </div>
            </div>

            <div class="traits-box">
              <p>
                核心特质：<strong>{{ zodiacInfo.trait }}</strong>
              </p>
            </div>

            <div class="horoscope-grid">
              <div class="h-item">
                <h4>今日总评</h4>
                <p>{{ zodiacInfo.horoscope.today }}</p>
              </div>
              <div class="h-item">
                <h4>感情运势</h4>
                <p>{{ zodiacInfo.horoscope.love }}</p>
              </div>
              <div class="h-item">
                <h4>事业学业</h4>
                <p>{{ zodiacInfo.horoscope.career }}</p>
              </div>
              <div class="h-item">
                <h4>财富指向</h4>
                <p>{{ zodiacInfo.horoscope.wealth }}</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.astrology-container {
  min-height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
  position: relative;
  overflow: hidden;
  color: white;
}

.starfield {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.ui-overlay {
  position: relative;
  z-index: 10;
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 1.8rem;
  letter-spacing: 2px;
  background: linear-gradient(to right, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.input-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
  text-align: center;
}

.report-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 30px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 0 50px rgba(167, 139, 250, 0.1);
}

.sign-header {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
}

.sign-icon {
  font-size: 4rem;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sign-meta h2 {
  font-size: 2rem;
  margin-bottom: 5px;
}

.element-tag {
  background: rgba(167, 139, 250, 0.2);
  color: #c4b5fd;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.traits-box {
  margin-bottom: 40px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid #a78bfa;
}

.horoscope-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.h-item h4 {
  color: #a78bfa;
  margin-bottom: 12px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.h-item p {
  line-height: 1.6;
  color: #cbd5e0;
  font-size: 0.95rem;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .horoscope-grid {
    grid-template-columns: 1fr;
  }
}
</style>
