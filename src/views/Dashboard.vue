<template>
  <div class="content">
    <div class="balance-card">
      <div class="balance-label">총 보유자산</div>
      <div class="balance-amount" id="player-money">{{ totalAssetFormatted }}</div>
    </div>

    <div class="content-grid">
      <!-- 보유 주식 카드 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">보유 주식</h2>
          <router-link to="/portfolio" class="view-all">전체보기</router-link>
        </div>
        <div class="card-body">
          <div v-if="loading.playerStocks" class="empty-state">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="empty-text">로딩 중...</div>
          </div>
          <template v-else>
            <div v-if="playerStocks.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-bar-chart"></i>
              </div>
              <h2 class="card-title">보유 중인 주식이 없습니다</h2>
              <p class="empty-description">주식 시장에서 주식을 구매해보세요</p>
              <router-link to="/markets" class="btn btn-primary">주식 구매하기</router-link>
            </div>
            <ul v-else class="stock-list">
              <li v-for="stock in playerStocks.slice(0, 5)" :key="stock.stockId" class="stock-item">
                <div class="stock-info">
                  <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
                  <div class="stock-details">
                    <div class="stock-name">{{ stock.stockName }}</div>
                    <div class="stock-quantity">{{ stock.stockQuantity }}주</div>
                  </div>
                </div>
                <div class="stock-price">
                  <div class="stock-price-value">{{ formatMoney(stock.stockPrice * stock.stockQuantity) }}</div>
                  <div class="stock-change" :class="getProfitClass(stock.profitRate)">
                    {{ formatProfitRate(stock.profitRate) }}
                  </div>
                </div>
                <div class="stock-actions">
                  <button class="btn btn-sm btn-success" @click="openSellModal(stock)">판매</button>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>

      <!-- 주식 시장 카드 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">주식 시장</h2>
          <router-link to="/markets" class="view-all">전체보기</router-link>
        </div>
        <div class="card-body">
          <div v-if="loading.stocks" class="empty-state">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="empty-text">로딩 중...</div>
          </div>
          <template v-else>
            <div v-if="stocks.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-graph-up"></i>
              </div>
              <h3 class="card-title">시장에 주식이 없습니다</h3>
              <p class="empty-description">새로운 주식을 등록해보세요</p>
              <button class="btn btn-primary" @click="openCreateStockModal">주식 등록하기</button>
            </div>
            <ul v-else class="stock-list">
              <li v-for="stock in stocks.slice(0, 5)" :key="stock.id" class="stock-item">
                <div class="stock-info">
                  <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
                  <div class="stock-details">
                    <div class="stock-name">{{ stock.stockName }}</div>
                  </div>
                </div>
                <div class="stock-price">
                  <div class="stock-price-value">{{ formatMoney(stock.stockPrice) }}</div>
                </div>
                <div class="stock-actions">
                  <button class="btn btn-sm btn-primary" @click="openBuyModal(stock)">구매</button>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>


      <!-- 최근 거래 내역 카드 -->
      <div class="card card-full">
        <div class="card-header">
          <h2 class="card-title">거래 내역</h2>
          <router-link to="/history" class="view-all">전체보기</router-link>
        </div>
        <div class="card-body">
          <div v-if="loading.history" class="empty-state">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="empty-text">로딩 중...</div>
          </div>
          <template v-else>
            <div v-if="stockHistories.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-clock-history"></i>
              </div>
              <h3 class="card-title">거래 내역이 없습니다</h3>
              <p class="empty-description">첫 주식 거래를 시작해보세요</p>
              <router-link to="/markets" class="btn btn-primary">주식 구매하기</router-link>
            </div>

            <ul v-else class="transaction-list">
              <li v-for="(history, index) in stockHistories.slice(0, 5)" :key="index" class="transaction-item">
                <div class="transaction-info">
                  <div class="transaction-content">
                    <div class="transaction-icon" :class="getTransactionIconClass(history.transactionType)">
                      {{ history.transactionType === '매수' ? '↓' : '↑' }}
                    </div>
                    <div class="transaction-details">
                      <div class="transaction-title">
                        {{ history.stockName }}
                        <span class="transaction-tag" :class="getTransactionTagClass(history.transactionType)">
                          {{ history.transactionType }}
                        </span>
                      </div>
                      <div class="transaction-date">
                        {{ formatDateTime(history.timestamp) }} • {{ history.quantity }}주
                      </div>
                    </div>
                  </div>
                </div>
                <div class="transaction-amount" :class="getTransactionAmountClass(history.transactionType)">
                  {{ getTransactionPrefix(history.transactionType) }}{{ formatMoney(history.totalAmount) }}
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>


      <!-- 주식 구매 모달 -->
      <div id="buy-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">주식 구매</h3>
            <button type="button" class="modal-close" @click="closeBuyModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedStock" class="modal-summary">
              <div class="summary-item">
                <span class="summary-label">주식명</span>
                <span class="summary-value">{{ selectedStock.stockName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">현재 가격</span>
                <span class="summary-value">{{ formatMoney(selectedStock.stockPrice) }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="buy-quantity">구매 수량</label>
              <input type="number" id="buy-quantity" class="form-input" v-model="buyQuantity" min="1"
                :max="maxBuyableQuantity" required>
            </div>

            <div class="modal-summary">
              <div class="summary-item total-line">
                <span class="summary-label">총 구매 금액</span>
                <span class="summary-value">{{ formatMoney(calculateTotalPrice()) }}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" @click="closeBuyModal">취소</button>
              <button type="button" class="btn btn-primary" @click="buyStock"
                :disabled="loading.transaction || !isValidQuantity">
                <span v-if="loading.transaction">처리 중...</span>
                <span v-else>구매 확정</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 주식 판매 모달 -->
      <div id="sell-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">주식 판매</h3>
            <button type="button" class="modal-close" @click="closeSellModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedPlayerStock" class="modal-summary">
              <div class="summary-item">
                <span class="summary-label">주식명</span>
                <span class="summary-value">{{ selectedPlayerStock.stockName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">현재 가격</span>
                <span class="summary-value">{{ formatMoney(selectedPlayerStock.stockPrice) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">보유 수량</span>
                <span class="summary-value">{{ selectedPlayerStock.stockQuantity }}주</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="sell-quantity">판매 수량</label>
              <input type="number" id="sell-quantity" class="form-input" v-model="sellQuantity" min="1"
                :max="selectedPlayerStock ? selectedPlayerStock.stockQuantity : 0" required>
            </div>

            <div class="modal-summary">
              <div class="summary-item total-line">
                <span class="summary-label">총 판매 금액</span>
                <span class="summary-value">{{ formatMoney(calculateTotalSellPrice()) }}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" @click="closeSellModal">취소</button>
              <button type="button" class="btn btn-primary" @click="sellStock"
                :disabled="loading.transaction || !isValidSellQuantity">
                <span v-if="loading.transaction">처리 중...</span>
                <span v-else>판매 확정</span>
              </button>
            </div>
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
import { formatNumber, formatDateTime, formatProfitRate } from '@/utils/format';

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore();
    const stockStore = useStockStore();

    const selectedStock = ref(null);
    const selectedPlayerStock = ref(null);
    const buyQuantity = ref(1);
    const sellQuantity = ref(1);
    const newStock = ref({
      name: '',
      price: 1000,
      description: ''
    });

    const money = computed(() => authStore.playerMoney);
    const moneyFormatted = computed(() => formatNumber(money.value));

    const stocks = computed(() => stockStore.stocks);
    const playerStocks = computed(() => stockStore.playerStocks);
    const stockHistories = computed(() => stockStore.stockHistories);
    const loading = computed(() => stockStore.loading);

    const totalInvestment = computed(() => {
      return playerStocks.value.reduce((total, stock) => {
        return total + (stock.stockPrice * stock.stockQuantity);
      }, 0);
    });

    const totalAsset = computed(() => money.value + totalInvestment.value);
    const totalAssetFormatted = computed(() => formatNumber(totalAsset.value));

    const maxBuyableQuantity = computed(() => {
      if (!selectedStock.value) return 0;
      return Math.floor(money.value / selectedStock.value.stockPrice);
    });

    const isValidQuantity = computed(() => {
      return buyQuantity.value > 0 && buyQuantity.value <= maxBuyableQuantity.value;
    });

    const isValidSellQuantity = computed(() => {
      return sellQuantity.value > 0 &&
        selectedPlayerStock.value &&
        sellQuantity.value <= selectedPlayerStock.value.stockQuantity;
    });

    const isValidNewStock = computed(() => {
      return newStock.value.name.trim() !== '' &&
        newStock.value.price > 0;
    });

    const calculateTotalPrice = () => {
      if (!selectedStock.value) return 0;
      return selectedStock.value.stockPrice * buyQuantity.value;
    };

    const calculateTotalSellPrice = () => {
      if (!selectedPlayerStock.value) return 0;
      return selectedPlayerStock.value.stockPrice * sellQuantity.value;
    };

    const getProfitClass = (profitRate) => {
      if (profitRate > 0) return 'price-up';
      if (profitRate < 0) return 'price-down';
      return '';
    };

    const getTransactionIconClass = (type) => {
      return type === '매수' ? 'transaction-buy' : 'transaction-sell';
    };

    const getTransactionTagClass = (type) => {
      return type === '매수' ? 'tag-buy' : 'tag-sell';
    };

    const getTransactionAmountClass = (type) => {
      return type === '매수' ? 'transaction-amount-sell' : 'transaction-amount-buy';
    };

    const getTransactionPrefix = (type) => {
      return type === '매수' ? '-' : '+';
    };

    const formatMoney = (value) => {
      return formatNumber(value);
    };

    const openBuyModal = (stock) => {
      selectedStock.value = stock;
      buyQuantity.value = 1;
      document.getElementById('buy-modal').style.display = 'flex';
    };

    const closeBuyModal = () => {
      document.getElementById('buy-modal').style.display = 'none';
      selectedStock.value = null;
      buyQuantity.value = 1;
    };

    const openSellModal = (stock) => {
      selectedPlayerStock.value = stock;
      sellQuantity.value = 1;
      document.getElementById('sell-modal').style.display = 'flex';
    };

    const closeSellModal = () => {
      document.getElementById('sell-modal').style.display = 'none';
      selectedPlayerStock.value = null;
      sellQuantity.value = 1;
    };

    const openCreateStockModal = () => {
      newStock.value = {
        name: '',
        price: 1000,
        description: ''
      };
      // 모달 열기 로직 추가 필요
    };

    const buyStock = async () => {
      if (!selectedStock.value || !isValidQuantity.value) return;

      const stockName = selectedStock.value.stockName;

      try {
        const success = await stockStore.buyStock(
          selectedStock.value.id,
          buyQuantity.value
        );

        if (success) {
          closeBuyModal();
          alert(`${stockName} ${buyQuantity.value}주를 성공적으로 구매했습니다.`);
        } else {
          alert('주식 구매에 실패했습니다.');
        }
      } catch (error) {
        console.error('주식 구매 실패:', error);
        alert('주식 구매 중 에러가 발생했습니다.');
      }
    };

    const sellStock = async () => {
      if (!selectedPlayerStock.value || !isValidSellQuantity.value) return;

      const stockName = selectedPlayerStock.value.stockName;

      try {
        const success = await stockStore.sellStock(
          selectedPlayerStock.value.stockId,
          sellQuantity.value
        );

        if (success) {
          closeSellModal();
          alert(`${stockName} ${sellQuantity.value}주를 성공적으로 판매했습니다.`);
        } else {
          alert('주식 판매에 실패했습니다.');
        }
      } catch (error) {
        console.error('주식 판매 실패:', error);
        alert('주식 판매 중 에러가 발생했습니다.');
      }
    };

    const createStock = async () => {
      if (!isValidNewStock.value) return;

      try {
        const success = await stockStore.createStock({
          name: newStock.value.name,
          price: newStock.value.price,
          description: newStock.value.description
        });

        if (success) {
          newStock.value = {
            name: '',
            price: 1000,
            description: ''
          };
          alert(`${newStock.value.name} 주식이 성공적으로 등록되었습니다.`);
        }
      } catch (error) {
        console.error('주식 생성 실패:', error);
        alert('주식 등록에 실패했습니다.');
      }
    };

    onMounted(async () => {
      try {
        await stockStore.fetchStocks();
        await stockStore.fetchPlayerStocks();
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
      totalAsset,
      totalAssetFormatted,
      selectedStock,
      selectedPlayerStock,
      buyQuantity,
      sellQuantity,
      maxBuyableQuantity,
      isValidQuantity,
      isValidSellQuantity,
      newStock,
      isValidNewStock,
      formatMoney,
      formatProfitRate,
      formatDateTime,
      calculateTotalPrice,
      calculateTotalSellPrice,
      getProfitClass,
      getTransactionIconClass,
      getTransactionTagClass,
      getTransactionAmountClass,
      getTransactionPrefix,
      openBuyModal,
      closeBuyModal,
      openSellModal,
      closeSellModal,
      openCreateStockModal,
      buyStock,
      sellStock,
      createStock
    };
  }
}
</script>

<style scoped>
.content {}

.balance-card {
  background: linear-gradient(45deg, #3182f6, #759beb);
  color: var(--white);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.balance-label {
  font-size: 14px;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.card {
  background-color: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-full {
  grid-column: 1 / -1;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.view-all {
  color: var(--primary-blue);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.card-body {
  padding: 24px;
}

.stock-list {
  list-style: none;
  padding: 0;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-logo {
  width: 40px;
  height: 40px;
  background-color: var(--primary-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 700;
  font-size: 18px;
  margin-right: 16px;
}

.stock-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.stock-details {
  flex: 1;
}

.stock-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stock-quantity {
  font-size: 14px;
  color: var(--secondary-text);
}

.stock-price {
  text-align: right;
  min-width: 120px;
}

.stock-price-value {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stock-change {
  font-size: 14px;
}

.price-up {
  color: var(--danger-red);
}

.price-down {
  color: var(--primary-blue);
}

.stock-actions {
  margin-left: 16px;
}

.transaction-list {
  list-style: none;
  padding: 0;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  flex: 1;
}

.transaction-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 16px;
}

.transaction-buy {
  background-color: rgba(49, 130, 246, 0.1);
  color: var(--primary-blue);
}

.transaction-sell {
  background-color: rgba(32, 201, 151, 0.1);
  color: var(--success-green);
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.transaction-date {
  font-size: 14px;
  color: var(--secondary-text);
}

.transaction-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.tag-buy {
  background-color: rgba(49, 130, 246, 0.1);
  color: var(--primary-blue);
}

.tag-sell {
  background-color: rgba(32, 201, 151, 0.1);
  color: var(--success-green);
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount-buy {
  color: var(--text-color);
}

.transaction-amount-sell {
  color: var(--text-color);
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--secondary-text);
}

.empty-icon {
  margin-bottom: 16px;
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 24px;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.3s;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--secondary-text);
}

.modal-body {
  padding: 24px;
}

.modal-summary {
  background-color: var(--background-gray);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: var(--secondary-text);
}

.summary-value {
  font-weight: 600;
}

.total-line {
  border-top: 1px solid var(--border-color);
  margin-top: 12px;
  padding-top: 12px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}

.btn {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: var(--white);
}

.btn-primary:hover {
  background-color: #2b74df;
}

.btn-outline {
  background-color: var(--white);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.btn-outline:hover {
  background-color: var(--background-gray);
}

.form-group {
  flex: 1;
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

.btn-success {
    background-color: var(--success-green);
    color: var(--white);
  }

  .btn-success:hover {
    background-color: #1aad7f;
    /* 약간 더 어두운 초록색 */
  }

  /* 버튼 크기를 더 작게 조정 */
  .btn-sm {
    padding: 5px 15px;
    /* 기존 6px 12px에서 감소 */
    /* font-size: 12px; */
    /* 기존 13px에서 감소 */
  }

  /* 주식 아이템의 액션 버튼 간격 조정 */
  .stock-actions {
    margin-left: 12px;
    /* 기존 16px에서 감소 */
  }

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .card-full {
    grid-column: 1;
  }
}
</style>