import { createApp } from 'vue'
import App from './App.vue'
import 'reset-css'
import 'virtual:uno.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router, { setupRouter } from './router'

async function bootstrap() {
  const app = createApp(App)
  setupRouter(app)
  app.use(ElementPlus)

  await router.isReady()
  app.mount('#app')
}
bootstrap()
