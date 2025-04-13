<template>
  <div class="portfolio-container">
    <!-- 포트폴리오 헤더 -->
    <div class="portfolio-header">
      <h1 class="portfolio-title">내 포트폴리오</h1>
      <button 
        class="btn btn-refresh"
        @click="refreshPortfolio"
        :disabled="loading.playerStocks || loading.analysis"
      >
        <i class="bi bi-arrow-repeat" :class="{ 'rotating': loading.playerStocks || loading.analysis }"></i>
        포트폴리오 새로고침
      </button>
    </div>
    
    <!-- 로딩 화면 -->
    <div v-if="loading.playerStocks || loading.analysis" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
      <p>포트폴리오 정보를 불러오는 중입니다...</p>
    </div>
    
    <!-- 포트폴리오 없음 -->
    <div v-else-if="playerStocks.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="bi bi-briefcase"></i>
      </div>
      <h3 class="empty-title">보유 중인 주식이 없습니다</h3>
      <p class="empty-description">주식 시장에서 주식을 구매해보세요</p>
      <router-link to="/markets" class="btn btn-primary">주식 구매하기</router-link>
    </div>
    
    <!-- 포트폴리오 내용 -->
    <div v-else class="portfolio-content">
      <!-- 1행: 포트폴리오 요약, 자산 배분 -->
      <div class="portfolio-grid">
        <!-- 포트폴리오 요약 카드 -->
        <div class="card summary-card">
          <div class="card-header">
            <h2 class="card-title">포트폴리오 요약</h2>
          </div>
          <div class="card-body">
            <div class="summary-stats">
              <div class="summary-stat">
                <div class="stat-label">총 투자 금액</div>
                <div class="stat-value">{{ formatMoney(analysis?.totalInvestment || 0) }}</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">현재 가치</div>
                <div class="stat-value">{{ formatMoney(analysis?.currentPortfolioValue || 0) }}</div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">총 손익</div>
                <div class="stat-value" :class="getProfitClass(analysis?.totalProfitLoss || 0)">
                  {{ formatMoney(analysis?.totalProfitLoss || 0, true) }}
                </div>
              </div>
              <div class="summary-stat">
                <div class="stat-label">전체 수익률</div>
                <div class="stat-value" :class="getProfitClass(analysis?.overallProfitRate || 0)">
                  {{ formatProfitRate(analysis?.overallProfitRate || 0) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 자산 배분 카드 -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">자산 배분</h2>
          </div>
          <div class="card-body">
            <div v-if="analysis?.assetAllocation" class="asset-allocation">
              <div class="allocation-chart">
                <div class="allocation-bar">
                  <div v-for="(item, index) in analysis.assetAllocation" 
                      :key="index" 
                      class="allocation-segment"
                      :style="{
                        'background-color': getChartColor(index),
                        'width': `${item.percentage}%`
                      }"
                  ></div>
                </div>
              </div>
              <div class="allocation-legend">
                <div v-for="(item, index) in analysis.assetAllocation" 
                    :key="index" 
                    class="legend-item"
                >
                  <div class="legend-color" :style="{ 'background-color': getChartColor(index) }"></div>
                  <div class="legend-text">
                    {{ item.stockName }} ({{ formatPercent(item.percentage) }})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 2행: 보유 주식 목록 -->
      <div class="card stocks-card">
        <div class="card-header">
          <h2 class="card-title">보유 주식 목록</h2>
        </div>
        <div class="card-body">
          <div class="stock-table-wrapper">
            <table class="stock-table">
              <thead>
                <tr>
                  <th>주식명</th>
                  <th class="text-end">현재가</th>
                  <th class="text-end">평균매수가</th>
                  <th class="text-end">보유수량</th>
                  <th class="text-end">평가금액</th>
                  <th class="text-end">손익</th>
                  <th class="text-end">수익률</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stock in playerStocks" :key="stock.stockId">
                  <td>
                    <div class="stock-name-cell">
                      <div class="stock-logo small">{{ stock.stockName.charAt(0) }}</div>
                      <span>{{ stock.stockName }}</span>
                    </div>
                  </td>
                  <td class="text-end">{{ formatMoney(stock.stockPrice) }}</td>
                  <td class="text-end">{{ formatMoney(stock.averagePurchasePrice) }}</td>
                  <td class="text-end">{{ stock.stockQuantity }}주</td>
                  <td class="text-end">{{ formatMoney(stock.stockPrice * stock.stockQuantity) }}</td>
                  <td class="text-end" :class="getProfitClass(stock.profitRate)">
                    {{ formatMoney((stock.stockPrice - stock.averagePurchasePrice) * stock.stockQuantity, true) }}
                  </td>
                  <td class="text-end" :class="getProfitClass(stock.profitRate)">
                    {{ formatProfitRate(stock.profitRate) }}
                  </td>
                  <td>
                    <button class="btn btn-sm btn-sell" @click="openSellModal(stock)">
                      매도
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- 3행: 개별 주식 성과 (원래 스타일 유지) -->
      <div class="card performance-card">
        <div class="card-header">
          <h2 class="card-title">개별 주식 성과</h2>
        </div>
        <div class="card-body">
          <div v-if="analysis?.stockPerformance" class="stock-performance">
            <div v-for="(item, index) in analysis.stockPerformance" 
                 :key="index" 
                 class="performance-item"
            >
              <div class="performance-header">
                <div class="performance-title">
                  <div class="stock-logo small">{{ item.stockName.charAt(0) }}</div>
                  <span>{{ item.stockName }}</span>
                </div>
                <div class="performance-profit" :class="getProfitClass(item.profitRate)">
                  {{ formatProfitRate(item.profitRate) }}
                </div>
              </div>
              
              <div class="performance-bar-container">
                <div class="performance-bar-label">
                  <span>{{ formatMoney(item.purchasePrice * item.quantity) }}</span>
                  <span>{{ formatMoney(item.currentPrice * item.quantity) }}</span>
                </div>
                <div class="performance-bar">
                  <div class="bar-purchase"></div>
                  <div class="bar-current" 
                       :class="getProfitBarClass(item.profitLoss)" 
                       :style="getPerformanceBarStyle(item)"
                  ></div>
                </div>
              </div>
              
              <div class="performance-details">
                <div class="detail-item">
                  <span class="detail-label">현재가</span>
                  <span class="detail-value">{{ formatMoney(item.currentPrice) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">매수가</span>
                  <span class="detail-value">{{ formatMoney(item.purchasePrice) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">보유량</span>
                  <span class="detail-value">{{ item.quantity }}주</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">손익</span>
                  <span class="detail-value" :class="getProfitClass(item.profitLoss)">
                    {{ formatMoney(item.profitLoss, true) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 매도 모달 -->
    <div class="modal fade" id="sellStockModal" tabindex="-1" aria-labelledby="sellStockModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="sellStockModalLabel">주식 매도</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedStock" class="stock-summary">
              <div class="stock-summary-item">
                <span class="stock-summary-label">주식명</span>
                <span class="stock-summary-value">{{ selectedStock.stockName }}</span>
              </div>
              <div class="stock-summary-item">
                <span class="stock-summary-label">현재 가격</span>
                <span class="stock-summary-value">{{ formatMoney(selectedStock.stockPrice) }}</span>
              </div>
              <div class="stock-summary-item">
                <span class="stock-summary-label">보유 수량</span>
                <span class="stock-summary-value">{{ selectedStock.stockQuantity }}주</span>
              </div>
              <div class="stock-summary-item">
                <span class="stock-summary-label">평균 매수가</span>
                <span class="stock-summary-value">{{ formatMoney(selectedStock.averagePurchasePrice) }}</span>
              </div>
              <div class="stock-summary-item">
                <span class="stock-summary-label">수익률</span>
                <span class="stock-summary-value" :class="getProfitClass(selectedStock.profitRate)">
                  {{ formatProfitRate(selectedStock.profitRate) }}
                </span>
              </div>
            </div>
            
            <form class="mt-4">
              <div class="form-group">
                <label for="sellQuantity" class="form-label">매도 수량</label>
                <input
                  type="number"
                  class="form-input"
                  id="sellQuantity"
                  v-model="sellQuantity"
                  min="1"
                  :max="selectedStock?.stockQuantity || 0"
                  required
                >
                <div class="form-text">
                  최대 매도 가능: {{ selectedStock?.stockQuantity || 0 }}주
                </div>
              </div>
              
              <div class="stock-summary total-line">
                <div class="stock-summary-item">
                  <span class="stock-summary-label">예상 매도 금액</span>
                  <span class="stock-summary-value">{{ formatMoney(calculateTotalSellPrice()) }}</span>
                </div>
                <div class="stock-summary-item">
                  <span class="stock-summary-label">예상 손익</span>
                  <span class="stock-summary-value" :class="getExpectedProfitClass()">
                    {{ formatMoney(calculateExpectedProfit(), true) }}
                  </span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-bs-dismiss="modal">취소</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="sellStock"
              :disabled="loading.transaction || !isValidQuantity"
            >
              <span v-if="loading.transaction">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                처리 중...
              </span>
              <span v-else>매도 확정</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useStockStore } from '@/store/stocks';
import { formatNumber, formatProfitRate } from '@/utils/format';
import { Modal } from '@/utils/bootstrap';

export default {
  name: 'Portfolio',
  setup() {
    const authStore = useAuthStore();
    const stockStore = useStockStore();
    
    // 모달 상태
    const selectedStock = ref(null);
    const sellQuantity = ref(1);
    
    // 모달 인스턴스
    let sellModal = null;
    
    // 스토어에서 데이터 가져오기
    const playerStocks = computed(() => stockStore.playerStocks);
    const analysis = computed(() => stockStore.portfolioAnalysis);
    const loading = computed(() => stockStore.loading);
    
    // 유효한 매도 수량인지 확인
    const isValidQuantity = computed(() => {
      return sellQuantity.value > 0 && 
             sellQuantity.value <= (selectedStock.value?.stockQuantity || 0);
    });
    
    // 차트 색상
    const chartColors = [
      '#3182f6', '#20c997', '#fa5252', '#fd7e14', '#fcc419',
      '#82c91e', '#4c6ef5', '#be4bdb', '#1098ad', '#868e96'
    ];
    
    // 차트 색상 가져오기
    const getChartColor = (index) => {
      return chartColors[index % chartColors.length];
    };
    
    // 금액 포맷팅
    const formatMoney = (value, showSign = false) => {
      if (showSign && value > 0) {
        return '+' + formatNumber(value);
      }
      return formatNumber(value);
    };
    
    // 퍼센트 포맷팅
    const formatPercent = (value) => {
      return `${value.toFixed(1)}%`;
    };
    
    // 수익률에 따른 클래스 반환
    const getProfitClass = (value) => {
      if (value > 0) return 'profit-up';
      if (value < 0) return 'profit-down';
      return '';
    };
    
    // 성과 바 클래스 반환
    const getProfitBarClass = (value) => {
      if (value > 0) return 'bar-profit';
      if (value < 0) return 'bar-loss';
      return '';
    };
    
    // 성과 바 스타일 계산
    const getPerformanceBarStyle = (item) => {
      const purchaseValue = item.purchasePrice * item.quantity;
      const currentValue = item.currentPrice * item.quantity;
      
      if (currentValue >= purchaseValue) {
        const ratio = purchaseValue > 0 ? (currentValue / purchaseValue * 100) : 100;
        return {
          width: `${Math.min(ratio, 200)}%`,
          left: '0'
        };
      } else {
        const ratio = purchaseValue > 0 ? (currentValue / purchaseValue * 100) : 0;
        return {
          width: `${ratio}%`,
          left: '0'
        };
      }
    };
    
    // 총 매도 금액 계산
    const calculateTotalSellPrice = () => {
      if (!selectedStock.value) return 0;
      return selectedStock.value.stockPrice * sellQuantity.value;
    };
    
    // 예상 손익 계산
    const calculateExpectedProfit = () => {
      if (!selectedStock.value) return 0;
      const avgCost = selectedStock.value.averagePurchasePrice;
      const currentPrice = selectedStock.value.stockPrice;
      return (currentPrice - avgCost) * sellQuantity.value;
    };
    
    // 예상 손익 클래스
    const getExpectedProfitClass = () => {
      const profit = calculateExpectedProfit();
      if (profit > 0) return 'profit-up';
      if (profit < 0) return 'profit-down';
      return '';
    };
    
    // 매도 모달 초기화
    const initSellModal = () => {
      if (!sellModal) {
        const modalElement = document.getElementById('sellStockModal');
        sellModal = new Modal(modalElement);
        
        modalElement.addEventListener('hidden.bs.modal', () => {
          selectedStock.value = null;
          sellQuantity.value = 1;
        });
      }
    };
    
    // 매도 모달 열기
    const openSellModal = (stock) => {
      selectedStock.value = stock;
      sellQuantity.value = 1;
      sellModal.show();
    };
    
    // 주식 매도
    const sellStock = async () => {
      if (!selectedStock.value || !isValidQuantity.value) return;
      
      try {
        const success = await stockStore.sellStock(
          selectedStock.value.stockId,
          sellQuantity.value
        );
        
        if (success) {
          sellModal.hide();
          alert(`${selectedStock.value.stockName} ${sellQuantity.value}주를 성공적으로 매도했습니다.`);
          await refreshPortfolio();
        }
      } catch (error) {
        console.error('주식 매도 실패:', error);
        alert('주식 매도에 실패했습니다.');
      }
    };
    
    // 포트폴리오 새로고침
    const refreshPortfolio = async () => {
      try {
        await stockStore.fetchPlayerStocks();
        await stockStore.fetchPortfolioAnalysis();
      } catch (error) {
        console.error('포트폴리오 정보 새로고침 실패:', error);
        alert('포트폴리오 정보를 새로고침하는데 실패했습니다.');
      }
    };
    
    // 컴포넌트 마운트 시 데이터 로딩
    onMounted(async () => {
      initSellModal();
      await refreshPortfolio();
    });
    
    return {
      playerStocks,
      analysis,
      loading,
      selectedStock,
      sellQuantity,
      isValidQuantity,
      formatMoney,
      formatPercent,
      formatProfitRate,
      getProfitClass,
      getProfitBarClass,
      getChartColor,
      getPerformanceBarStyle,
      calculateTotalSellPrice,
      calculateExpectedProfit,
      getExpectedProfitClass,
      openSellModal,
      sellStock,
      refreshPortfolio
    };
  }
}
</script>

<style scoped>
.portfolio-container {
  padding: 24px;
  margin: 0 auto;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.portfolio-title {
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

/* 로딩 및 빈 상태 */
.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.loading-container .spinner-border {
  width: 48px;
  height: 48px;
  color: var(--primary-blue);
  margin-bottom: 16px;
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
}

/* 포트폴리오 내용 */
.portfolio-content {
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
  margin-bottom: 24px;
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

/* 포트폴리오 요약 */
.summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.summary-stat {
  flex: 1;
  /* min-width: 200px; */
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

/* 그리드 레이아웃 */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 0;
}

.summary-card {
  margin-right: 0;
}

/* 자산 배분 차트 */
.asset-allocation {
  margin-top: 1rem;
}

.allocation-chart {
  margin-bottom: 1.5rem;
}

.allocation-bar {
  height: 24px;
  width: 100%;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.allocation-segment {
  height: 100%;
  transition: width 0.5s ease;
}

.allocation-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.legend-text {
  font-size: 0.875rem;
  color: var(--text-color);
}

/* 개별 주식 성과 */
.stock-performance {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.performance-item {
  background-color: var(--background-gray);
  border-radius: 0.75rem;
  padding: 1rem;
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.performance-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.performance-profit {
  font-weight: 600;
}

.stock-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-blue);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
}

.stock-logo.small {
  width: 30px;
  height: 30px;
  font-size: 0.875rem;
}

.performance-bar-container {
  margin-bottom: 1rem;
}

.performance-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin-bottom: 0.25rem;
}

.performance-bar {
  height: 16px;
  width: 100%;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.bar-purchase {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 2px;
  background-color: var(--text-color);
  z-index: 1;
}

.bar-current {
  position: absolute;
  top: 0;
  height: 100%;
  z-index: 0;
}

.bar-profit {
  background-color: rgba(250, 82, 82, 0.2);
}

.bar-loss {
  background-color: rgba(49, 130, 246, 0.2);
}

.performance-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin-bottom: 0.125rem;
}

.detail-value {
  font-weight: 600;
}

/* 보유 주식 테이블 */
.stock-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.stock-table th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  color: var(--secondary-text);
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.stock-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.stock-table tr:last-child td {
  border-bottom: none;
}

.stock-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-end {
  text-align: right;
  color: var(--text-color-weak);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-sell {
  background-color: var(--success-green);
  color: var(--white);
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-sell:hover {
  background-color: #1aad7f;
}

/* 수익률 색상 */
.profit-up {
  color: var(--danger-red);
}

.profit-down {
  color: var(--primary-blue);
}

/* 모달 스타일 */
.modal-content {
  border-radius: 16px;
  border: none;
  overflow: hidden;
}

.modal-header {
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
}

.modal-title {
  font-weight: 700;
}

.modal-body {
  padding: 24px;
}

.stock-summary {
  background-color: var(--background-gray);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.stock-summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stock-summary-item:last-child {
  margin-bottom: 0;
}

.stock-summary-label {
  color: var(--secondary-text);
}

.stock-summary-value {
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
}

.form-text {
  font-size: 12px;
  color: var(--secondary-text);
  margin-top: 4px;
}

.total-line {
  border-top: 1px solid var(--border-color);
  margin-top: 16px;
  padding-top: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.btn-outline {
  background-color: var(--white);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.btn-outline:hover {
  background-color: var(--background-gray);
}

.btn-primary {
  background-color: var(--primary-blue);
  color: var(--white);
  border: none;
}

.btn-primary:hover {
  background-color: #2b74df;
}

.spinner-border-sm {
  width: 16px;
  height: 16px;
}

/* 반응형 스타일 */
@media (max-width: 992px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-stat {
    min-width: 100%;
  }
  
  .portfolio-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stock-performance {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .portfolio-container {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .card-header, .card-body {
    padding: 16px;
  }
  
  .stock-table th, .stock-table td {
    padding: 12px 8px;
    font-size: 14px;
  }
  
  .btn-sm {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .stock-logo.small {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>