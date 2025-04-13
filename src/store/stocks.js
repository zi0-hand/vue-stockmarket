import { defineStore } from 'pinia';
import { stocksApi } from '@/api/stocks';
import { historyApi } from '@/api/history';
import { useAuthStore } from './auth';

export const useStockStore = defineStore('stocks', {
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
      analysis: false
    },
    error: null,
    currentPage: 0,
    totalPages: 0
  }),
  
  getters: {
    getStockById: (state) => (stockId) => {
      return state.stocks.find(stock => stock.id === stockId);
    },
    
    getTotalInvestment: (state) => {
      return state.playerStocks.reduce((total, stock) => {
        return total + (stock.stockPrice * stock.stockQuantity);
      }, 0);
    }
  },
  
  actions: {
    // 주식 목록 불러오기
    async fetchStocks(page = 0) {
      this.loading.stocks = true;
      this.error = null;
      
      try {
        const response = await stocksApi.getStocks(page);
        this.stocks = response.data;
        this.currentPage = page;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '주식 목록을 불러오는데 실패했습니다.';
        return [];
      } finally {
        this.loading.stocks = false;
      }
    },
    
    // 보유 주식 불러오기
    async fetchPlayerStocks() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return;
      
      this.loading.playerStocks = true;
      this.error = null;
      
      try {
        const response = await stocksApi.getPlayerStocks(authStore.playerId);
        this.playerStocks = response.data || [];
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '보유 주식을 불러오는데 실패했습니다.';
        return [];
      } finally {
        this.loading.playerStocks = false;
      }
    },
    
    // 주식 매수
    async buyStock(stockId, quantity) {
      const authStore = useAuthStore();
      if (!authStore.playerId) return false;
      
      this.loading.transaction = true;
      this.error = null;
      

      try {
      await stocksApi.buyStock({
        playerId: authStore.playerId,
        stockId: stockId,
        stockQuantity: quantity
      }).then((res) => {
        console.log('매수 성공 응답:', res.data);
      }).catch((err) => {
        console.error('매수 실패:', err.response?.data || err.message);
        throw err;
      });

        // 보유 주식과 플레이어 정보 다시 불러오기
        await this.fetchPlayerStocks();
        await authStore.updatePlayerMoney();
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || '주식 매수에 실패했습니다.';
        return false;
      } finally {
        this.loading.transaction = false;
      }
    },
    
    // 주식 매도
    async sellStock(stockId, quantity) {
      const authStore = useAuthStore();
      if (!authStore.playerId) return false;
      
      this.loading.transaction = true;
      this.error = null;
      
      try {
        await stocksApi.sellStock({
          playerId: authStore.playerId,
          stockId: stockId,
          stockQuantity: quantity
        });
        
        // 보유 주식과 플레이어 정보 다시 불러오기
        await this.fetchPlayerStocks();
        await authStore.updatePlayerMoney();
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || '주식 매도에 실패했습니다.';
        return false;
      } finally {
        this.loading.transaction = false;
      }
    },
    
    // 거래 내역 불러오기
    async fetchStockHistories() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return;
      
      this.loading.history = true;
      this.error = null;
      
      try {
        const response = await historyApi.getPlayerStockHistories(authStore.playerId);
        this.stockHistories = response.data || [];
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '거래 내역을 불러오는데 실패했습니다.';
        return [];
      } finally {
        this.loading.history = false;
      }
    },
    
    // 포트폴리오 분석
    async fetchPortfolioAnalysis() {
      const authStore = useAuthStore();
      if (!authStore.playerId) return;
      
      this.loading.analysis = true;
      this.error = null;
      
      try {
        const response = await historyApi.analyzePortfolio(authStore.playerId);
        this.portfolioAnalysis = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '포트폴리오 분석에 실패했습니다.';
        return null;
      } finally {
        this.loading.analysis = false;
      }
    },
    
    // 새 주식 생성
    async createStock(stockData) {
      this.loading.stocks = true;
      this.error = null;
      
      try {
        const response = await stocksApi.createStock(stockData);
        // 주식 목록 다시 불러오기
        await this.fetchStocks();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '주식 생성에 실패했습니다.';
        return null;
      } finally {
        this.loading.stocks = false;
      }
    },
    
    // 주식 가격 변경
    async changeStockPrice(stockId) {
      try {
        await stocksApi.changePrice(stockId);
        // 주식 목록과 보유 주식 다시 불러오기
        await this.fetchStocks();
        await this.fetchPlayerStocks();
        return true;
      } catch (error) {
        console.error('주식 가격 변경 실패:', error);
        return false;
      }
    }
  }
});