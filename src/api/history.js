import apiClient from './index';

export const historyApi = {
  /**
   * 주식 거래 내역 조회 API
   * @param {string} playerId - 플레이어 ID
   * @returns {Promise} API 응답
   */
  getPlayerStockHistories(playerId) {
    return apiClient.get(`/players/player-stock-histories?playerId=${playerId}`);
  },

  /**
   * 포트폴리오 분석 API
   * @param {string} playerId - 플레이어 ID
   * @returns {Promise} API 응답
   */
  analyzePortfolio(playerId) {
    return apiClient.get(`/players/${playerId}/portfolio/analysis`);
  }
};