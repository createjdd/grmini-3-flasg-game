<template>
  <div class="coordinate-page">
    <div class="header">
      <!-- <h1>3D 函数可视化</h1> -->
      <p>在三维空间中动态调试数学函数</p>
    </div>

    <div class="content">
      <div ref="canvasContainer" class="canvas-container"></div>

      <div class="controls-panel">
        <section class="function-selector">
          <h2>选择函数类型</h2>
          <div class="select-group">
            <button
              v-for="(label, type) in functionTypes"
              :key="type"
              :class="{ active: currentFunction === type }"
              @click="currentFunction = type"
            >
              {{ label }}
            </button>
          </div>
        </section>

        <section class="parameter-controls">
          <h2>参数调试</h2>

          <div v-if="currentFunction === 'linear'" class="control-group">
            <div class="param">
              <label>斜率 (k): {{ params.k.toFixed(1) }}</label>
              <input type="range" v-model.number="params.k" min="-5" max="5" step="0.1" />
            </div>
            <div class="param">
              <label>截距 (b): {{ params.b.toFixed(1) }}</label>
              <input type="range" v-model.number="params.b" min="-10" max="10" step="0.5" />
            </div>
          </div>

          <div v-if="currentFunction === 'quadratic'" class="control-group">
            <div class="param">
              <label>系数 (a): {{ params.a.toFixed(2) }}</label>
              <input type="range" v-model.number="params.a" min="-1" max="1" step="0.01" />
            </div>
            <div class="param">
              <label>系数 (b): {{ params.qb.toFixed(1) }}</label>
              <input type="range" v-model.number="params.qb" min="-5" max="5" step="0.1" />
            </div>
            <div class="param">
              <label>常数 (c): {{ params.qc.toFixed(1) }}</label>
              <input type="range" v-model.number="params.qc" min="-5" max="5" step="0.1" />
            </div>
          </div>

          <div v-if="currentFunction === 'inverse'" class="control-group">
            <div class="param">
              <label>系数 (k): {{ params.ik.toFixed(1) }}</label>
              <input type="range" v-model.number="params.ik" min="-20" max="20" step="0.5" />
            </div>
          </div>

          <div v-if="currentFunction === 'sin'" class="control-group">
            <div class="param">
              <label>振幅 (A): {{ params.sa.toFixed(1) }}</label>
              <input type="range" v-model.number="params.sa" min="0" max="10" step="0.1" />
            </div>
            <div class="param">
              <label>频率 (ω): {{ params.sw.toFixed(1) }}</label>
              <input type="range" v-model.number="params.sw" min="0" max="5" step="0.1" />
            </div>
          </div>
        </section>

        <div class="formula-display">
          <h3>当前方程 (XY平面)</h3>
          <p class="formula">{{ currentFormula }}</p>
        </div>

        <div class="tip">
          <p>💡 <b>操作提示：</b> 拖动滑块实时观察曲线变化。鼠标左键旋转视图，滚轮缩放。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const canvasContainer = ref(null)
let scene, camera, renderer, controls, animationId, curveObject, curveGlow

const functionTypes = {
  linear: '正/一次函数',
  inverse: '反比例函数',
  quadratic: '一元二次函数',
  sin: '正弦函数',
}

const currentFunction = ref('quadratic')
const params = reactive({
  k: 1,
  b: 0, // linear
  a: 0.2,
  qb: 0,
  qc: 0, // quadratic
  ik: 5, // inverse
  sa: 3,
  sw: 1, // sin
})

const currentFormula = computed(() => {
  switch (currentFunction.value) {
    case 'linear':
      return `y = ${params.k.toFixed(1)}x + ${params.b.toFixed(1)}`
    case 'inverse':
      return `y = ${params.ik.toFixed(1)} / x`
    case 'quadratic':
      return `y = ${params.a.toFixed(2)}x² + ${params.qb.toFixed(1)}x + ${params.qc.toFixed(1)}`
    case 'sin':
      return `y = ${params.sa.toFixed(1)}sin(${params.sw.toFixed(1)}x)`
    default:
      return ''
  }
})

