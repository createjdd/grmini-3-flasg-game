<template>
  <div class="fps-game-container">
    <!-- 游戏画布容器 -->
    <div ref="gameContainer" class="game-canvas"></div>

    <!-- HUD界面 -->
    <div class="hud-overlay">
      <!-- 准星 -->
      <div class="crosshair">
        <div class="crosshair-line crosshair-top"></div>
        <div class="crosshair-line crosshair-bottom"></div>
        <div class="crosshair-line crosshair-left"></div>
        <div class="crosshair-line crosshair-right"></div>
        <div class="crosshair-center"></div>
      </div>

      <!-- 血量条 -->
      <div class="health-bar">
        <div class="health-fill" :style="{ width: `${playerHealth}%` }"></div>
        <span class="health-text">{{ Math.max(0, Math.floor(playerHealth)) }}%</span>
      </div>

      <!-- 弹药信息 -->
      <div class="ammo-display">
        <div class="ammo-current">{{ currentAmmo }}</div>
        <div class="ammo-separator">/</div>
        <div class="ammo-reserve">{{ reserveAmmo }}</div>
      </div>

      <!-- 武器名称 -->
      <div class="weapon-name">{{ currentWeaponName }}</div>

      <!-- 击杀提示 -->
      <div v-if="killFeed.length > 0" class="kill-feed">
        <div
          v-for="(kill, index) in killFeed"
          :key="index"
          class="kill-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <span class="killer">{{ kill.killer }}</span>
          <span class="weapon-icon">{{ kill.weapon }}</span>
          <span class="victim">{{ kill.victim }}</span>
        </div>
      </div>

      <!-- 受伤效果 -->
      <div
        v-if="damageIndicator"
        class="damage-indicator"
        :style="{ opacity: damageIndicator }"
      ></div>

      <!-- 击杀提示 -->
      <div v-if="showKillNotification" class="kill-notification">
        <div class="kill-text">KILL</div>
        <div class="kill-subtext">{{ killStreak }}x KILLSTREAK</div>
      </div>
    </div>

    <!-- 游戏菜单 -->
    <div v-if="showMenu" class="game-menu">
      <div class="menu-content">
        <h2>FPS GAME</h2>
        <div class="menu-stats">
          <div class="stat-item">
            <span>Kills:</span>
            <span class="stat-value">{{ stats.kills }}</span>
          </div>
          <div class="stat-item">
            <span>Deaths:</span>
            <span class="stat-value">{{ stats.deaths }}</span>
          </div>
          <div class="stat-item">
            <span>Accuracy:</span>
            <span class="stat-value">{{ stats.accuracy }}%</span>
          </div>
        </div>
        <div class="menu-buttons">
          <button @click="resumeGame" class="menu-btn">Resume</button>
          <button @click="restartGame" class="menu-btn">Restart</button>
          <button @click="exitGame" class="menu-btn">Exit</button>
        </div>
      </div>
    </div>

    <!-- 开始提示 -->
    <div v-if="!gameStarted" class="start-screen">
      <h1>FPS GAME</h1>
      <p>Click to start</p>
      <div class="controls-info">
        <div class="control-item">
          <span class="key">WASD</span>
          <span>Move</span>
        </div>
        <div class="control-item">
          <span class="key">Mouse</span>
          <span>Look</span>
        </div>
        <div class="control-item">
          <span class="key">Left Click</span>
          <span>Shoot</span>
        </div>
        <div class="control-item">
          <span class="key">R</span>
          <span>Reload</span>
        </div>
        <div class="control-item">
          <span class="key">1-3</span>
          <span>Switch Weapon</span>
        </div>
        <div class="control-item">
          <span class="key">ESC</span>
          <span>Menu</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { FPSController } from './fps-game/core/FPSController'
import { WeaponSystem } from './fps-game/core/WeaponSystem'
import { PhysicsSystem } from './fps-game/core/PhysicsSystem'
import { AISystem } from './fps-game/core/AISystem'
import { EffectSystem } from './fps-game/core/EffectSystem'
import { AudioSystem } from './fps-game/core/AudioSystem'
import { GameManager } from './fps-game/core/GameManager'

const router = useRouter()
const gameContainer = ref(null)

// 游戏状态
const gameStarted = ref(false)
const showMenu = ref(false)
const playerHealth = ref(100)
const currentAmmo = ref(30)
const reserveAmmo = ref(90)
const currentWeaponName = ref('Assault Rifle')
const killFeed = ref([])
const damageIndicator = ref(0)
const showKillNotification = ref(false)
const killStreak = ref(0)

// 游戏统计
const stats = reactive({
  kills: 0,
  deaths: 0,
  shots: 0,
  hits: 0,
  get accuracy() {
    return this.shots > 0 ? Math.round((this.hits / this.shots) * 100) : 0
  },
})

