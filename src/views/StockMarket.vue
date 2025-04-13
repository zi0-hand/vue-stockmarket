<template>
  <div class="stock-market">
    <div class="market-header">
      <h1 class="page-title">주식 시장</h1>
      <div class="header-actions">
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
    
    <div class="search-filter-container">
      <div class="search-bar">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            type="text"
            class="form-control"
            placeholder="주식명 검색"
            v-model="searchTerm"
          >
        </div>
      </div>
      
      <div class="filter-options">
        <select class="form-select" v-model="sortBy">
          <option value="name">이름순</option>
          <option value="price-asc">가격 낮은순</option>
          <option value="price-desc">가격 높은순</option>
        </select>
      </div>
    </div>
    
    <!-- 로딩 중 표시 -->
    <div v-if="loading.stocks" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
      <p>주식 정보를 불러오는 중입니다...</p>
    </div>
    
    <!-- 빈 상태 표시 -->
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
    
    <!-- 주식 목록 -->
    <div v-else class="stocks-grid">
      <div class="stock-card" v-for="stock in filteredStocks" :key="stock.id">
        <div class="stock-header">
          <div class="stock-logo">{{ stock.stockName.charAt(0) }}</div>
          <div class="stock-info">
            <h2 class="stock-name">{{ stock.stockName }}</h2>
            <div class="stock-id">ID: {{ formatStockId(stock.id) }}</div>
          </div>
        </div>
        
        <div class="stock-price-container">
          <div class="current-price">
            <div class="price-label">현재 가격</div>
            <div class="price-value">{{ formatMoney(stock.stockPrice) }}</div>
          </div>
          
          <div class="price-chart">
            <div class="price-icon">
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
              <div class="summary-item">
                <span class="summary-label">주식명</span>
                <span class="summary-value">{{ selectedStock.stockName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">현재 가격</span>
                <span class="summary-value">{{ formatMoney(selectedStock.stockPrice) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">보유 자금</span>
                <span class="summary-value">{{ formatMoney(playerMoney) }}</span>
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
                <div class="summary-item">
                  <span class="summary-label">총 구매 금액</span>
                  <span class="summary-value">{{ formatMoney(calculateTotalPrice()) }}</span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-bs-dismiss="modal">취소</button>
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
                  <span class="input-group-text">￦</span>
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
            <button type="button" class="btn btn-outline" data-bs-dismiss="modal">취소</button>
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
            <div v-else>
              <!-- 가격 그래프 추가 -->
              <div class="price-chart-container">
                <h6 class="chart-title">가격 변동 추이</h6>
                <div class="chart-wrapper">
                  <canvas ref="priceChartCanvas"></canvas>
                </div>
              </div>
              
              <!-- 가격 이력 테이블 -->
              <h6 class="history-table-title">상세 이력</h6>
              <table class="table">
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
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-bs-dismiss="modal">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useStockStore } from '@/store/stocks';
import { formatNumber, formatDateTime } from '@/utils/format';
import { Modal } from '@/utils/bootstrap';
// Chart.js 불러오기
import Chart from 'chart.js/auto';

export default {
  name: 'StockMarket',
  setup() {
    const authStore = useAuthStore();
    const stockStore = useStockStore();
    
    // 페이지네이션 상태
    const currentPage = ref(0);
    const itemsPerPage = 12; // 그리드에 맞게 조정
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
    
    // 차트 캔버스 참조 추가
    const priceChartCanvas = ref(null);
    let priceChart = null; // 차트 인스턴스를 저장할 변수
    
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
      return `${sign}${formatNumber(change)} (${sign}${changePercent.toFixed(2)}%)`;
    };
    
    // 가격 변동에 따른 클래스
    const getPriceChangeClass = (history, index) => {
      if (index >= priceHistories.value.length - 1) return '';
      
      const currentPrice = history.price;
      const prevPrice = priceHistories.value[index + 1].price;
      const change = currentPrice - prevPrice;
      
      return change > 0 ? 'price-up' : change < 0 ? 'price-down' : '';
    };
    
    // 총 구매 금액 계산
    const calculateTotalPrice = () => {
      if (!selectedStock.value) return 0;
      return selectedStock.value.stockPrice * buyQuantity.value;
    };
    
    // 차트 생성 함수
    const createPriceChart = () => {
      if (priceChart) {
        priceChart.destroy(); // 기존 차트가 있다면 제거
      }
      
      if (!priceChartCanvas.value) return;
      
      // 차트 데이터 준비 (시간순으로 정렬)
      const sortedHistories = [...priceHistories.value].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      const labels = sortedHistories.map(history => 
        new Date(history.timestamp).toLocaleDateString()
      );
      const data = sortedHistories.map(history => history.price);
      
      // 차트 색상 설정
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-blue') || '#3182f6';
      
      // 차트 생성
      const ctx = priceChartCanvas.value.getContext('2d');
      priceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '주식 가격',
            data: data,
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}20`, // 20% 투명도
            fill: true,
            tension: 0.2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `가격: ${formatNumber(context.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return formatNumber(value);
                }
              }
            }
          }
        }
      });
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
          if (priceChart) {
            priceChart.destroy();
            priceChart = null;
          }
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
        
        // 데이터가 로드된 후 차트 생성
        if (priceHistories.value.length > 0) {
          nextTick(() => {
            createPriceChart();
          });
        }
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
      priceChartCanvas, // 차트 캔버스 참조 추가
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
  padding: 20px 0;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-filter-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-bar {
  flex: 1;
}

