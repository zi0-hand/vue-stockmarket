import { createRouter, createWebHistory } from 'vue-router';

// 라우트 컴포넌트 가져오기
import Home from '@/views/Home.vue';
import Dashboard from '@/views/Dashboard.vue';
// import StockMarket from '@/views/StockMarket.vue';
// import Portfolio from '@/views/Portfolio.vue';
// import TransactionHistory from '@/views/TransactionHistory.vue';
// import NotFound from '@/views/NotFound.vue';

// 라우터 가드 (로그인 확인)
const requireAuth = (to, from, next) => {
  const player = JSON.parse(localStorage.getItem('player'));
  if (player) {
    next();
  } else {
    next('/login');
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Home,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      beforeEnter: requireAuth
    },
    // {
    //   path: '/markets',
    //   name: 'StockMarket',
    //   component: StockMarket,
    //   meta: { requiresAuth: true },
    //   beforeEnter: requireAuth
    // },
    // {
    //   path: '/portfolio',
    //   name: 'Portfolio',
    //   component: Portfolio,
    //   meta: { requiresAuth: true },
    //   beforeEnter: requireAuth
    // },
    // {
    //   path: '/history',
    //   name: 'TransactionHistory',
    //   component: TransactionHistory,
    //   meta: { requiresAuth: true },
    //   beforeEnter: requireAuth
    // },
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: NotFound
    // }
  ]
});

// 전역 가드
router.beforeEach((to, from, next) => {
  // 현재 페이지의 타이틀 설정
  document.title = to.name ? `${to.name} - 주식 시뮬레이션` : '주식 시뮬레이션';
  next();
});

export default router;