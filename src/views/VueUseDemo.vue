<template>
  <div class="vueuse-demo-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <h1 class="title">VueUse 常用 API 示例</h1>
        <p class="subtitle">VueUse 是一个强大的 Vue Composition API 工具库</p>
      </header>

      <!-- API Examples Grid -->
      <div class="examples-grid">
        <!-- 1. useMouse -->
        <div class="example-card">
          <h3 class="card-title">1. useMouse - 鼠标位置</h3>
          <p class="card-desc">实时追踪鼠标坐标</p>
          <div class="demo-area" ref="mouseArea">
            <div class="mouse-indicator" :style="{ left: `${x}px`, top: `${y}px` }"></div>
            <div class="mouse-info">
              <div>X: {{ x }}</div>
              <div>Y: {{ y }}</div>
            </div>
          </div>
          <pre class="code-block"><code>{{ mouseCode }}</code></pre>
        </div>

        <!-- 2. useWindowSize -->
        <div class="example-card">
          <h3 class="card-title">2. useWindowSize - 窗口尺寸</h3>
          <p class="card-desc">响应式获取窗口宽高</p>
          <div class="demo-area">
            <div class="size-display">
              <div class="size-item">
                <span class="label">宽度:</span>
                <span class="value">{{ width }}px</span>
              </div>
              <div class="size-item">
                <span class="label">高度:</span>
                <span class="value">{{ height }}px</span>
              </div>
            </div>
          </div>
          <pre class="code-block"><code>{{ windowSizeCode }}</code></pre>
        </div>

        <!-- 3. useToggle -->
        <div class="example-card">
          <h3 class="card-title">3. useToggle - 切换状态</h3>
          <p class="card-desc">便捷的布尔值切换</p>
          <div class="demo-area">
            <button class="demo-button" @click="toggle()">
              {{ isToggled ? '✅ 已开启' : '❌ 已关闭' }}
            </button>
            <p class="demo-text">状态: {{ isToggled }}</p>
          </div>
          <pre class="code-block"><code>{{ toggleCode }}</code></pre>
        </div>

        <!-- 4. useCounter -->
        <div class="example-card">
          <h3 class="card-title">4. useCounter - 计数器</h3>
          <p class="card-desc">数字增减操作</p>
          <div class="demo-area">
            <div class="counter-controls">
              <button class="demo-button" @click="dec()">-</button>
              <span class="counter-value">{{ count }}</span>
              <button class="demo-button" @click="inc()">+</button>
            </div>
            <button class="demo-button" @click="set(0)" style="margin-top: 10px">重置</button>
          </div>
          <pre class="code-block"><code>{{ counterCode }}</code></pre>
        </div>

        <!-- 5. useLocalStorage -->
        <div class="example-card">
          <h3 class="card-title">5. useLocalStorage - 本地存储</h3>
          <p class="card-desc">持久化存储数据</p>
          <div class="demo-area">
            <input
              v-model="storageValue"
              class="demo-input"
              placeholder="输入内容，刷新页面后仍保留"
            />
            <p class="demo-text">存储值: {{ storageValue }}</p>
          </div>
          <pre class="code-block"><code>{{ localStorageCode }}</code></pre>
        </div>

        <!-- 6. useDebounce -->
        <div class="example-card">
          <h3 class="card-title">6. useDebounce - 防抖</h3>
          <p class="card-desc">延迟执行，避免频繁触发</p>
          <div class="demo-area">
            <input
              v-model="inputValue"
              class="demo-input"
              placeholder="输入内容..."
            />
            <p class="demo-text">原始值: {{ inputValue }}</p>
            <p class="demo-text">防抖值: {{ debouncedValue }}</p>
          </div>
          <pre class="code-block"><code>{{ debounceCode }}</code></pre>
        </div>

        <!-- 7. useThrottle -->
        <div class="example-card">
          <h3 class="card-title">7. useThrottle - 节流</h3>
          <p class="card-desc">限制执行频率</p>
          <div class="demo-area">
            <button class="demo-button" @click="throttleCount++">
              点击计数 (节流 1秒)
            </button>
            <p class="demo-text">原始计数: {{ throttleCount }}</p>
            <p class="demo-text">节流计数: {{ throttledCount }}</p>
          </div>
          <pre class="code-block"><code>{{ throttleCode }}</code></pre>
        </div>

        <!-- 8. useClipboard -->
        <div class="example-card">
          <h3 class="card-title">8. useClipboard - 剪贴板</h3>
          <p class="card-desc">复制和读取剪贴板内容</p>
          <div class="demo-area">
            <input
              v-model="clipboardText"
              class="demo-input"
              placeholder="输入要复制的内容"
            />
            <button class="demo-button" @click="copy(clipboardText)">
              {{ copied ? '✅ 已复制!' : '📋 复制' }}
            </button>
            <p v-if="copied" class="demo-text success">复制成功!</p>
          </div>
          <pre class="code-block"><code>{{ clipboardCode }}</code></pre>
        </div>

        <!-- 9. useTimestamp -->
        <div class="example-card">
          <h3 class="card-title">9. useTimestamp - 时间戳</h3>
          <p class="card-desc">实时更新的时间戳</p>
          <div class="demo-area">
            <div class="timestamp-display">
              <div class="timestamp-value">{{ timestamp }}</div>
              <div class="timestamp-formatted">
                {{ new Date(timestamp).toLocaleString() }}
              </div>
            </div>
          </div>
          <pre class="code-block"><code>{{ timestampCode }}</code></pre>
        </div>

        <!-- 10. useDark -->
        <div class="example-card">
          <h3 class="card-title">10. useDark - 暗色模式</h3>
          <p class="card-desc">切换明暗主题</p>
          <div class="demo-area">
            <button class="demo-button" @click="toggleDark()">
              {{ isDark ? '🌙 暗色模式' : '☀️ 亮色模式' }}
            </button>
            <p class="demo-text">当前模式: {{ isDark ? '暗色' : '亮色' }}</p>
          </div>
          <pre class="code-block"><code>{{ darkCode }}</code></pre>
        </div>

        <!-- 11. useScroll -->
        <div class="example-card">
          <h3 class="card-title">11. useScroll - 滚动监听</h3>
          <p class="card-desc">监听滚动位置和方向</p>
          <div class="demo-area scroll-demo" ref="scrollArea">
            <div class="scroll-content">
              <p>滚动这个区域</p>
              <div style="height: 500px; padding: 20px;">
                <p>滚动位置: X={{ scrollX }}, Y={{ scrollY }}</p>
                <p>滚动方向: {{ scrollDirection }}</p>
              </div>
            </div>
          </div>
          <pre class="code-block"><code>{{ scrollCode }}</code></pre>
        </div>

        <!-- 12. useEventListener -->
        <div class="example-card">
          <h3 class="card-title">12. useEventListener - 事件监听</h3>
          <p class="card-desc">便捷的事件监听器</p>
          <div class="demo-area">
            <button class="demo-button" ref="eventButton">
              点击我或按任意键
            </button>
            <p class="demo-text">按键: {{ keyPressed || '无' }}</p>
            <p class="demo-text">点击次数: {{ clickCount }}</p>
          </div>
          <pre class="code-block"><code>{{ eventListenerCode }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  useMouse,
  useWindowSize,
  useToggle,
  useCounter,
  useLocalStorage,
  useDebounce,
  useThrottle,
  useClipboard,
  useTimestamp,
  useDark,
  useScroll,
  useEventListener,
} from '@vueuse/core'

