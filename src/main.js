import { createApp } from 'vue';
import App from './App.vue';
import 'reset-css';
import router, { setupRouter } from './router';

async function bootstrap() {
  const app = createApp(App);
  setupRouter(app);

  await router.isReady();
  app.mount('#app');
}
bootstrap();