const initThree = () => {
  if (!canvasContainer.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(15, 15, 15)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Grids
  const size = 30
  const divisions = 30
  const gridColor = 0x334155
  const centerColor = 0x1e293b

  const gridXY = new THREE.GridHelper(size, divisions, gridColor, centerColor)
  gridXY.rotation.x = Math.PI / 2
  scene.add(gridXY)

  const gridXZ = new THREE.GridHelper(size, divisions, gridColor, centerColor)
  scene.add(gridXZ)

  const gridYZ = new THREE.GridHelper(size, divisions, gridColor, centerColor)
  gridYZ.rotation.z = Math.PI / 2
  scene.add(gridYZ)

  // Axes
  const createCustomAxis = (dir, length, color) => {
    const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
    const points = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(length)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    scene.add(new THREE.Line(geometry, material))
    scene.add(new THREE.ArrowHelper(dir, dir.clone().multiplyScalar(length), 0.8, color, 0.3, 0.2))
  }

  const axisLen = 15
  createCustomAxis(new THREE.Vector3(1, 0, 0), axisLen, 0xf87171) // X
  createCustomAxis(new THREE.Vector3(0, 1, 0), axisLen, 0x4ade80) // Y
  createCustomAxis(new THREE.Vector3(0, 0, 1), axisLen, 0x60a5fa) // Z

  // Initial curve
  updateCurve()

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(10, 20, 10)
  scene.add(pointLight)

  window.addEventListener('resize', handleResize)
  animate()
}

const updateCurve = () => {
  if (curveObject) scene.remove(curveObject)
  if (curveGlow) scene.remove(curveGlow)

  const points = []
  const range = 15
  const step = 0.05

  for (let x = -range; x <= range; x += step) {
    let y = 0
    let valid = true

    switch (currentFunction.value) {
      case 'linear':
        y = params.k * x + params.b
        break
      case 'quadratic':
        y = params.a * x * x + params.qb * x + params.qc
        break
      case 'inverse':
        if (Math.abs(x) < 0.1) {
          valid = false
          // Break the curve for inverse function near zero
          if (points.length > 0) createCurveFromPoints(points)
          points.length = 0
        } else {
          y = params.ik / x
        }
        break
      case 'sin':
        y = params.sa * Math.sin(params.sw * x)
        break
    }

    if (valid) {
      if (y > -range && y < range) {
        points.push(new THREE.Vector3(x, y, 0))
      } else if (points.length > 0) {
        createCurveFromPoints(points)
        points.length = 0
      }
    }
  }

  if (points.length > 0) {
    createCurveFromPoints(points)
  }
}

const createCurveFromPoints = (points) => {
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xfde047, linewidth: 3 })
  const line = new THREE.Line(geometry, material)

  const glowMaterial = new THREE.LineBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.3, linewidth: 10 })
  const glowLine = new THREE.Line(geometry, glowMaterial)

  // We add these to a group to manage them easily
  const group = new THREE.Group()
  group.add(line)
  group.add(glowLine)
  scene.add(group)

  // Track the most recent group to remove it later (this is a simplified logic, for multiple segments it would need a group array)
  // But since we only ever have 1 or 2 segments, it's fine for this demo.
  if (!curveObject) {
    curveObject = group
  } else {
    // If it's the second segment of inverse function, we'll keep it simple and just add it.
    // In a production app we'd manage a List of objects.
    curveGlow = group // reusing this variable to hold second segment
  }
}

watch(
  [currentFunction, params],
  () => {
    // Clear any existing segments
    scene.children.slice().forEach((child) => {
      if (child instanceof THREE.Group && child.children.length === 2 && child.children[0] instanceof THREE.Line) {
        scene.remove(child)
      }
    })
    curveObject = null
    curveGlow = null
    updateCurve()
  },
  { deep: true }
)

const handleResize = () => {
  if (!canvasContainer.value || !renderer) return
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

onMounted(() => {
  setTimeout(initThree, 100)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
  if (scene) scene.clear()
})
</script>

<style scoped>
.coordinate-page {
  padding: 2rem;
  min-height: 100vh;
  background-color: #0b0f1a;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  flex: 1;
}

.canvas-container {
  background: #0f172a;
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.controls-panel {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #f8fafc;
}

.select-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

button {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.param {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

input[type='range'] {
  width: 100%;
  accent-color: #3b82f6;
}

.formula-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(253, 224, 71, 0.2);
}

.formula-display h3 {
  font-size: 0.9rem;
  color: #fde047;
  margin-bottom: 0.5rem;
}

.formula {
  font-family: 'Fira Code', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fde047;
  text-align: center;
}

.tip {
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr;
  }
  .controls-panel {
    order: 2;
  }
}
</style>
