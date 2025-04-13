<template>
    <div class="transaction-history">
      <div class="page-header">
        <h1 class="page-title">거래 내역</h1>
        <div class="page-actions">
          <button 
            class="btn btn-primary"
            @click="refreshHistory"
            :disabled="loading.history"
          >
            <i class="bi bi-arrow-repeat" :class="{ 'rotating': loading.history }"></i>
            내역 새로고침
          </button>
        </div>
      </div>
      
      <!-- 필터 바 -->
      <div class="filter-bar">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            type="text"
            class="form-control"
            placeholder="주식명 검색"
            v-model="searchTerm"
          >
        </div>
        
        <div class="filter-options">
          <select class="form-select" v-model="transactionType">
            <option value="all">모든 거래</option>
            <option value="매수">매수만</option>
            <option value="매도">매도만</option>
          </select>
        </div>
        
        <div class="filter-options">
          <select class="form-select" v-model="sortBy">
            <option value="date-desc">최신순</option>
            <option value="date-asc">오래된순</option>
            <option value="amount-desc">금액 높은순</option>
            <option value="amount-asc">금액 낮은순</option>
          </select>
        </div>
      </div>
      
      <!-- 로딩 화면 -->
      <div v-if="loading.history" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중...</span>
        </div>
        <p>거래 내역을 불러오는 중입니다...</p>
      </div>
      
      <!-- 내역 없음 -->
      <div v-else-if="filteredHistories.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-clock-history"></i>
        </div>
        <h3 class="empty-title">거래 내역이 없습니다</h3>
        <p class="empty-description">
          {{ searchTerm || transactionType !== 'all' 
            ? '검색 결과가 없습니다. 다른 검색어를 입력하거나 필터를 변경해보세요.' 
            : '주식 시장에서 주식을 구매해보세요.' 
          }}
        </p>
        <router-link v-if="!searchTerm && transactionType === 'all'" to="/markets" class="btn btn-primary">
          주식 구매하기
        </router-link>
      </div>
      
      <!-- 거래 내역 테이블 -->
      <div v-else class="history-container">
        <table class="table history-table">
          <thead>
            <tr>
              <th>거래 시간</th>
              <th>주식명</th>
              <th>거래 유형</th>
              <th class="text-end">거래 가격</th>
              <th class="text-end">거래 수량</th>
              <th class="text-end">거래 금액</th>
              <th class="text-end">수익률</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="history in filteredHistories" :key="history.id">
              <td>{{ formatDateTime(history.timestamp) }}</td>
              <td>{{ history.stockName }}</td>
              <td>
                <span 
                  class="transaction-tag" 
                  :class="history.transactionType === '매수' ? 'tag-buy' : 'tag-sell'"
                >
                  {{ history.transactionType }}
                </span>
              </td>
              <td class="text-end">{{ formatMoney(history.price) }}</td>
              <td class="text-end">{{ history.quantity }}주</td>
              <td class="text-end">{{ formatMoney(history.totalAmount) }}</td>
              <td class="text-end" :class="getProfitClass(history.profitRate)">
                {{ formatProfitRate(history.profitRate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 요약 카드 -->
      <div v-if="filteredHistories.length > 0" class="summary-container">
        <div class="card summary-card">
          <div class="card-header">
            <h2 class="card-title">거래 요약</h2>
          </div>
          <div class="card-body">
            <div class="summary-stats">
              <div class="summary-stat">
                <div class="stat-label">총 거래 횟수</div>
                <div class="stat-value">{{ filteredHistories.length }}회</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">매수 횟수</div>
                <div class="stat-value">{{ buyCount }}회</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">매도 횟수</div>
                <div class="stat-value">{{ sellCount }}회</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">총 매수 금액</div>
                <div class="stat-value text-primary">{{ formatMoney(totalBuyAmount) }}</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">총 매도 금액</div>
                <div class="stat-value text-success">{{ formatMoney(totalSellAmount) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useStockStore } from '@/store/stocks';
  import { formatNumber, formatDateTime, formatProfitRate } from '@/utils/format';
  
  export default {
    name: 'TransactionHistory',
    setup() {
      const stockStore = useStockStore();
      
      // 필터 상태
      const searchTerm = ref('');
      const transactionType = ref('all');
      const sortBy = ref('date-desc');
      
      // 스토어에서 데이터 가져오기
      const stockHistories = computed(() => stockStore.stockHistories);
      const loading = computed(() => stockStore.loading);
      
      // 필터링된 거래 내역
      const filteredHistories = computed(() => {
        let result = [...stockHistories.value];
        
        // 검색어로 필터링
        if (searchTerm.value) {
          const term = searchTerm.value.toLowerCase();
          result = result.filter(history => 
            history.stockName.toLowerCase().includes(term)
          );
        }
        
        // 거래 유형으로 필터링
        if (transactionType.value !== 'all') {
          result = result.filter(history => 
            history.transactionType === transactionType.value
          );
        }
        
        // 정렬
        result.sort((a, b) => {
          if (sortBy.value === 'date-desc') {
            return new Date(b.timestamp) - new Date(a.timestamp);
          } else if (sortBy.value === 'date-asc') {
            return new Date(a.timestamp) - new Date(b.timestamp);
          } else if (sortBy.value === 'amount-desc') {
            return b.totalAmount - a.totalAmount;
          } else if (sortBy.value === 'amount-asc') {
            return a.totalAmount - b.totalAmount;
          }
          return 0;
        });
        
        return result;
      });
      
      // 매수 횟수
      const buyCount = computed(() => {
        return filteredHistories.value.filter(history => 
          history.transactionType === '매수'
        ).length;
      });
      
      // 매도 횟수
      const sellCount = computed(() => {
        return filteredHistories.value.filter(history => 
          history.transactionType === '매도'
        ).length;
      });
      
      // 총 매수 금액
      const totalBuyAmount = computed(() => {
        return filteredHistories.value
          .filter(history => history.transactionType === '매수')
          .reduce((total, history) => total + history.totalAmount, 0);
      });
      
      // 총 매도 금액
      const totalSellAmount = computed(() => {
        return filteredHistories.value
          .filter(history => history.transactionType === '매도')
          .reduce((total, history) => total + history.totalAmount, 0);
      });
      
      // 금액 포맷팅
      const formatMoney = (value) => {
        return formatNumber(value);
      };
      
      // 수익률에 따른 클래스 반환
      const getProfitClass = (value) => {
        if (value > 0) return 'profit-up';
        if (value < 0) return 'profit-down';
        return '';
      };
      
      // 거래 내역 새로고침
      const refreshHistory = async () => {
        try {
          await stockStore.fetchStockHistories();
        } catch (error) {
          console.error('거래 내역 새로고침 실패:', error);
          alert('거래 내역을 새로고침하는데 실패했습니다.');
        }
      };
      
      // 컴포넌트 마운트 시 데이터 로딩
      onMounted(async () => {
        await refreshHistory();
      });
      
      return {
        stockHistories,
        filteredHistories,
        loading,
        searchTerm,
        transactionType,
        sortBy,
        buyCount,
        sellCount,
        totalBuyAmount,
        totalSellAmount,
        formatMoney,
        formatDateTime,
        formatProfitRate,
        getProfitClass,
        refreshHistory
      };
    }
  }
  </script>
  
  <style scoped>
  .transaction-history {
    padding: 1rem 0;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }
  
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-options {
    min-width: 150px;
  }
  
  .history-container {
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 1.5rem;
    overflow-x: auto;
  }
  
  .history-table {
    margin-bottom: 0;
  }
  
  .transaction-tag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .tag-buy {
    background-color: rgba(49, 130, 246, 0.1);
    color: var(--primary-color);
  }
  
  .tag-sell {
    background-color: rgba(32, 201, 151, 0.1);
    color: var(--success-color);
  }
  
  .summary-container {
    margin-top: 2rem;
  }
  
  .summary-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
  
  .summary-stat {
    flex: 1;
    min-width: 180px;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--secondary-color);
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
  }
  
  .loading-container p {
    margin-top: 1rem;
    color: var(--secondary-color);
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 0;
  }
  
  .empty-icon {
    font-size: 3rem;
    color: var(--secondary-color);
    opacity: 0.3;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .profit-up {
    color: var(--danger-color);
  }
  
  .profit-down {
    color: var(--primary-color);
  }
  
  .rotating {
    animation: rotate 1s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 992px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .filter-bar {
      flex-direction: column;
    }
    
    .summary-stats {
      flex-direction: column;
      gap: 1rem;
    }
  }
  </style>