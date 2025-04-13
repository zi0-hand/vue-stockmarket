// store/stocks.js
/**
 * 주식 관련 상태 관리 스토어
 * 주식 목록, 거래, 포트폴리오 등의 상태를 관리
 */
import { defineStore } from "pinia";
import { stocksApi } from "@/api/stocks";
import { historyApi } from "@/api/history";
import { useAuthStore } from "./auth";

export const useStockStore = defineStore("stocks", {
  state: () => ({
    stocks: [],
    playerStocks: [],
    stockHistories: [],
    portfolioAnalysis: null,
    loading: {
      stocks: false,
      playerStocks: false,
      transaction: false,
      history: false,
      analysis: false,
    },
    error: null,
    currentPage: 0,
    totalPages: 0,
  }),

  getters: {
    /**
     * ID로 주식 찾기
     * @param {string} stockId - 주식 ID
     * @returns {Object|undefined} 찾은 주식 객체 또는 undefined
     */
    getStockById: (state) => (stockId) => {
      return state.stocks.find((stock) => stock.id === stockId);
    },

    /**
     * 총 투자금액 계산
     * @returns {number} 총 투자금액
     */
    getTotalInvestment: (state) => {
      return state.playerStocks.reduce((total, stock) => {
        return total + stock.stockPrice * stock.stockQuantity;
      }, 0);
    },
  },

  actions: {
    /**
     * 주식 목록 불러오기
     * @param {number} page - 페이지 번호 (0부터 시작)
     * @returns {Promise<Array>} 주식 목록
     */
    async fetchStocks(page = 0) {
      this.loading.stocks = true;
      this.error = null;

      try {
        const response = await stocksApi.getStocks(page);
        this.stocks = response.data;
        this.currentPage = page;
        return response.data;
      } catch (error) {
        this.handleError(error, "주식 목록을 불러오는데 실패했습니다.");
        return [];
      } finally {
        this.loading.stocks = false;
      }
    },

    /**
     * 보유 주식 불러오기
     * @returns {Promise<Array>} 보유 주식 목록
     */
    async fetchPlayerStocks() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return [];

      this.loading.playerStocks = true;
      this.error = null;

      try {
        const response = await stocksApi.getPlayerStocks(authStore.playerId);
        this.playerStocks = response.data || [];
        return response.data;
      } catch (error) {
        this.handleError(error, "보유 주식을 불러오는데 실패했습니다.");
        return [];
      } finally {
        this.loading.playerStocks = false;
      }
    },

    /**
     * 주식 매수
     * @param {string} stockId - 주식 ID
     * @param {number} quantity - 매수 수량
     * @returns {Promise<boolean>} 매수 성공 여부
     */
    async buyStock(stockId, quantity) {
      const authStore = useAuthStore();
      if (!authStore.playerId) return false;

      this.loading.transaction = true;
      this.error = null;

      try {
        await stocksApi.buyStock({
          playerId: authStore.playerId,
          stockId: stockId,
          stockQuantity: quantity,
        });

        // 보유 주식과 플레이어 정보 다시 불러오기
        await this.fetchPlayerStocks();
        await authStore.updatePlayerMoney();
        await this.fetchStockHistories();

        return true;
      } catch (error) {
        this.handleError(error, "주식 매수에 실패했습니다.");
        return false;
      } finally {
        this.loading.transaction = false;
      }
    },

    /**
     * 주식 매도
     * @param {string} stockId - 주식 ID
     * @param {number} quantity - 매도 수량
     * @returns {Promise<boolean>} 매도 성공 여부
     */
    async sellStock(stockId, quantity) {
      const authStore = useAuthStore();
      if (!authStore.playerId) return false;

      this.loading.transaction = true;
      this.error = null;

      try {
        await stocksApi.sellStock({
          playerId: authStore.playerId,
          stockId: stockId,
          stockQuantity: quantity,
        });

        // 보유 주식과 플레이어 정보 다시 불러오기
        await this.fetchPlayerStocks();
        await authStore.updatePlayerMoney();
        await this.fetchStockHistories();

        return true;
      } catch (error) {
        this.handleError(error, "주식 매도에 실패했습니다.");
        return false;
      } finally {
        this.loading.transaction = false;
      }
    },

    /**
     * 거래 내역 불러오기
     * @returns {Promise<Array>} 거래 내역 목록
     */
    async fetchStockHistories() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return [];

      this.loading.history = true;
      this.error = null;

      try {
        const response = await historyApi.getPlayerStockHistories(
          authStore.playerId
        );
        this.stockHistories = response.data || [];
        return response.data;
      } catch (error) {
        this.handleError(error, "거래 내역을 불러오는데 실패했습니다.");
        return [];
      } finally {
        this.loading.history = false;
      }
    },

    /**
     * 포트폴리오 분석
     * @returns {Promise<Object|null>} 포트폴리오 분석 데이터
     */
    async fetchPortfolioAnalysis() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return null;

      this.loading.analysis = true;
      this.error = null;

      try {
        const response = await historyApi.analyzePortfolio(authStore.playerId);
        this.portfolioAnalysis = response.data;
        return response.data;
      } catch (error) {
        this.handleError(error, "포트폴리오 분석에 실패했습니다.");
        return null;
      } finally {
        this.loading.analysis = false;
      }
    },

    /**
     * 새 주식 생성
     * @param {Object} stockData - 주식 데이터
     * @returns {Promise<Object|null>} 생성된 주식 데이터
     */
    async createStock(stockData) {
      this.loading.stocks = true;
      this.error = null;

      try {
        const response = await stocksApi.createStock(stockData);
        // 주식 목록 다시 불러오기
        await this.fetchStocks();
        return response.data;
      } catch (error) {
        this.handleError(error, "주식 생성에 실패했습니다.");
        return null;
      } finally {
        this.loading.stocks = false;
      }
    },

    /**
     * 주식 가격 변경
     * @param {string} stockId - 주식 ID
     * @returns {Promise<boolean>} 가격 변경 성공 여부
     */
    async changeStockPrice(stockId) {
      try {
        await stocksApi.changePrice(stockId);
        // 주식 목록과 보유 주식 다시 불러오기
        await this.fetchStocks();
        await this.fetchPlayerStocks();
        return true;
      } catch (error) {
        this.handleError(error, "주식 가격 변경에 실패했습니다.");
        return false;
      }
    },
    
    /**
     * 주식 가격 이력 조회
     * @param {string} stockId - 주식 ID
     * @returns {Promise<Array>} 가격 이력 데이터
     */
    async fetchStockPriceHistories(stockId) {
      this.loading.history = true;
      this.error = null;

      try {
        const response = await stocksApi.getStockPriceHistories(stockId);
        return response.data;
      } catch (error) {
        this.handleError(error, "가격 이력을 불러오는데 실패했습니다.");
        return [];
      } finally {
        this.loading.history = false;
      }
    },

    /**
     * 오류 처리 통합 메서드
     * @param {Error} error - 발생한 오류
     * @param {string} defaultMessage - 기본 오류 메시지
     */
    handleError(error, defaultMessage) {
      console.error(`API 오류:`, error);
      
      // API 응답에서 오류 메시지 추출 또는 기본 메시지 사용
      this.error = error.response?.data?.message || defaultMessage;
      
      // 개발 환경에서만 콘솔에 상세 오류 출력
      if (import.meta.env.DEV) {
        console.debug('상세 오류 정보:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      }
    }
  },
});