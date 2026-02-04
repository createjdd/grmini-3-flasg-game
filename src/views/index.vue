<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Minesweeper from '../components/Minesweeper.vue'
import Gobang from '../components/Gobang.vue'
import Game2048 from '../components/Game2048.vue'
import Snake from '../components/Snake.vue'
import Sudoku from '../components/Sudoku.vue'
import Match3 from '../components/Match3.vue'
import MemoryMatch from '../components/MemoryMatch.vue'

const router = useRouter()
const showMinesweeper = ref(false)
const showGobang = ref(false)
const show2048 = ref(false)
const showSnake = ref(false)
const showSudoku = ref(false)
const showMatch3 = ref(false)
const showMemory = ref(false)

const goTo = (path) => {
  router.push(path)
}

const projects = [
  // 休闲游戏类
  {
    id: 'fps-game',
    name: '第一人称射击',
    icon: '🔫',
    description: '3D FPS游戏，体验真实的射击战斗',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => goTo('/fps-game'),
    featured: true,
  },
  {
    id: 'spider-solitaire',
    name: '蜘蛛纸牌',
    icon: '🕷️',
    description: '经典纸牌游戏，挑战你的策略思维',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => goTo('/spider-solitaire'),
    featured: true,
  },
  {
    id: 'minesweeper',
    name: '经典扫雷',
    icon: '💣',
    description: '考验逻辑推理能力的经典益智游戏',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showMinesweeper.value = true),
    featured: false,
  },
  {
    id: 'memory-match',
    name: '记忆翻牌',
    icon: '🃏',
    description: '训练记忆力的配对游戏',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showMemory.value = true),
    featured: false,
  },
  {
    id: 'gobang',
    name: '五子棋',
    icon: '⚔️',
    description: '传统策略棋类游戏',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showGobang.value = true),
    featured: false,
  },
  {
    id: '2048',
    name: '2048',
    icon: '🔢',
    description: '数字合并益智游戏',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (show2048.value = true),
    featured: false,
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    icon: '🐍',
    description: '经典街机游戏，重温童年回忆',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showSnake.value = true),
    featured: false,
  },
  {
    id: 'sudoku',
    name: '数独',
    icon: '🧩',
    description: '数字逻辑谜题，挑战你的推理能力',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showSudoku.value = true),
    featured: false,
  },
  {
    id: 'match3',
    name: '消消乐',
    icon: '🍎',
    description: '三消类休闲益智游戏',
    category: '休闲游戏',
    categoryColor: 'from-blue-500 to-cyan-500',
    action: () => (showMatch3.value = true),
    featured: false,
  },
  // 神秘探索类
  {
    id: 'tarot',
    name: '塔罗占卜',
    icon: '🃏',
    description: '探索神秘的塔罗牌世界，获取人生指引',
    category: '神秘探索',
    categoryColor: 'from-purple-500 to-pink-500',
    action: () => goTo('/tarot'),
    featured: true,
  },
  {
    id: 'numerology',
    name: '生命灵数',
    icon: '🔢',
    description: '通过数字了解你的性格与命运',
    category: '神秘探索',
    categoryColor: 'from-purple-500 to-pink-500',
    action: () => goTo('/numerology'),
    featured: false,
  },
  {
    id: 'astrology',
    name: '每日星座',
    icon: '✨',
    description: '探索星座运势与性格分析',
    category: '神秘探索',
    categoryColor: 'from-purple-500 to-pink-500',
    action: () => goTo('/astrology'),
    featured: false,
  },
  {
    id: 'runes',
    name: '卢恩符文',
    icon: 'ᚱ',
    description: '古老的北欧符文占卜系统',
    category: '神秘探索',
    categoryColor: 'from-purple-500 to-pink-500',
    action: () => goTo('/runes'),
    featured: false,
  },
  // 科学与数学类
  {
    id: 'coordinate-3d',
    name: '3D 函数演示',
    icon: '📐',
    description: '可视化三维数学函数，探索数学之美',
    category: '科学数学',
    categoryColor: 'from-green-500 to-emerald-500',
    action: () => goTo('/coordinate-3d'),
    featured: true,
  },
  {
    id: 'points',
    name: '点位可视化',
    icon: '📍',
    description: '动态点位分布可视化工具',
    category: '科学数学',
    categoryColor: 'from-green-500 to-emerald-500',
    action: () => goTo('/points'),
    featured: false,
  },
  {
    id: 'moon-phases',
    name: '月相盈亏',
    icon: '🌙',
    description: '探索月相变化规律，了解天文知识',
    category: '科学数学',
    categoryColor: 'from-amber-500 to-orange-500',
    action: () => goTo('/moon-phases'),
    featured: false,
  },
  // UI设计类
  {
    id: 'rupiah-cepat',
    name: 'RupiahCepat UI',
    icon: '💳',
    description: '移动端登录注册页面UI还原',
    category: 'UI设计',
    categoryColor: 'from-blue-500 to-indigo-500',
    action: () => goTo('/rupiah-cepat'),
    featured: false,
  },
]

const featuredProjects = computed(() => projects.filter(p => p.featured))
const otherProjects = computed(() => projects.filter(p => !p.featured))

