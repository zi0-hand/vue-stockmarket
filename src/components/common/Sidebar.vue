<template>
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <h1 class="sidebar-logo">
          <span v-if="!isCollapsed">주식 시뮬레이션</span>
          <span v-else>JS</span>
        </h1>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="bi" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>
      </div>
      
      <div class="sidebar-user">
        <div class="user-avatar">{{ avatar }}</div>
        <div class="user-info" v-if="!isCollapsed">
          <div class="user-name">{{ playerName }}</div>
          <div class="user-money">{{ formattedMoney }}</div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-title" v-if="!isCollapsed">메뉴</div>
          <ul class="nav-list">
            <li v-for="item in menuItems" :key="item.path" class="nav-item">
              <router-link :to="item.path" class="nav-link" :class="{ 'active': currentRoute === item.path }">
                <span class="nav-icon"><i :class="item.icon"></i></span>
                <span class="nav-text" v-if="!isCollapsed">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <div class="nav-title" v-if="!isCollapsed">관리</div>
      <button class="logout-btn" @click="logout">
        <span class="nav-icon"><i class="bi bi-box-arrow-right"></i></span>
        <span v-if="!isCollapsed">로그아웃</span>
      </button>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuthStore } from '@/store/auth';
  
  export default {
    name: 'Sidebar',
    setup() {
      const isCollapsed = ref(false);
      const route = useRoute();
      const authStore = useAuthStore();
      
      const menuItems = [
        { name: '대시보드', path: '/dashboard', icon: 'bi bi-grid-1x2' },
        { name: '주식 시장', path: '/markets', icon: 'bi bi-graph-up' },
        { name: '내 포트폴리오', path: '/portfolio', icon: 'bi bi-briefcase' },
        { name: '거래 내역', path: '/history', icon: 'bi bi-clock-history' }
      ];
      
      const playerName = computed(() => authStore.playerName);
      
      const avatar = computed(() => {
        return playerName.value ? playerName.value.charAt(0).toUpperCase() : 'U';
      });
      
      const formattedMoney = computed(() => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
          .format(authStore.playerMoney);
      });
      
      const currentRoute = computed(() => route.path);
      
      const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value;
      };
      
      const logout = () => {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
          authStore.logout();
        }
      };
      
      return {
        isCollapsed,
        menuItems,
        playerName,
        avatar,
        formattedMoney,
        currentRoute,
        toggleSidebar,
        logout
      };
    }
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 280px;
    min-height: 100vh;
    background-color: white;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    width: 80px;
  }
  
  .sidebar-header {
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .sidebar-logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
    white-space: nowrap;
  }
  
  .sidebar-toggle {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light);
    color: var(--primary-color);
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .sidebar-user {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    background-color: var(--background-gray);
    margin: 0 1rem 1.5rem;
    border-radius: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .user-info {
    margin-left: 0.75rem;
    overflow: hidden;
  }
  
  .user-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-money {
    font-size: 0.85rem;
    color: var(--secondary-color);
  }
  
  .nav-section {
    margin-bottom: 1.5rem;
    flex: 1;
  }
  
  .nav-title {
    padding: 0 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    color: var(--secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-item {
    margin-bottom: 0.25rem;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.2s;
    border-radius: 0.5rem;
    margin: 0 0.5rem;
  }
  
  .nav-link:hover {
    background-color: var(--background-gray);
  }
  
  .nav-link.active {
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
  }
  
  .nav-text {
    white-space: nowrap;
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    border-radius: 0.5rem;
    margin: 0 0.5rem;
  }
  
  .logout-btn:hover {
    background-color: var(--background-gray);
  }
  
  .logout-btn .nav-icon {
    margin-right: 0.75rem;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      transform: translateX(-100%);
    }
    
    .sidebar.visible {
      transform: translateX(0);
    }
  }
  </style>