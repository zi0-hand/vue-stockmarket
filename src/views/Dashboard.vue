<template>
    <div class="dashboard">
      <!-- 자산 요약 카드 -->
      <div class="asset-summary-card">
        <div class="asset-card-body">
          <div class="asset-label">총 자산</div>
          <div class="asset-amount">{{ totalAssetFormatted }}</div>
          
          <div class="asset-details">
            <div class="asset-item">
              <span class="asset-item-label">보유 현금</span>
              <span class="asset-item-value">{{ moneyFormatted }}</span>
            </div>
            <div class="asset-item">
              <span class="asset-item-label">투자 금액</span>
              <span class="asset-item-value">{{ investmentFormatted }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 대시보드 콘텐츠 그리드 -->
      <div class="dashboard-grid">
        <!-- 보유 주식 카드 -->
        <div class="card dashboard-card">
          <div class="card-header">
            <h2 class="card-title">보유 주식</h2>
            <router-link to="/portfolio" class="card-link">전체보기</router-link>
          </div>
          <div class="card-body">
            <div v-if="loading.playerStocks" class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩 중...</span>
              </div>
            </div>
            <template v-else>
              <div v-if="playerStocks.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-bar-chart"></i>
                </div>
                <h3 class="empty-title">보유 중인 주식이 없습니다</h3>
                <p class="empty-description">주식 시장에서 주식을 구매해보세요</p>
                <router-link to="/markets" class="btn btn-primary">주식 구매하기</router-link>
              </div>
              <div v-else class="stock-list">
                <div v-for="stock in playerStocks.slice(0, 5)" :key="stock.stockId" class="stock-item">
                  <div class="stock-info">
                    <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
                    <div class="stock-details">
                      <div class="stock-name">{{ stock.stockName }}</div>
                      <div class="stock-quantity">{{ stock.stockQuantity }}주</div>
                    </div>
                  </div>
                  <div class="stock-price">
                    <div class="stock-value">{{ formatMoney(stock.stockPrice * stock.stockQuantity) }}</div>
                    <div class="stock-change" :class="getProfitClass(stock.profitRate)">
                      {{ formatProfitRate(stock.profitRate) }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 주식 시장 카드 -->
        <div class="card dashboard-card">
          <div class="card-header">
            <h2 class="card-title">주식 시장</h2>
            <router-link to="/markets" class="card-link">전체보기</router-link>
          </div>
          <div class="card-body">
            <div v-if="loading.stocks" class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩 중...</span>
              </div>
            </div>
            <template v-else>
              <div v-if="stocks.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-graph-up"></i>
                </div>
                <h3 class="empty-title">시장에 주식이 없습니다</h3>
                <p class="empty-description">새로운 주식을 등록해보세요</p>
                <button class="btn btn-primary" @click="openCreateStockModal">주식 등록하기</button>
              </div>
              <div v-else class="stock-list">
                <div v-for="stock in stocks.slice(0, 5)" :key="stock.id" class="stock-item">
                  <div class="stock-info">
                    <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
                    <div class="stock-details">
                      <div class="stock-name">{{ stock.stockName }}</div>
                    </div>
                  </div>
                  <div class="stock-price">
                    <div class="stock-value">{{ formatMoney(stock.stockPrice) }}</div>
                  </div>
                  <div class="stock-actions">
                    <button class="btn btn-sm btn-primary" @click="openBuyModal(stock)">
                      <i class="bi bi-cart-plus"></i> 구매
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- 최근 거래 내역 카드 -->
        <div class="card dashboard-card full-width">
          <div class="card-header">
            <h2 class="card-title">최근 거래 내역</h2>
            <router-link to="/history" class="card-link">전체보기</router-link>
          </div>
          <div class="card-body">
            <div v-if="loading.history" class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩 중...</span>
              </div>
            </div>
            <template v-else>
              <div v-if="stockHistories.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-clock-history"></i>
                </div>
                <h3 class="empty-title">거래 내역이 없습니다</h3>
                <p class="empty-description">첫 주식 거래를 시작해보세요</p>
                <router-link to="/markets" class="btn btn-primary">주식 구매하기</router-link>
              </div>
              <div v-else class="transaction-list">
                <div v-for="(history, index) in stockHistories.slice(0, 5)" :key="index" class="transaction-item">
                  <div class="transaction-info">
                    <div class="transaction-icon" :class="getTransactionIconClass(history.transactionType)">
                      <i :class="getTransactionIcon(history.transactionType)"></i>
                    </div>
                    <div class="transaction-details">
                      <div class="transaction-title">
                        {{ history.stockName }}
                        <span class="transaction-tag" :class="getTransactionTagClass(history.transactionType)">
                          {{ history.transactionType }}
                        </span>
                      </div>
                      <div class="transaction-subtitle">
                        {{ formatDateTime(history.timestamp) }} • {{ history.quantity }}주
                      </div>
                    </div>
                  </div>
                  <div class="transaction-amount" :class="getTransactionAmountClass(history.transactionType)">
                    {{ getTransactionPrefix(history.transactionType) + formatMoney(history.totalAmount) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 주식 구매 모달 -->
      <div class="modal fade" id="buyStockModal" tabindex="-1" aria-labelledby="buyStockModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="buyStockModalLabel">주식 구매</h5>
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
                  <span class="stock-summary-label">보유 자금</span>
                  <span class="stock-summary-value">{{ moneyFormatted }}</span>
                </div>
              </div>
              
              <form class="mt-4">
                <div class="mb-3">
                  <label for="buyQuantity" class="form-label">구매 수량</label>
                  <input
                    type="number"
                    class="form-control"
                    id="buyQuantity"
                    v-model="buyQuantity"
                    min="1"
                    :max="maxBuyableQuantity"
                    required
                  >
                  <div class="form-text">
                    최대 구매 가능: {{ maxBuyableQuantity }}주
                  </div>
                </div>
                
                <div class="stock-summary total-line">
                  <div class="stock-summary-item">
                    <span class="stock-summary-label">총 구매 금액</span>
                    <span class="stock-summary-value">{{ formatMoney(calculateTotalPrice()) }}</span>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button
                type="button"
                class="btn btn-primary"
                @click="buyStock"
                :disabled="loading.transaction || !isValidQuantity"
              >
                <span v-if="loading.transaction">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  처리 중...
                </span>
                <span v-else>구매 확정</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 주식 등록 모달 -->
      <div class="modal fade" id="createStockModal" tabindex="-1" aria-labelledby="createStockModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="createStockModalLabel">새 주식 등록</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="stockName" class="form-label">주식명</label>
                  <input
                    type="text"
                    class="form-control"
                    id="stockName"
                    v-model="newStock.name"
                    placeholder="주식명을 입력하세요"
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="stockPrice" class="form-label">초기 가격</label>
                  <div class="input-group">
                    <span class="input-group-text">₩</span>
                    <input
                      type="number"
                      class="form-control"
                      id="stockPrice"
                      v-model="newStock.price"
                      min="1"
                      placeholder="초기 가격을 입력하세요"
                      required
                    >
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="stockDescription" class="form-label">설명 (선택사항)</label>
                  <textarea
                    class="form-control"
                    id="stockDescription"
                    v-model="newStock.description"
                    rows="3"
                    placeholder="주식에 대한 설명을 입력하세요"
                  ></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button
                type="button"
                class="btn btn-primary"
                @click="createStock"
                :disabled="loading.stocks || !isValidNewStock"
              >
                <span v-if="loading.stocks">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  처리 중...
                </span>
                <span v-else>등록하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useAuthStore } from '@/store/auth';
  import { useStockStore } from '@/store/stocks';
  import { formatNumber, formatDateTime, formatProfitRate } from '@/utils/format';
  import { Modal } from '@/utils/bootstrap';
  
  export default {
    name: 'Dashboard',
    setup() {
      const authStore = useAuthStore();
      const stockStore = useStockStore();
      
      // 모달용 변수
      const selectedStock = ref(null);
      const buyQuantity = ref(1);
      const newStock = ref({
        name: '',
        price: 1000,
        description: ''
      });
      
      // 모달 인스턴스
      let buyModal = null;
      let createModal = null;
      
      // 보유 자산 및 투자 금액
      const money = computed(() => authStore.playerMoney);
      const moneyFormatted = computed(() => formatNumber(money.value));
      
      const stocks = computed(() => stockStore.stocks);
      const playerStocks = computed(() => stockStore.playerStocks);
      const stockHistories = computed(() => stockStore.stockHistories);
      const loading = computed(() => stockStore.loading);
      
      // 총 투자 금액
      const totalInvestment = computed(() => {
        return playerStocks.value.reduce((total, stock) => {
          return total + (stock.stockPrice * stock.stockQuantity);
        }, 0);
      });
      
      const investmentFormatted = computed(() => formatNumber(totalInvestment.value));
      
      // 총 자산 (현금 + 투자 금액)
      const totalAsset = computed(() => money.value + totalInvestment.value);
      const totalAssetFormatted = computed(() => formatNumber(totalAsset.value));
      
      // 최대 구매 가능 수량
      const maxBuyableQuantity = computed(() => {
        if (!selectedStock.value) return 0;
        return Math.floor(money.value / selectedStock.value.stockPrice);
      });
      
      // 유효한 구매 수량인지 확인
      const isValidQuantity = computed(() => {
        return buyQuantity.value > 0 && buyQuantity.value <= maxBuyableQuantity.value;
      });
      
      // 유효한 새 주식 정보인지 확인
      const isValidNewStock = computed(() => {
        return newStock.value.name.trim() !== '' && 
               newStock.value.price > 0;
      });
      
      // 총 구매 금액 계산
      const calculateTotalPrice = () => {
        if (!selectedStock.value) return 0;
        return selectedStock.value.stockPrice * buyQuantity.value;
      };
      
      // 수익률에 따른 클래스 반환
      const getProfitClass = (profitRate) => {
        if (profitRate > 0) return 'profit-up';
        if (profitRate < 0) return 'profit-down';
        return '';
      };
      
      // 거래 타입에 따른 아이콘 클래스 반환
      const getTransactionIconClass = (type) => {
        return type === '매수' ? 'transaction-icon-buy' : 'transaction-icon-sell';
      };
      
      // 거래 타입에 따른 아이콘 반환
      const getTransactionIcon = (type) => {
        return type === '매수' ? 'bi bi-arrow-down-circle' : 'bi bi-arrow-up-circle';
      };
      
      // 거래 타입에 따른 태그 클래스 반환
      const getTransactionTagClass = (type) => {
        return type === '매수' ? 'transaction-tag-buy' : 'transaction-tag-sell';
      };
      
      // 거래 타입에 따른 금액 클래스 반환
      const getTransactionAmountClass = (type) => {
        return type === '매수' ? 'amount-negative' : 'amount-positive';
      };
      
      // 거래 타입에 따른 접두사 반환
      const getTransactionPrefix = (type) => {
        return type === '매수' ? '- ' : '+ ';
      };
      
      // 금액 포맷팅
      const formatMoney = (value) => {
        return formatNumber(value);
      };
      
      // 주식 구매 모달 열기
      const openBuyModal = (stock) => {
        selectedStock.value = stock;
        buyQuantity.value = 1;
        
        if (!buyModal) {
          const modalElement = document.getElementById('buyStockModal');
          buyModal = new Modal(modalElement);
          
          // 모달이 닫힐 때 상태 초기화
          modalElement.addEventListener('hidden.bs.modal', () => {
            selectedStock.value = null;
            buyQuantity.value = 1;
          });
        }
        
        buyModal.show();
      };
      
      // 주식 생성 모달 열기
      const openCreateStockModal = () => {
        newStock.value = {
          name: '',
          price: 1000,
          description: ''
        };
        
        if (!createModal) {
          const modalElement = document.getElementById('createStockModal');
          createModal = new Modal(modalElement);
          
          // 모달이 닫힐 때 상태 초기화
          modalElement.addEventListener('hidden.bs.modal', () => {
            newStock.value = {
              name: '',
              price: 1000,
              description: ''
            };
          });
        }
        
        createModal.show();
      };
      
      // 주식 구매
      const buyStock = async () => {
        if (!selectedStock.value || !isValidQuantity.value) return;
        
        try {
          const success = await stockStore.buyStock(
            selectedStock.value.id,
            buyQuantity.value
          );
          
          if (success) {
            buyModal.hide();
            alert(`${selectedStock.value.stockName} ${buyQuantity.value}주를 성공적으로 구매했습니다.`);
          }
        } catch (error) {
          console.error('주식 구매 실패:', error);
          alert('주식 구매에 실패했습니다.');
        }
      };
      
      // 주식 생성
      const createStock = async () => {
        if (!isValidNewStock.value) return;
        
        try {
          const success = await stockStore.createStock({
            name: newStock.value.name,
            price: newStock.value.price,
            description: newStock.value.description
          });
          
          if (success) {
            createModal.hide();
            alert(`${newStock.value.name} 주식이 성공적으로 등록되었습니다.`);
          }
        } catch (error) {
          console.error('주식 생성 실패:', error);
          alert('주식 등록에 실패했습니다.');
        }
      };
      
      // 컴포넌트 마운트 시 초기 데이터 로딩
      onMounted(async () => {
        try {
          // 주식 목록 로딩
          await stockStore.fetchStocks();
          
          // 보유 주식 로딩
          await stockStore.fetchPlayerStocks();
          
          // 거래 내역 로딩
          await stockStore.fetchStockHistories();
        } catch (error) {
          console.error('데이터 로딩 실패:', error);
        }
      });
      
      return {
        stocks,
        playerStocks,
        stockHistories,
        money,
        moneyFormatted,
        loading,
        totalInvestment,
        investmentFormatted,
        totalAsset,
        totalAssetFormatted,
        selectedStock,
        buyQuantity,
        maxBuyableQuantity,
        isValidQuantity,
        newStock,
        isValidNewStock,
        formatMoney,
        formatProfitRate,
        formatDateTime,
        calculateTotalPrice,
        getProfitClass,
        getTransactionIconClass,
        getTransactionIcon,
        getTransactionTagClass,
        getTransactionAmountClass,
        getTransactionPrefix,
        openBuyModal,
        openCreateStockModal,
        buyStock,
        createStock
      };
    }
  }
  </script>
  
  <style scoped>
  .dashboard {
    padding: 1rem 0;
  }
  
  .asset-summary-card {
    background: linear-gradient(135deg, var(--primary-color), #4c6ef5);
    border-radius: 1rem;
    color: white;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .asset-card-body {
    padding: 1.5rem;
  }
  
  .asset-label {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }
  
  .asset-amount {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }
  
  .asset-details {
    display: flex;
    gap: 2rem;
  }
  
  .asset-item {
    display: flex;
    flex-direction: column;
  }
  
  .asset-item-label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }
  
  .asset-item-value {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .dashboard-card {
    height: 100%;
  }
  
  .dashboard-card.full-width {
    grid-column: 1 / -1;
  }
  
  .card-link {
    color: var(--primary-color);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }
  
  .card-link:hover {
    text-decoration: underline;
  }
  
  /* 주식 목록 스타일 */
  .stock-list {
    display: flex;
    flex-direction: column;
  }
  
  .stock-item {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .stock-item:last-child {
    border-bottom: none;
  }
  
  .stock-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .stock-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 1rem;
  }
  
  .stock-details {
    flex: 1;
  }
  
  .stock-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .stock-quantity {
    font-size: 0.875rem;
    color: var(--secondary-color);
  }
  
  .stock-price {
    text-align: right;
    margin-right: 1rem;
  }
  
  .stock-value {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .stock-change {
    font-size: 0.875rem;
  }
  
  .stock-actions {
    min-width: 80px;
    text-align: right;
  }
  
  .profit-up {
    color: var(--danger-color);
  }
  
  .profit-down {
    color: var(--primary-color);
  }
  
  /* 거래 내역 스타일 */
  .transaction-list {
    display: flex;
    flex-direction: column;
  }
  
  .transaction-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .transaction-item:last-child {
    border-bottom: none;
  }
  
  .transaction-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .transaction-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    font-size: 1.25rem;
  }
  
  .transaction-icon-buy {
    background-color: rgba(49, 130, 246, 0.1);
    color: var(--primary-color);
  }
  
  .transaction-icon-sell {
    background-color: rgba(32, 201, 151, 0.1);
    color: var(--success-color);
  }
  
  .transaction-details {
    flex: 1;
  }
  
  .transaction-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
  }
  
  .transaction-subtitle {
    font-size: 0.875rem;
    color: var(--secondary-color);
  }
  
  .transaction-tag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }
  
  .transaction-tag-buy {
    background-color: rgba(49, 130, 246, 0.1);
    color: var(--primary-color);
  }
  
  .transaction-tag-sell {
    background-color: rgba(32, 201, 151, 0.1);
    color: var(--success-color);
  }
  
  .transaction-amount {
    font-weight: 600;
  }
  
  .amount-positive {
    color: var(--success-color);
  }
  
  .amount-negative {
    color: var(--danger-color);
  }
  
  /* 모달 스타일 */
  .stock-summary {
    background-color: var(--background-gray);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .stock-summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .stock-summary-item:last-child {
    margin-bottom: 0;
  }
  
  .stock-summary-label {
    color: var(--secondary-color);
  }
  
  .stock-summary-value {
    font-weight: 600;
  }
  
  .total-line {
    border-top: 1px solid var(--border-color);
    margin-top: 1rem;
    padding-top: 1rem;
  }
  
  .total-line .stock-summary-item {
    font-weight: 700;
  }
  
  /* 빈 상태 스타일 */
  .empty-state {
    text-align: center;
    padding: 2rem;
  }
  
  .empty-icon {
    font-size: 3rem;
    color: var(--secondary-color);
    opacity: 0.5;
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
  
  /* 반응형 스타일 */
  @media (max-width: 992px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .asset-details {
      flex-direction: column;
      gap: 1rem;
    }
  }
  </style>