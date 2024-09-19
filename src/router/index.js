import { createRouter as _createRouter, createWebHistory } from 'vue-router';
const Index = () => import('../views/index.vue');

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
];

function createRouter() {
  return _createRouter({
    history: createWebHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes,
  });
}

export const router = createRouter();

export function setupRouter(app) {
  app.use(router);
  router.beforeResolve((to, from, next) => {
    next();
  });
}

export default router;
