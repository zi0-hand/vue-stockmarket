<template>
    <nav class="navbar">
      <div class="navbar-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
      
      <div class="navbar-right">
        <button
          v-if="showRefreshButton"
          class="btn btn-light refresh-btn"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'rotating': loading }"></i>
          시장 업데이트
        </button>
        
        <div class="navbar-actions">
          <div class="dropdown">
            <button class="btn btn-light" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="user-avatar small">{{ avatar }}</div>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
              <li class="dropdown-user-info">
                <div class="user-name">{{ playerName }}</div>
                <div class="user-money">{{ formattedMoney }}</div>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="addMoney">자금 추가</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">로그아웃</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuthStore } from '@/store/auth';
  import { useStockStore } from '@/store/stocks';
  
  export default {
    name: 'Navbar',
    setup() {
      const route = useRoute();
      const authStore = useAuthStore();
      const stockStore = useStockStore();
      const loading = ref(false);
      
      const playerName = computed(() => authStore.playerName);
      
      const avatar = computed(() => {
        return playerName.value ? playerName.value.charAt(0).toUpperCase() : 'U';
      });
      
      const formattedMoney = computed(() => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
          .format(authStore.playerMoney);
      });
      
      const pageTitle = computed(() => {
        switch (route.path) {
          case '/dashboard':
            return '대시보드';
          case '/markets':
            return '주식 시장';
          case '/portfolio':
            return '내 포트폴리오';
          case '/history':
            return '거래 내역';
          default:
            return route.name || '주식 시뮬레이션';
        }
      });
      
      const showRefreshButton = computed(() => {
        return ['/dashboard', '/markets', '/portfolio'].includes(route.path);
      });
      
      const refreshData = async () => {
        loading.value = true;
        
        try {
          // 주식 목록 새로고침
          await stockStore.fetchStocks();
          
          // 보유 주식 새로고침
          await stockStore.fetchPlayerStocks();
          
          // 플레이어 정보 업데이트
          await authStore.updatePlayerMoney();
          
          // 추가로 필요한 데이터 업데이트 (페이지별)
          if (route.path === '/portfolio') {
            await stockStore.fetchPortfolioAnalysis();
          }
        } catch (error) {
          console.error('데이터 업데이트 실패:', error);
        } finally {
          loading.value = false;
        }
      };
      
      const addMoney = () => {
        const amount = prompt('추가할 금액을 입력하세요');
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
          authStore.addMoney(parseInt(amount));
        }
      };
      
      const logout = () => {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
          authStore.logout();
        }
      };
      
      return {
        playerName,
        avatar,
        formattedMoney,
        pageTitle,
        showRefreshButton,
        loading,
        refreshData,
        addMoney,
        logout
      };
    }
  }
  </script>
  
  <style scoped>
  .navbar {
    height: 70px;
    padding: 0 1.5rem;
    background-color: white;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
  }
  
  .page-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
  }
  
  .refresh-btn {
    margin-right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .navbar-actions {
    display: flex;
    align-items: center;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  
  .user-avatar.small {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }
  
  .dropdown-user-info {
    padding: 0.5rem 1rem;
  }
  
  .user-name {
    font-weight: 600;
  }
  
  .user-money {
    font-size: 0.85rem;
    color: var(--secondary-color);
  }
  
  .rotating {
    animation: rotate 1s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  </style>