// Three.js核心对象
let scene, camera, renderer
let fpsController, weaponSystem, physicsSystem, aiSystem, effectSystem, audioSystem, gameManager

// 初始化游戏
const initGame = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb) // 天空蓝
  scene.fog = new THREE.Fog(0x87ceeb, 0, 1000)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.set(0, 1.6, 0) // 眼睛高度

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  gameContainer.value.appendChild(renderer.domElement)

  // 初始化系统
  physicsSystem = new PhysicsSystem(scene)
  effectSystem = new EffectSystem(scene, camera)
  audioSystem = new AudioSystem()
  fpsController = new FPSController(camera, scene)
  weaponSystem = new WeaponSystem(camera, effectSystem, audioSystem, physicsSystem, fpsController)
  aiSystem = new AISystem(scene, physicsSystem, effectSystem, audioSystem)
  gameManager = new GameManager(
    scene,
    weaponSystem,
    aiSystem,
    physicsSystem,
    effectSystem,
    audioSystem
  )

  // 设置事件监听
  setupEventListeners()

  // 创建游戏世界
  createGameWorld()

  // 开始游戏循环
  animate()
}

// 创建游戏世界
const createGameWorld = () => {
  // 地面
  const groundGeometry = new THREE.PlaneGeometry(200, 200)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a5d23,
    roughness: 0.8,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 添加一些建筑物和障碍物
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.7,
  })

  // 创建一些随机建筑物
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 5 + 3
    const buildingGeometry = new THREE.BoxGeometry(size, size * 2, size)
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(
      (Math.random() - 0.5) * 150,
      size,
      (Math.random() - 0.5) * 150
    )
    building.castShadow = true
    building.receiveShadow = true
    scene.add(building)
  }

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(50, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.left = -100
  directionalLight.shadow.camera.right = 100
  directionalLight.shadow.camera.top = 100
  directionalLight.shadow.camera.bottom = -100
  scene.add(directionalLight)

  // 生成敌人
  aiSystem.spawnEnemies(10)
}

// 设置事件监听
const setupEventListeners = () => {
  // 武器事件
  weaponSystem.on('ammoChanged', (data) => {
    currentAmmo.value = data.current
    reserveAmmo.value = data.reserve
  })

  weaponSystem.on('weaponChanged', (data) => {
    currentWeaponName.value = data.name
  })

  weaponSystem.on('shotFired', () => {
    stats.shots++
  })

  weaponSystem.on('hit', () => {
    stats.hits++
  })

  // 物理系统事件
  physicsSystem.on('enemyHit', (data) => {
    // 创建命中特效
    if (data.hitPoint) {
      // 计算法线方向（从命中点指向敌人中心）
      // 通过物理系统获取敌人对象
      const enemy = physicsSystem.enemies.get(data.enemyId)
      let normal = new THREE.Vector3(0, 1, 0) // 默认法线
      
      if (enemy && enemy.mesh) {
        // 计算从命中点到敌人中心的方向作为法线
        normal = new THREE.Vector3()
          .subVectors(data.hitPoint, enemy.mesh.position)
          .normalize()
      }
      
      effectSystem.createEnemyHitEffect(data.hitPoint, normal)
    }

    if (data.killed) {
      stats.kills++
      killStreak.value++
      showKillNotification.value = true
      setTimeout(() => {
        showKillNotification.value = false
      }, 2000)

      killFeed.value.unshift({
        killer: 'You',
        weapon: '🔫',
        victim: `Enemy ${data.enemyId}`,
      })
      if (killFeed.value.length > 5) {
        killFeed.value.pop()
      }
    }
  })

  physicsSystem.on('environmentHit', (data) => {
    // 创建环境命中特效（弹痕+火花）
    effectSystem.createBulletHole(data.point, data.normal, data.object)
    effectSystem.createHitEffect(data.point, data.normal)
  })

  physicsSystem.on('playerHit', (data) => {
    playerHealth.value = data.health
    damageIndicator.value = 1
    setTimeout(() => {
      damageIndicator.value = 0
    }, 200)
  })

  // AI系统事件
  aiSystem.on('enemyKilled', () => {
    // 处理敌人被击杀
  })
}

// 游戏循环
const animate = () => {
  requestAnimationFrame(animate)

  if (!gameStarted.value || showMenu.value) return

  const delta = 0.016 // 约60fps

  // 更新系统
  fpsController.update(delta)
  weaponSystem.update(delta)
  
  // 更新AI系统（传递玩家位置）
  const playerPosition = fpsController.getPosition()
  aiSystem.updatePlayerPosition(playerPosition)
  
  // 更新物理系统的玩家信息
  physicsSystem.updatePlayer(playerPosition, playerHealth.value)
  
  aiSystem.update(delta)
  effectSystem.update(delta)
  
  // 更新游戏管理器
  gameManager.update(delta, playerPosition)
  
  // 检查游戏结束条件
  if (playerHealth.value <= 0) {
    stats.deaths++
    // 可以在这里添加游戏结束逻辑
  }

  // 渲染
  renderer.render(scene, camera)
}

