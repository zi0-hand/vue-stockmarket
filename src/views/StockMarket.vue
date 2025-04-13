<template>
    <div class="stock-market">
      <div class="page-header">
        <h1 class="page-title">주식 시장</h1>
        <div class="page-actions">
          <button 
            class="btn btn-outline-primary me-2"
            @click="openCreateStockModal"
          >
            <i class="bi bi-plus-circle"></i> 새 주식 등록
          </button>
          <button 
            class="btn btn-primary"
            @click="refreshMarket"
            :disabled="loading.stocks"
          >
            <i class="bi bi-arrow-repeat" :class="{ 'rotating': loading.stocks }"></i>
            시장 업데이트
          </button>
        </div>
      </div>
      
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
          <select class="form-select" v-model="sortBy">
            <option value="name">이름순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading.stocks" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중...</span>
        </div>
        <p>주식 정보를 불러오는 중입니다...</p>
      </div>
      
      <div v-else-if="filteredStocks.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-bar-chart"></i>
        </div>
        <h3 class="empty-title">주식이 없습니다</h3>
        <p class="empty-description">
          {{ searchTerm ? '검색 결과가 없습니다. 다른 검색어를 입력해보세요.' : '새로운 주식을 등록해보세요.' }}
        </p>
        <button v-if="!searchTerm" class="btn btn-primary" @click="openCreateStockModal">
          주식 등록하기
        </button>
      </div>
      
      <div v-else class="stock-list-container">
        <div class="card" v-for="stock in filteredStocks" :key="stock.id">
          <div class="card-body">
            <div class="stock-card-header">
              <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
              <div class="stock-info">
                <h2 class="stock-name">{{ stock.stockName }}</h2>
                <div class="stock-id">ID: {{ formatStockId(stock.id) }}</div>
              </div>
            </div>
            
            <div class="stock-price-section">
              <div class="current-price">
                <div class="price-label">현재 가격</div>
                <div class="price-value">{{ formatMoney(stock.stockPrice) }}</div>
              </div>
              
              <div class="price-chart">
                <!-- 여기에 차트가 들어갈 수 있습니다 -->
                <div class="price-placeholder">
                  <i class="bi bi-graph-up"></i>
                </div>
              </div>
            </div>
            
            <div class="stock-actions">
              <button class="btn btn-outline-primary btn-sm me-2" @click="viewStockHistory(stock)">
                <i class="bi bi-clock-history"></i> 가격 이력
              </button>
              <button class="btn btn-primary btn-sm" @click="openBuyModal(stock)">
                <i class="bi bi-cart-plus"></i> 구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 페이지네이션 -->
      <nav v-if="totalPages > 1 && !searchTerm" class="pagination-container">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">이전</a>
          </li>
          <li 
            v-for="page in paginationRange" 
            :key="page" 
            class="page-item"
            :class="{ active: page === currentPage + 1 }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page - 1)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">다음</a>
          </li>
        </ul>
      </nav>
      
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
                  <span class="stock-summary-value">{{ formatMoney(playerMoney) }}</span>
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
      
      <!-- 새 주식 등록 모달 -->
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
                    <span class="input-group-text"></span>
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
      
      <!-- 가격 이력 모달 -->
      <div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="historyModalLabel">
                <span v-if="selectedStock">{{ selectedStock.stockName }}</span> 가격 이력
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="loading.history" class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">로딩 중...</span>
                </div>
              </div>
              <div v-else-if="priceHistories.length === 0" class="empty-state small">
                <div class="empty-icon"><i class="bi bi-clock-history"></i></div>
                <p>아직 가격 변동 이력이 없습니다.</p>
              </div>
              <table v-else class="table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th class="text-end">가격</th>
                    <th class="text-end">변동</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(history, index) in priceHistories" :key="history.id">
                    <td>{{ formatDateTime(history.timestamp) }}</td>
                    <td class="text-end">{{ formatMoney(history.price) }}</td>
                    <td class="text-end">
                      <span v-if="index < priceHistories.length - 1" :class="getPriceChangeClass(history, index)">
                        {{ formatPriceChange(history, index) }}
                      </span>
                      <span v-else>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
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
  import { formatNumber, formatDateTime } from '@/utils/format';
  import { Modal } from '@/utils/bootstrap';
  
  export default {
    name: 'StockMarket',
    setup() {
      const authStore = useAuthStore();
      const stockStore = useStockStore();
      
      // 페이지네이션 상태
      const currentPage = ref(0);
      const itemsPerPage = 10;
      const totalPages = ref(1);
      
      // 필터 및 정렬 상태
      const searchTerm = ref('');
      const sortBy = ref('name');
      
      // 모달 상태
      const selectedStock = ref(null);
      const buyQuantity = ref(1);
      const newStock = ref({
        name: '',
        price: 1000,
        description: ''
      });
      const priceHistories = ref([]);
      
      // 모달 인스턴스
      let buyModal = null;
      let createModal = null;
      let historyModal = null;
      
      // 스토어에서 데이터 가져오기
      const stocks = computed(() => stockStore.stocks);
      const loading = computed(() => stockStore.loading);
      const playerMoney = computed(() => authStore.playerMoney);
      
      // 필터링된 주식 목록
      const filteredStocks = computed(() => {
        let result = [...stocks.value];
        
        // 검색어로 필터링
        if (searchTerm.value) {
          const term = searchTerm.value.toLowerCase();
          result = result.filter(stock => 
            stock.stockName.toLowerCase().includes(term)
          );
        }
        
        // 정렬
        result.sort((a, b) => {
          if (sortBy.value === 'name') {
            return a.stockName.localeCompare(b.stockName);
          } else if (sortBy.value === 'price-asc') {
            return a.stockPrice - b.stockPrice;
          } else if (sortBy.value === 'price-desc') {
            return b.stockPrice - a.stockPrice;
          }
          return 0;
        });
        
        // 검색 모드에서는 페이지네이션 적용 안 함
        if (searchTerm.value) {
          return result;
        }
        
        // 페이지네이션
        const totalItems = result.length;
        totalPages.value = Math.ceil(totalItems / itemsPerPage);
        
        const start = currentPage.value * itemsPerPage;
        const end = start + itemsPerPage;
        
        return result.slice(start, end);
      });
      
      // 페이지네이션 범위 계산
      const paginationRange = computed(() => {
        const range = [];
        const maxButtons = 5;
        
        if (totalPages.value <= maxButtons) {
          // 페이지 수가 적으면 모든 페이지 표시
          for (let i = 1; i <= totalPages.value; i++) {
            range.push(i);
          }
        } else {
          // 현재 페이지 기준으로 표시할 범위 계산
          let start = Math.max(1, currentPage.value - 1);
          let end = Math.min(totalPages.value, start + maxButtons - 1);
          
          // 범위 조정
          if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
          }
          
          for (let i = start; i <= end; i++) {
            range.push(i);
          }
        }
        
        return range;
      });
      
      // 최대 구매 가능 수량
      const maxBuyableQuantity = computed(() => {
        if (!selectedStock.value) return 0;
        return Math.floor(playerMoney.value / selectedStock.value.stockPrice);
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
      
      // 페이지 변경
      const changePage = (page) => {
        if (page < 0 || page >= totalPages.value) return;
        currentPage.value = page;
      };
      
      // UUID를 짧게 표시
      const formatStockId = (id) => {
        if (!id) return '';
        return id.substring(0, 8);
      };
      
      // 금액 포맷팅
      const formatMoney = (value) => {
        return formatNumber(value);
      };
      
      // 가격 변동 계산
      const formatPriceChange = (history, index) => {
        if (index >= priceHistories.value.length - 1) return '-';
        
        const currentPrice = history.price;
        const prevPrice = priceHistories.value[index + 1].price;
        const change = currentPrice - prevPrice;
        const changePercent = (change / prevPrice) * 100;
        
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toLocaleString()} (${sign}${changePercent.toFixed(2)}%)`;
      };
      
      // 가격 변동에 따른 클래스
      const getPriceChangeClass = (history, index) => {
        if (index >= priceHistories.value.length - 1) return '';
        
        const currentPrice = history.price;
        const prevPrice = priceHistories.value[index + 1].price;
        const change = currentPrice - prevPrice;
        
        return change > 0 ? 'text-danger' : change < 0 ? 'text-primary' : '';
      };
      
      // 총 구매 금액 계산
      const calculateTotalPrice = () => {
        if (!selectedStock.value) return 0;
        return selectedStock.value.stockPrice * buyQuantity.value;
      };
      
      // 모달 초기화 함수
      const initModals = () => {
        // 구매 모달 초기화
        if (!buyModal) {
          const modalElement = document.getElementById('buyStockModal');
          buyModal = new Modal(modalElement);
          
          modalElement.addEventListener('hidden.bs.modal', () => {
            selectedStock.value = null;
            buyQuantity.value = 1;
          });
        }
        
        // 주식 등록 모달 초기화
        if (!createModal) {
          const modalElement = document.getElementById('createStockModal');
          createModal = new Modal(modalElement);
          
          modalElement.addEventListener('hidden.bs.modal', () => {
            newStock.value = {
              name: '',
              price: 1000,
              description: ''
            };
          });
        }
        
        // 가격 이력 모달 초기화
        if (!historyModal) {
          const modalElement = document.getElementById('historyModal');
          historyModal = new Modal(modalElement);
          
          modalElement.addEventListener('hidden.bs.modal', () => {
            priceHistories.value = [];
          });
        }
      };
      
      // 구매 모달 열기
      const openBuyModal = (stock) => {
        selectedStock.value = stock;
        buyQuantity.value = 1;
        buyModal.show();
      };
      
      // 주식 등록 모달 열기
      const openCreateStockModal = () => {
        newStock.value = {
          name: '',
          price: 1000,
          description: ''
        };
        createModal.show();
      };
      
      // 가격 이력 모달 열기
      const viewStockHistory = async (stock) => {
        selectedStock.value = stock;
        priceHistories.value = [];
        
        try {
          loading.value.history = true;
          const response = await stockStore.fetchStockPriceHistories(stock.id);
          priceHistories.value = response || [];
          historyModal.show();
        } catch (error) {
          console.error('가격 이력 조회 실패:', error);
          alert('가격 이력을 불러오는데 실패했습니다.');
        } finally {
          loading.value.history = false;
        }
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
      
      // 주식 등록
      const createStock = async () => {
        if (!isValidNewStock.value) return;
        
        try {
          const success = await stockStore.createStock({
            name: newStock.value.name,
            price: parseInt(newStock.value.price),
            description: newStock.value.description
          });
          
          if (success) {
            createModal.hide();
            alert(`${newStock.value.name} 주식이 성공적으로 등록되었습니다.`);
            await refreshMarket();
          }
        } catch (error) {
          console.error('주식 등록 실패:', error);
          alert('주식 등록에 실패했습니다.');
        }
      };
      
      // 시장 새로고침
      const refreshMarket = async () => {
        try {
          await stockStore.fetchStocks();
        } catch (error) {
          console.error('시장 정보 새로고침 실패:', error);
          alert('시장 정보를 새로고침하는데 실패했습니다.');
        }
      };
      
      // 컴포넌트 마운트 시 데이터 로딩
      onMounted(async () => {
        initModals();
        await refreshMarket();
      });
      
      // 검색어 변경 시 페이지 초기화
      watch(searchTerm, () => {
        currentPage.value = 0;
      });
      
      // 정렬 방식 변경 시 페이지 초기화
      watch(sortBy, () => {
        currentPage.value = 0;
      });
      
      return {
        stocks,
        filteredStocks,
        loading,
        currentPage,
        totalPages,
        paginationRange,
        searchTerm,
        sortBy,
        selectedStock,
        buyQuantity,
        maxBuyableQuantity,
        isValidQuantity,
        newStock,
        isValidNewStock,
        priceHistories,
        playerMoney,
        formatStockId,
        formatMoney,
        formatDateTime,
        formatPriceChange,
        getPriceChangeClass,
        calculateTotalPrice,
        changePage,
        openBuyModal,
        openCreateStockModal,
        viewStockHistory,
        buyStock,
        createStock,
        refreshMarket
      };
    }
  }
  </script>
  
  <style scoped>
  .stock-market {
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
  
  .page-actions {
    display: flex;
    align-items: center;
  }
  
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-options {
    min-width: 150px;
  }
  
  .stock-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .card {
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .stock-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stock-logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-right: 1rem;
  }
  
  .stock-info {
    flex: 1;
  }
  
  .stock-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
  }
  
  .stock-id {
    font-size: 0.8rem;
    color: var(--secondary-color);
  }
  
  .stock-price-section {
    display: flex;
    margin-bottom: 1.5rem;
    align-items: center;
  }
  
  .current-price {
    flex: 1;
  }
  
  .price-label {
    font-size: 0.875rem;
    color: var(--secondary-color);
    margin-bottom: 0.25rem;
  }
  
  .price-value {
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .price-chart {
    width: 50%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .price-placeholder {
    color: var(--secondary-color);
    opacity: 0.3;
    font-size: 2rem;
  }
  
  .stock-actions {
    display: flex;
    justify-content: flex-end;
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
  
  .empty-state.small {
    padding: 2rem 0;
  }
  
  .empty-icon {
    font-size: 3rem;
    color: var(--secondary-color);
    opacity: 0.3;
    margin-bottom: 1rem;
  }
  
  .empty-state.small .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
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
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
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
    
    .stock-list-container {
      grid-template-columns: 1fr;
    }
  }

</style>