// 1. useMouse
const mouseArea = ref(null)
const { x, y } = useMouse({ target: mouseArea })

// 2. useWindowSize
const { width, height } = useWindowSize()

// 3. useToggle
const [isToggled, toggle] = useToggle(false)

// 4. useCounter
const { count, inc, dec, set } = useCounter(0)

// 5. useLocalStorage
const storageValue = useLocalStorage('vueuse-demo-storage', 'Hello VueUse!')

// 6. useDebounce
const inputValue = ref('')
const debouncedValue = useDebounce(inputValue, 500)

// 7. useThrottle
const throttleCount = ref(0)
const throttledCount = useThrottle(throttleCount, 1000)

// 8. useClipboard
const clipboardText = ref('Hello from VueUse!')
const { copy, copied } = useClipboard()

// 9. useTimestamp
const timestamp = useTimestamp({ interval: 1000 })

// 10. useDark
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
}

// 11. useScroll
const scrollArea = ref(null)
const { x: scrollX, y: scrollY, directions } = useScroll(scrollArea, {
  behavior: 'smooth'
})
const scrollDirection = computed(() => {
  if (directions.top) return '向上'
  if (directions.bottom) return '向下'
  if (directions.left) return '向左'
  if (directions.right) return '向右'
  return '无'
})

// 12. useEventListener
const eventButton = ref(null)
const keyPressed = ref('')
const clickCount = ref(0)

useEventListener('keydown', (e) => {
  keyPressed.value = e.key
  setTimeout(() => {
    keyPressed.value = ''
  }, 1000)
})

useEventListener(eventButton, 'click', () => {
  clickCount.value++
})

// Code examples
const mouseCode = `import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()`

const windowSizeCode = `import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()`

const toggleCode = `import { useToggle } from '@vueuse/core'

const [isToggled, toggle] = useToggle(false)`

const counterCode = `import { useCounter } from '@vueuse/core'

const { count, inc, dec, set } = useCounter(0)`

const localStorageCode = `import { useLocalStorage } from '@vueuse/core'

const storage = useLocalStorage('key', 'default')`

const debounceCode = `import { useDebounce } from '@vueuse/core'

const debounced = useDebounce(source, 500)`

const throttleCode = `import { useThrottle } from '@vueuse/core'

const throttled = useThrottle(source, 1000)`

const clipboardCode = `import { useClipboard } from '@vueuse/core'

const { copy, copied } = useClipboard()`

const timestampCode = `import { useTimestamp } from '@vueuse/core'

const timestamp = useTimestamp({ interval: 1000 })`

const darkCode = `import { useDark } from '@vueuse/core'

const isDark = useDark()`

const scrollCode = `import { useScroll } from '@vueuse/core'

const { x, y, directions } = useScroll(element)`

const eventListenerCode = `import { useEventListener } from '@vueuse/core'

useEventListener('keydown', (e) => {
  console.log(e.key)
})`
</script>

<style scoped>
.vueuse-demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 20px;
  opacity: 0.9;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.example-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.example-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.demo-area {
  min-height: 120px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
}

.mouse-area {
  position: relative;
  height: 200px;
}

.mouse-indicator {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: all 0.1s;
}

.mouse-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.size-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.size-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  font-weight: 700;
  color: #667eea;
  font-size: 18px;
}

.demo-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-button:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.demo-button:active {
  transform: translateY(0);
}

.demo-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.demo-text.success {
  color: #10b981;
  font-weight: 600;
}

.demo-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.demo-input:focus {
  outline: none;
  border-color: #667eea;
}

.counter-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.counter-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  min-width: 60px;
  text-align: center;
}

.timestamp-display {
  text-align: center;
}

.timestamp-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.timestamp-formatted {
  font-size: 14px;
  color: #666;
}

.scroll-demo {
  max-height: 300px;
  overflow-y: auto;
}

.scroll-content {
  padding: 20px;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.code-block code {
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .examples-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }
}
</style>