// 开始游戏
const startGame = () => {
  gameStarted.value = true
  fpsController.enable()
  document.body.style.cursor = 'none'
}

// 恢复游戏
const resumeGame = () => {
  showMenu.value = false
  fpsController.enable()
  document.body.style.cursor = 'none'
}

// 重启游戏
const restartGame = () => {
  // 重置状态
  playerHealth.value = 100
  stats.kills = 0
  stats.deaths = 0
  stats.shots = 0
  stats.hits = 0
  killStreak.value = 0
  killFeed.value = []

  // 重新初始化
  if (renderer) {
    gameContainer.value.removeChild(renderer.domElement)
  }
  initGame()
  showMenu.value = false
  gameStarted.value = true
  fpsController.enable()
}

// 退出游戏
const exitGame = () => {
  router.push('/')
}

// 鼠标点击开始
const handleClick = (e) => {
  if (!gameStarted.value) {
    startGame()
  }
}

// 键盘事件
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    showMenu.value = !showMenu.value
    if (showMenu.value) {
      fpsController.disable()
      document.body.style.cursor = 'default'
    } else {
      fpsController.enable()
      document.body.style.cursor = 'none'
    }
  }
}

// 窗口大小调整
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  initGame()
  window.addEventListener('click', handleClick)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClick)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)

  if (fpsController) fpsController.dispose()
  if (weaponSystem) weaponSystem.dispose()
  if (aiSystem) aiSystem.dispose()
  if (effectSystem) effectSystem.dispose()
  if (audioSystem) audioSystem.dispose()

  if (renderer) {
    renderer.dispose()
    if (gameContainer.value && renderer.domElement) {
      gameContainer.value.removeChild(renderer.domElement)
    }
  }
})
</script>

<style scoped>
.fps-game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.game-canvas {
  width: 100%;
  height: 100%;
}

.hud-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

/* 准星 */
.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
}

.crosshair-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
}

.crosshair-top {
  top: 0;
  left: 50%;
  width: 2px;
  height: 8px;
  transform: translateX(-50%);
}

.crosshair-bottom {
  bottom: 0;
  left: 50%;
  width: 2px;
  height: 8px;
  transform: translateX(-50%);
}

.crosshair-left {
  left: 0;
  top: 50%;
  width: 8px;
  height: 2px;
  transform: translateY(-50%);
}

.crosshair-right {
  right: 0;
  top: 50%;
  width: 8px;
  height: 2px;
  transform: translateY(-50%);
}

.crosshair-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

/* 血量条 */
.health-bar {
  position: absolute;
  bottom: 30px;
  left: 30px;
  width: 300px;
  height: 30px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f97316);
  transition: width 0.3s ease;
}

.health-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 弹药显示 */
.ammo-display {
  position: absolute;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: baseline;
  gap: 5px;
  color: white;
  font-size: 48px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.ammo-current {
  font-size: 48px;
}

.ammo-separator {
  font-size: 32px;
  opacity: 0.5;
}

.ammo-reserve {
  font-size: 32px;
  opacity: 0.7;
}

/* 武器名称 */
.weapon-name {
  position: absolute;
  bottom: 90px;
  right: 30px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* 击杀提示 */
.kill-feed {
  position: absolute;
  top: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kill-item {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 15px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

.kill-item .killer {
  color: #60a5fa;
  font-weight: bold;
}

.kill-item .victim {
  color: #f87171;
}

.kill-item .weapon-icon {
  margin: 0 8px;
}

/* 受伤效果 */
.damage-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* 击杀通知 */
.kill-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  animation: killPulse 0.5s ease;
}

.kill-text {
  font-size: 72px;
  font-weight: 900;
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
  text-transform: uppercase;
  letter-spacing: 8px;
}

.kill-subtext {
  font-size: 24px;
  color: #fbbf24;
  margin-top: 10px;
  text-transform: uppercase;
}

/* 游戏菜单 */
.game-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.menu-content {
  text-align: center;
  color: white;
}

.menu-content h2 {
  font-size: 48px;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.menu-stats {
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin: 10px auto;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.stat-value {
  color: #fbbf24;
  font-weight: bold;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-btn {
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 开始屏幕 */
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: white;
}

.start-screen h1 {
  font-size: 64px;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 8px;
}

.start-screen p {
  font-size: 24px;
  margin-bottom: 60px;
  opacity: 0.7;
}

.controls-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.key {
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-weight: bold;
  min-width: 100px;
  text-align: center;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes killPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
}
</style>
