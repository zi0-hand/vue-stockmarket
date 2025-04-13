import apiClient from './index';

export const authApi = {
  /**
   * 로그인 API
   * @param {Object} loginData - 로그인 데이터
   * @param {string} loginData.nickname - 사용자 닉네임
   * @param {string} loginData.password - 비밀번호
   * @returns {Promise} API 응답
   */
  login(loginData) {
    return apiClient.post('/players/login', loginData);
  },

  /**
   * 회원가입 API
   * @param {Object} signUpData - 회원가입 데이터
   * @param {string} signUpData.nickname - 사용자 닉네임
   * @param {string} signUpData.password - 비밀번호
   * @param {number} signUpData.money - 초기 자금
   * @returns {Promise} API 응답
   */
  signUp(signUpData) {
    return apiClient.post('/players/sign-up', signUpData);
  },

  /**
   * 플레이어 상세 정보 조회 API
   * @param {string} playerId - 플레이어 ID
   * @returns {Promise} API 응답
   */
  getPlayerDetail(playerId) {
    return apiClient.get(`/players/${playerId}/detail`);
  },

  /**
   * 플레이어 자금 조회 API
   * @param {string} playerId - 플레이어 ID
   * @returns {Promise} API 응답
   */
  getPlayerMoney(playerId) {
    return apiClient.get(`/players/${playerId}/money`);
  },
  
  /**
   * 플레이어 자금 추가 API
   * @param {string} playerId - 플레이어 ID
   * @param {number} money - 추가할 자금
   * @returns {Promise} API 응답
   */
  addPlayerMoney(playerId, money) {
    return apiClient.put(`/players/${playerId}/money`, { money });
  }
};