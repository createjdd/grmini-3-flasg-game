<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// UI State
const is3D = ref(true)
const newPoint = ref({ x: 0, y: 0, z: 0, color: '#409EFF', label: '' })
const points = ref([])
const canvasContainer = ref(null)

// Three.js Scene Variables
let scene, camera, renderer, controls, gridHelper, axesHelper
let pointObjects = []

const initThree = () => {
  if (!canvasContainer.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f2f5)

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(10, 10, 10)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Helpers
  axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)

  gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  scene.add(directionalLight)

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // Handle Resize
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  if (!canvasContainer.value) return
  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

const addPoint = () => {
  const p = { ...newPoint.value }
  if (!is3D.value) p.z = 0

  // Add to Data List
  points.value.push(p)

  // Add to Three.js Scene
  const geometry = new THREE.SphereGeometry(0.2, 32, 32)
  const material = new THREE.MeshPhongMaterial({ color: p.color })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(p.x, p.y, p.z)
  scene.add(sphere)

  pointObjects.push(sphere)

  // Reset Form (keep color)
  newPoint.value.x = 0
  newPoint.value.y = 0
  newPoint.value.z = 0
  newPoint.value.label = ''
}

const removePoint = (index) => {
  const sphere = pointObjects[index]
  scene.remove(sphere)
  sphere.geometry.dispose()
  sphere.material.dispose()

  points.value.splice(index, 1)
  pointObjects.splice(index, 1)
}

const clearAll = () => {
  pointObjects.forEach((obj) => {
    scene.remove(obj)
    obj.geometry.dispose()
    obj.material.dispose()
  })
  pointObjects = []
  points.value = []
}

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (renderer) {
    renderer.dispose()
  }
})

// Watch for 2D/3D toggle to update helpers
watch(is3D, (val) => {
  if (val) {
    gridHelper.rotation.x = 0
  } else {
    // In "2D" mode we often look at XY plane, but Three.js grid is XZ by default
    // We can rotate it or just leave it. Let's make it clearer.
  }
})
</script>

<template>
  <div class="point-visualizer">
    <div class="sidebar">
      <div class="header">
        <el-button icon="Back" circle @click="$router.push('/')" />
        <h2>点位可视化</h2>
      </div>

      <el-form label-position="top">
        <el-form-item label="维度模式">
          <el-radio-group v-model="is3D">
            <el-radio-button :label="true">3D</el-radio-button>
            <el-radio-button :label="false">2D</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="coords-input">
          <el-form-item label="X 坐标">
            <el-input-number v-model="newPoint.x" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="Y 坐标">
            <el-input-number v-model="newPoint.y" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item v-if="is3D" label="Z 坐标">
            <el-input-number v-model="newPoint.z" :precision="2" :step="1" />
          </el-form-item>
        </div>

        <el-form-item label="点位颜色">
          <el-color-picker v-model="newPoint.color" />
        </el-form-item>

        <el-form-item label="标签 (可选)">
          <el-input v-model="newPoint.label" placeholder="输入点位名称" />
        </el-form-item>

        <el-button type="primary" class="add-btn" @click="addPoint">添加点位</el-button>
        <el-button type="danger" plain @click="clearAll">清空所有</el-button>
      </el-form>

      <div class="points-list" v-if="points.length > 0">
        <h3>已添加点位 ({{ points.length }})</h3>
        <div class="list-container">
          <div v-for="(p, index) in points" :key="index" class="point-item">
            <div class="point-info">
              <span class="color-dot" :style="{ backgroundColor: p.color }"></span>
              <span class="coords">({{ p.x }}, {{ p.y }}{{ is3D ? `, ${p.z}` : '' }})</span>
              <span class="label" v-if="p.label"> - {{ p.label }}</span>
            </div>
            <el-button icon="Delete" type="danger" size="small" link @click="removePoint(index)" />
          </div>
        </div>
      </div>
    </div>

    <div class="main-viewport" ref="canvasContainer">
      <div class="viewport-overlay">
        <p>左键: 旋转 | 右键: 平移 | 滚轮: 缩放</p>
        <div class="axes-legend">
          <span class="red">X 轴 (红)</span>
          <span class="green">Y 轴 (绿)</span>
          <span class="blue">Z 轴 (蓝)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.point-visualizer {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f0f2f5;
}

.sidebar {
  width: 350px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.coords-input {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.add-btn {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.points-list {
  margin-top: 30px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.points-list h3 {
  font-size: 1rem;
  margin-bottom: 15px;
  color: #606266;
}

.list-container {
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f2f6fc;
}

.point-item:last-child {
  border-bottom: none;
}

.point-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 0.9rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.main-viewport {
  flex: 1;
  position: relative;
}

.viewport-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 15px;
  border-radius: 8px;
  pointer-events: none;
  font-size: 0.85rem;
  color: #606266;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.viewport-overlay p {
  margin: 0 0 8px 0;
}

.axes-legend {
  display: flex;
  gap: 15px;
  font-weight: bold;
}

.red {
  color: #f56c6c;
}
.green {
  color: #67c23a;
}
.blue {
  color: #409eff;
}
</style>
