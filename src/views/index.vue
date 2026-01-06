<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Minesweeper from '../components/Minesweeper.vue'
import Gobang from '../components/Gobang.vue'

const router = useRouter()
const showMinesweeper = ref(false)
const showGobang = ref(false)

const openGame = (game) => {
  if (game === 'minesweeper') {
    showMinesweeper.value = true
  } else if (game === 'gobang') {
    showGobang.value = true
  }
}

const goTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="container">
    <div class="game-center">
      <div class="game-entries">
        <el-button type="warning" size="large" @click="openGame('minesweeper')">
          <span class="icon">🎮</span> 扫雷
        </el-button>
        <el-button type="success" size="large" @click="openGame('gobang')">
          <span class="icon">♟️</span> 五子棋
        </el-button>
        <el-button type="primary" size="large" @click="goTo('/tarot')"> <span class="icon">🎭</span> 塔罗牌 </el-button>
        <el-button type="info" size="large" @click="goTo('/coordinate-3d')">
          <span class="icon">📐</span> 3D 函数
        </el-button>
      </div>
    </div>

    <!-- Minesweeper Dialog -->
    <el-dialog v-model="showMinesweeper" title="扫雷" width="fit-content" destroy-on-close>
      <Minesweeper />
    </el-dialog>

    <!-- Gobang Dialog -->
    <el-dialog v-model="showGobang" title="五子棋" width="600px" destroy-on-close>
      <Gobang />
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.game-center {
  text-align: center;
  background: #fff;
  padding: 50px 80px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.game-center:hover {
  transform: translateY(-5px);
}

h1 {
  margin-bottom: 40px;
  color: #303133;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 2px;
}

.game-entries {
  display: flex;
  gap: 25px;
  justify-content: center;
}

.el-button--large {
  padding: 25px 40px;
  font-size: 1.2rem;
  border-radius: 12px;
}

.icon {
  margin-right: 10px;
  font-size: 1.5rem;
}
</style>