.filter-options {
  width: 150px;
}

/* 주식 목록 그리드 레이아웃 */
.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stock-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stock-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stock-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.stock-logo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--primary-blue, #3182f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  margin-right: 12px;
}

.stock-info {
  flex: 1;
}

.stock-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}

.stock-id {
  font-size: 12px;
  color: var(--secondary-text, #718096);
}

.stock-price-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.current-price {
  flex: 1;
}

.price-label {
  font-size: 13px;
  color: var(--secondary-text, #718096);
  margin-bottom: 4px;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
}

.price-chart {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-icon {
  color: var(--secondary-text, #718096);
  opacity: 0.3;
  font-size: 24px;
}

.stock-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-state p {
  margin-top: 16px;
  color: var(--secondary-text, #718096);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-state.small {
  padding: 30px 0;
}

.empty-icon {
  font-size: 48px;
  color: var(--secondary-text, #718096);
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state.small .empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-description {
  color: var(--secondary-text, #718096);
  margin-bottom: 20px;
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 차트 스타일 추가 */
.price-chart-container {
  margin-bottom: 24px;
}

.chart-title, .history-table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.chart-wrapper {
  height: 300px;
  position: relative;
  margin-bottom: 24px;
  border-radius: 8px;
  background-color: var(--background-gray, #f7fafc);
  padding: 16px;
}

/* 모달 스타일 */
.modal-content {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

/* 주식 요약 정보 */
.stock-summary {
  background-color: var(--background-gray, #f7fafc);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
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
  color: var(--secondary-text, #718096);
}

.summary-value {
  font-weight: 600;
}

.total-line {
  border-top: 1px solid var(--border-color, #e2e8f0);
  margin-top: 12px;
  padding-top: 12px;
}

/* 이력 테이블 */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  color: var(--secondary-text, #718096);
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.text-end {
  text-align: right;
}

.price-up {
  color: var(--danger-red, #e53e3e);
}

.price-down {
  color: var(--primary-blue, #3182f6);
}

/* 버튼 스타일 */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-blue, #3182f6);
  border-color: var(--primary-blue, #3182f6);
}

.btn-primary:hover {
  background-color: #2b74df;
  border-color: #2b74df;
}

.btn-outline {
  color: var(--text-color, #1a202c);
  background-color: white;
  border: 1px solid var(--border-color, #e2e8f0);
}

.btn-outline:hover {
  background-color: var(--background-gray, #f7fafc);
}

.btn-outline-primary {
  color: var(--primary-blue, #3182f6);
  border-color: var(--primary-blue, #3182f6);
}

.btn-outline-primary:hover {
  background-color: rgba(49, 130, 246, 0.08);
}

/* 애니메이션 */
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 992px) {
  .market-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-filter-container {
    flex-direction: column;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .stocks-grid {
    grid-template-columns: 1fr;
  }
}
</style>