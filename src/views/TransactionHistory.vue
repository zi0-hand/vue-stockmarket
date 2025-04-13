<template>
  <div class="transaction-history-container">
    <!-- 헤더 섹션 -->
    <div class="history-header">
      <h1 class="history-title">거래 내역 목록</h1>
      <button 
        class="btn btn-refresh"
        @click="refreshHistory"
        :disabled="loading.history"
      >
        <i class="bi bi-arrow-repeat" :class="{ 'rotating': loading.history }"></i>
        내역 새로고침
      </button>
    </div>
    
    
    <!-- 필터 바 -->
    <div class="filter-bar">
      <div class="search-input">
        <i class="bi bi-search search-icon"></i>
        <input
          type="text"
          class="form-input"
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
      <p class="loading-text">거래 내역을 불러오는 중입니다...</p>
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
    
    <!-- 거래 내역 리스트 및 요약 카드 -->
    <div v-else class="history-content">
      <!-- 거래 내역 카드 -->
      <div class="card history-card">
        <div class="card-body">
          <div class="transaction-table-wrapper">
            <table class="transaction-table">
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
                  <td>
                    <div class="stock-name-cell">
                      <div class="stock-logo small">{{ history.stockName.charAt(0) }}</div>
                      <span>{{ history.stockName }}</span>
                    </div>
                  </td>
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
        </div>
      </div>
      
      <!-- 요약 카드 -->
      <div class="card summary-card">
        <div class="card-header">
          <h2 class="card-title">거래 요약</h2>
        </div>
        <div class="card-body">
          <div class="summary-grid">
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
              <div class="stat-value buy-amount">{{ formatMoney(totalBuyAmount) }}</div>
            </div>
            <div class="summary-stat">
              <div class="stat-label">총 매도 금액</div>
              <div class="stat-value sell-amount">{{ formatMoney(totalSellAmount) }}</div>
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
.transaction-history-container {
  padding: 24px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.history-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--white);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.btn-refresh:hover {
  background-color: var(--background-gray);
}

.btn-refresh i {
  font-size: 16px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 필터 바 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-text);
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--white);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
}

.form-select {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--white);
  min-width: 150px;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
}

/* 로딩 및 빈 상태 */
.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.spinner-border {
  width: 48px;
  height: 48px;
  border-width: 4px;
  color: var(--primary-blue);
  margin-bottom: 16px;
}

.loading-text {
  color: var(--secondary-text);
  font-size: 16px;
}

.empty-icon {
  font-size: 48px;
  color: var(--secondary-text);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.empty-description {
  color: var(--secondary-text);
  margin-bottom: 24px;
  font-size: 16px;
  max-width: 500px;
}

/* 거래 내역 콘텐츠 */
.history-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  background-color: var(--white);
  border: none;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--white);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
}

.card-body {
  padding: 24px;
}

/* 거래 내역 테이블 */
.transaction-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.transaction-table th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  color: var(--secondary-text);
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}


.transaction-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.transaction-table tr:last-child td {
  border-bottom: none;
}

.stock-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.stock-logo.small {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.transaction-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.tag-buy {
  background-color: rgba(49, 130, 246, 0.1);
  color: var(--primary-blue);
}

.tag-sell {
  background-color: rgba(32, 201, 151, 0.1);
  color: var(--success-green);
}

.text-end {
  text-align: right;
  color: var(--text-color-weak);
}

/* 거래 요약 카드 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.buy-amount {
  color: var(--primary-blue);
}

.sell-amount {
  color: var(--success-green);
}

/* 수익률 색상 */
.profit-up {
  color: var(--danger-red);
}

.profit-down {
  color: var(--primary-blue);
}

/* 반응형 스타일 */
@media (max-width: 992px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-bar {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .form-select {
    width: 100%;
  }
  
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .transaction-history-container {
    padding: 16px;
  }
  
  .history-title {
    font-size: 24px;
  }
  
  .card-header, .card-body {
    padding: 16px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>