const categories = computed(() => {
  const cats = {}
  projects.forEach(project => {
    if (!cats[project.category]) {
      cats[project.category] = {
        name: project.category,
        color: project.categoryColor,
        projects: [],
      }
    }
    cats[project.category].projects.push(project)
  })
  return Object.values(cats)
})
</script>

<template>
  <div
    class="home-container min-h-screen w-screen relative bg-slate-950 text-white overflow-x-hidden"
  >
    <!-- 背景装饰 -->
    <div class="fixed inset-0 z-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10 w-full max-w-1400px mx-auto px-20px py-60px md:py-80px">
      <!-- 头部介绍 -->
      <header class="text-center mb-80px">
        <div class="inline-block mb-20px px-20px py-8px bg-white-5 rounded-full border border-white-10">
          <span class="text-0.9rem text-slate-300 tracking-wider">个人作品集</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-900 mb-20px bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          智趣空间
        </h1>
        <p class="text-xl md:text-2xl text-slate-400 max-w-600px mx-auto leading-relaxed">
          探索游戏魅力与科学奥秘的交互式作品集
        </p>
      </header>

      <!-- 精选项目 -->
      <section v-if="featuredProjects.length > 0" class="mb-80px">
        <h2 class="text-2xl md:text-3xl font-700 mb-40px text-slate-200 flex items-center gap-15px">
          <span class="w-8px h-32px bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
          精选作品
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30px">
          <div
            v-for="project in featuredProjects"
            :key="project.id"
            class="project-card group relative overflow-hidden rounded-24px bg-white-5 border border-white-10 backdrop-blur-sm transition-all duration-500 cursor-pointer hover:(-translate-y-8px border-white-20 shadow-2xl)"
            @click="project.action"
          >
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" :class="project.categoryColor"></div>
            <div class="relative p-30px">
              <div class="flex items-start justify-between mb-20px">
                <div class="text-5xl">{{ project.icon }}</div>
                <div class="px-12px py-4px rounded-full text-xs font-600 bg-white-10 text-slate-300">
                  {{ project.category }}
                </div>
              </div>
              <h3 class="text-xl font-700 mb-10px text-slate-100 group-hover:text-white transition-colors">
                {{ project.name }}
              </h3>
              <p class="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                {{ project.description }}
              </p>
              <div class="mt-20px flex items-center gap-8px text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                <span>点击探索</span>
                <span class="group-hover:translate-x-5px transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类展示 -->
      <section
        v-for="category in categories"
        :key="category.name"
        class="mb-60px"
      >
        <div class="flex items-center gap-15px mb-30px">
          <div class="h-1px flex-1 bg-gradient-to-r from-transparent via-white-20 to-transparent"></div>
          <h2 class="text-xl md:text-2xl font-700 text-slate-200 flex items-center gap-12px">
            <span class="text-2xl">{{ category.name === '休闲游戏' ? '🎮' : category.name === '神秘探索' ? '🔮' : '🧬' }}</span>
            {{ category.name }}
          </h2>
          <div class="h-1px flex-1 bg-gradient-to-r from-transparent via-white-20 to-transparent"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20px">
          <div
            v-for="project in category.projects"
            :key="project.id"
            class="project-item group relative overflow-hidden rounded-20px bg-white-5 border border-white-10 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:(-translate-y-4px border-white-20 shadow-xl bg-white-8)"
            @click="project.action"
          >
            <div class="absolute top-0 right-0 w-100px h-100px bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-bl-full" :class="project.categoryColor"></div>
            <div class="relative p-24px">
              <div class="text-4xl mb-15px group-hover:scale-110 transition-transform duration-300">
                {{ project.icon }}
              </div>
              <h3 class="text-lg font-600 mb-8px text-slate-100 group-hover:text-white transition-colors">
                {{ project.name }}
              </h3>
              <p class="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-2">
                {{ project.description }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Game Dialogs -->
    <el-dialog v-model="showMinesweeper" title="扫雷游戏" width="850px" destroy-on-close align-center>
      <Minesweeper />
    </el-dialog>

    <el-dialog v-model="showGobang" title="五子棋" width="850px" destroy-on-close align-center>
      <Gobang />
    </el-dialog>

    <el-dialog v-model="show2048" title="2048" width="500px" destroy-on-close align-center>
      <Game2048 />
    </el-dialog>

    <el-dialog v-model="showSnake" title="贪吃蛇" width="500px" destroy-on-close align-center>
      <Snake />
    </el-dialog>

    <el-dialog v-model="showSudoku" title="数独" width="600px" destroy-on-close align-center>
      <Sudoku />
    </el-dialog>

    <el-dialog v-model="showMatch3" title="消消乐" width="550px" destroy-on-close align-center>
      <Match3 />
    </el-dialog>

    <el-dialog v-model="showMemory" title="记忆翻牌" width="550px" destroy-on-close align-center>
      <MemoryMatch />
    </el-dialog>
  </div>
</template>

<style scoped>
.project-card {
  transform-style: preserve-3d;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover::before {
  opacity: 1;
}

.project-item {
  transform-style: preserve-3d;
}

/* 滚动条样式 */
.home-container::-webkit-scrollbar {
  width: 8px;
}

.home-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.home-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.home-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .home-container {
    padding: 40px 15px;
  }
}
</style>
