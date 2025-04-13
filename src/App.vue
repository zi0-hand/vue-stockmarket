<template>
  <div class="app">
    <!-- 로그인 페이지에서는 기본 레이아웃 표시하지 않음 -->
    <template v-if="$route.meta.requiresAuth">
      <div class="app-container">
        <Sidebar />
        <div class="main-content">
          <Navbar />
          <main class="content">
            <router-view />
          </main>
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import Sidebar from '@/components/common/Sidebar.vue';
import Navbar from '@/components/common/Navbar.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    Navbar
  },
  setup() {
    
    onMounted(() => {
      const authStore = useAuthStore();
      authStore.loadPlayerFromStorage();
    });
    
    return {};
  }
}
</script>

<style>
:root {
  --primary-color: #3182f6;
  --primary-light: rgba(49, 130, 246, 0.1);
  --secondary-color: #8b8b8b;
  --success-color: #20c997;
  --danger-color: #fa5252;
  --warning-color: #fcc419;
  --text-color: #333333;
  --border-color: #e9ecef;
  --background-gray: #f8f9fa;
  --white: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif;
}

body {
  background-color: var(--background-gray);
  color: var(--text-color);
  line-height: 1.5;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

/* 카드 스타일 */
.card {
  background-color: var(--white);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: none;
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 1.25rem;
}

/* 버튼 스타일 커스터마이징 */
.btn {
  font-weight: 500;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.btn-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.btn-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
}

/* 기타 유틸리티 클래스 */
.text-success {
  color: var(--success-color) !important;
}

.text-danger {
  color: var(--danger-color) !important;
}

.text-primary {
  color: var(--primary-color) !important;
}

.text-secondary {
  color: var(--secondary-color) !important;
}

.profit-up {
  color: var(--danger-color);
}

.profit-down {
  color: var(--primary-color);
}

/* 로딩 스피너 */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .content {
    padding: 1rem;
  }
}
</style>