<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// UI State
const day = ref(1) // 1-30 days
const canvasContainer = ref(null)

// Three.js Variables
let scene, camera, renderer, controls
let pipCamera // Secondary camera for "View from Earth"
let earth, moon, sunLight, stars, lightArrows
const ORBIT_RADIUS = 12

const initThree = () => {
  if (!canvasContainer.value) return

  // Scene & Starfield
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050510)

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(20, 15, 25)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.shadowMap.enabled = true
  canvasContainer.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Earth
  const earthGeo = new THREE.SphereGeometry(4, 64, 64)
  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
    specular: 0x555555,
    shininess: 25,
  })
  earth = new THREE.Mesh(earthGeo, earthMat)
  scene.add(earth)

  // Moon
  const moonGeo = new THREE.SphereGeometry(1.2, 32, 32)
  const moonMat = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    specular: 0x222222,
    shininess: 5,
  })
  moon = new THREE.Mesh(moonGeo, moonMat)
  scene.add(moon)

  // Sun (Directional Light)
  // We place the "Sun" far away on the Z axis
  sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
  sunLight.position.set(0, 0, 50)
  sunLight.castShadow = true
  scene.add(sunLight)

  // Ambient Light (subtle fill)
  const ambient = new THREE.AmbientLight(0x404040, 0.2)
  scene.add(ambient)

  // Stars (Particles)
  const starsGeo = new THREE.BufferGeometry()
  const starCount = 2000
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 1000
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
  stars = new THREE.Points(starsGeo, starsMat)
  scene.add(stars)

  // PIP Camera (View from Earth)
  pipCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000)
  pipCamera.position.set(0, 0, 0) // At Earth's center

  // Sunlight Flow Arrows
  lightArrows = new THREE.Group()
  const arrowDir = new THREE.Vector3(0, 0, -1)
  const arrowLen = 15
  const arrowColor = 0xffff00
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const origin = new THREE.Vector3(i * 10, j * 10, 40)
      const arrow = new THREE.ArrowHelper(arrowDir, origin, arrowLen, arrowColor, 2, 1)
      lightArrows.add(arrow)
    }
  }
  scene.add(lightArrows)

  // Initial Update
  updateMoonPosition()

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate)
    earth.rotation.y += 0.002
    controls.update()

    // Main Render
    renderer.setViewport(0, 0, canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
    renderer.setScissorTest(false)
    renderer.render(scene, camera)

    // PIP Render (Bottom Right)
    const pipSize = Math.min(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight) * 0.25
    renderer.setScissorTest(true)
    renderer.setScissor(canvasContainer.value.clientWidth - pipSize - 20, 20, pipSize, pipSize)
    renderer.setViewport(canvasContainer.value.clientWidth - pipSize - 20, 20, pipSize, pipSize)

    // Update moon phases from earth's POV is tricky with shadowMap, but standard lighting works
    pipCamera.lookAt(moon.position)
    renderer.render(scene, pipCamera)
  }
  animate()

  window.addEventListener('resize', handleResize)
}

const updateMoonPosition = () => {
  if (!moon) return
  // Angle mapped from day 1-30 to 0 - 2PI
  const angle = ((day.value - 1) / 30) * Math.PI * 2
  moon.position.x = Math.sin(angle) * ORBIT_RADIUS
  moon.position.z = Math.cos(angle) * ORBIT_RADIUS

  // Make the moon always face earth (for realism in textures if added)
  moon.lookAt(0, 0, 0)
}

const handleResize = () => {
  if (!canvasContainer.value) return
  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

watch(day, () => {
  updateMoonPosition()
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div class="moon-visualization">
    <div class="ui-panel">
      <div class="header">
        <el-button icon="Back" circle @click="$router.push('/')" />
        <h2>月相盈亏模拟</h2>
      </div>

      <div class="control-group">
        <label>农历日期 (第 {{ day }} 天)</label>
        <el-slider v-model="day" :min="1" :max="30" :step="1" />
        <div class="phase-name">
          当前相位: <span class="highlight">{{ getPhaseName(day) }}</span>
        </div>
      </div>

      <div class="legend">
        <div class="info-card">
          <h4>如何观察？</h4>
          <p>1. 阳光从画面<b>后方</b>（正对屏幕方向）射入。</p>
          <p>2. 第 15 天左右为<b>满月</b>（月亮在地球背面）。</p>
          <p>3. 第 1 天或 30 天为<b>新月</b>（月亮在地球和太阳之间）。</p>
          <p>4. 拖动滑块观察阴影变化。</p>
        </div>
      </div>
    </div>

    <div class="viewport" ref="canvasContainer">
      <div class="overlay-hint">左键旋转视角 | 右键平移 | 滚轮缩放</div>
      <div class="pip-label">从地球观察 (地心视角)</div>
    </div>
  </div>
</template>

<script>
// Non-setup helper for phase names
export default {
  methods: {
    getPhaseName(day) {
      if (day === 1 || day === 30) return '新月 / 朔'
      if (day > 1 && day < 7) return '娥眉月'
      if (day === 7 || day === 8) return '上弦月'
      if (day > 8 && day < 15) return '盈凸月'
      if (day === 15 || day === 16) return '满月 / 望'
      if (day > 16 && day < 22) return '亏凸月'
      if (day === 22 || day === 23) return '下弦月'
      if (day > 23 && day < 30) return '残月'
      return '观察中'
    },
  },
}
</script>

<style scoped>
.moon-visualization {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.ui-panel {
  width: 320px;
  background: rgba(15, 20, 35, 0.9);
  backdrop-filter: blur(10px);
  padding: 30px 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header h2 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: 1px;
}

.control-group label {
  display: block;
  margin-bottom: 15px;
  color: #a0aec0;
  font-size: 0.9rem;
}

.phase-name {
  margin-top: 20px;
  font-size: 1.1rem;
}

.highlight {
  color: #f6e05e;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(246, 224, 94, 0.5);
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h4 {
  margin: 0 0 10px 0;
  color: #63b3ed;
}

.info-card p {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #cbd5e0;
  margin: 5px 0;
}

.viewport {
  flex: 1;
  position: relative;
}

.overlay-hint {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #a0aec0;
  pointer-events: none;
}

.pip-label {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
  pointer-events: none;
}
</style>
