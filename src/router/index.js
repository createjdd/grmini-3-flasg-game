import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/index.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
  {
    path: '/coordinate-3d',
    name: 'coordinate-3d',
    component: () => import('../views/Coordinate3D.vue'),
  },
  {
    path: '/tarot',
    name: 'tarot',
    component: () => import('../views/Tarot.vue'),
  },
  {
    path: '/points',
    name: 'points',
    component: () => import('../views/PointVisualizer.vue'),
  },
  {
    path: '/moon-phases',
    name: 'moon-phases',
    component: () => import('../views/MoonPhases.vue'),
  },
  {
    path: '/numerology',
    name: 'numerology',
    component: () => import('../views/Numerology.vue'),
  },
  {
    path: '/astrology',
    name: 'astrology',
    component: () => import('../views/Astrology.vue'),
  },
  {
    path: '/runes',
    name: 'runes',
    component: () => import('../views/Runes.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export function setupRouter(app) {
  app.use(router)
}

export default router
