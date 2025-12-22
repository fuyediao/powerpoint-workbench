import { createRouter, createWebHashHistory } from 'vue-router'

// 使用 Hash History，在 Electron 和 Web 環境中都工作良好
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/Home.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('./pages/Editor.vue')
    }
  ]
})

export default router
