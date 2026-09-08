import { createRouter, createWebHistory } from 'vue-router'
import FestivalsView from '../views/FestivalsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'festivals',
      component: FestivalsView,
    },
    {
      path: '/festival/:festivalId',
      name: 'festival',
      component: () => import('../views/FestivalDashboardView.vue'),
    },
    {
      path: '/collections',
      name: 'collections',
      component: () => import('../views/CollectionsView.vue'),
    },
  ],
})

export default router
