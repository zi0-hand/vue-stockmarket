// api/stocks.js
/**
 * 주식 관련 API 호출을 담당하는 모듈
 * 주식 목록 조회, 거래, 가격 변경 등의 API 엔드포인트 제공
 */
import apiClient from './index';

export const stocksApi = {
  /**
   * 전체 주식 목록 조회 API
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @returns {Promise} API 응답
   */
  getStocks(page = 0) {
    return apiClient.get(`/stocks?page=${page}`);
  },

  /**
   * 주식 상장 API
   * @param {Object} stockData - 주식 데이터
   * @param {string} stockData.name - 주식 이름
   * @param {number} stockData.price - 주식 가격
   * @param {string} stockData.description - 주식 설명
   * @returns {Promise} API 응답
   */
  createStock(stockData) {
    return apiClient.post('/stocks', stockData);
  },

  /**
   * 주식 가격 변경 API
   * @param {string} stockId - 주식 ID
   * @returns {Promise} API 응답
   */
  changePrice(stockId) {
    return apiClient.put(`/stocks/${stockId}`);
  },

  /**
   * 주식 가격 이력 조회 API
   * @param {string} stockId - 주식 ID
   * @returns {Promise} API 응답
   */
  getStockPriceHistories(stockId) {
    return apiClient.get(`/stocks/${stockId}/price-histories`);
  },

  /**
   * 보유 주식 목록 조회 API
   * @param {string} playerId - 플레이어 ID
   * @returns {Promise} API 응답
   */
  getPlayerStocks(playerId) {
    return apiClient.get(`/players/player-stocks?playerId=${playerId}`);
  },

  /**
   * 주식 매수 API
   * @param {Object} buyData - 매수 데이터
   * @param {string} buyData.playerId - 플레이어 ID
   * @param {string} buyData.stockId - 주식 ID
   * @param {number} buyData.stockQuantity - 매수 수량
   * @returns {Promise} API 응답
   */
  buyStock(buyData) {
    return apiClient.post('/players/player-stocks', buyData);
  },

  /**
   * 주식 매도 API
   * @param {Object} sellData - 매도 데이터
   * @param {string} sellData.playerId - 플레이어 ID
   * @param {string} sellData.stockId - 주식 ID
   * @param {number} sellData.stockQuantity - 매도 수량
   * @returns {Promise} API 응답
   */
  sellStock(sellData) {
    return apiClient.put('/players/player-stocks', sellData);
  }
};

export default stocksApi;