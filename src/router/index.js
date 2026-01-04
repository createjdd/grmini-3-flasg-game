import { createRouter as _createRouter, createWebHistory } from 'vue-router'
const Index = () => import('../views/index.vue')
const Coordinate3D = () => import('../views/Coordinate3D.vue')

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
  {
    path: '/coordinate-3d',
    name: 'coordinate-3d',
    component: Coordinate3D,
  },
]

function createRouter() {
  return _createRouter({
    history: createWebHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes,
  })
}

export const router = createRouter()

export function setupRouter(app) {
  app.use(router)
  router.beforeResolve((to, from, next) => {
    next()
  })
}

export default router
