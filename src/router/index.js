import { createRouter as _createRouter, createWebHistory } from 'vue-router';
const Index = () => import('../views/index.vue');
const Scroll = () => import('../views/scroll.vue');
const ImgVer = () => import('../views/imgVer.vue');
// Image
import Image from '../views/image.vue';

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
  {
    path: '/scroll',
    name: 'scroll',
    component: Scroll,
  },
  {
    path: '/imgVer',
    name: 'imgVer',
    component: ImgVer,
  },
  {
    path: '/image',
    name: 'image',
    component: Image,
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
