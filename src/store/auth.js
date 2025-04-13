// store/auth.js
/**
 * 인증 관련 상태 관리 스토어
 * 사용자 로그인, 로그아웃, 인증 상태 확인 등의 기능을 담당
 */
import { defineStore } from 'pinia';
import { authApi } from '@/api/auth';
import router from '@/router';

// 토큰 저장소 - localStorage 대신 sessionStorage 사용하여 보안 강화
const TOKEN_KEY = 'auth_token';
const PLAYER_KEY = 'player_data';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    player: null,
    loading: false,
    error: null,
    isAuthenticated: false
  }),
  
  getters: {
    // 사용자가 인증되었는지 확인
    isLoggedIn: (state) => state.isAuthenticated && !!state.player,
    
    // 사용자 이름 반환
    playerName: (state) => state.player?.nickname || '',
    
    // 사용자 자금 반환
    playerMoney: (state) => state.player?.money || 0,
    
    // 사용자 ID 반환
    playerId: (state) => state.player?.id || null
  },
  
  actions: {
    /**
     * 사용자 로그인 처리
     * @param {string} nickname - 사용자 닉네임
     * @param {string} password - 사용자 비밀번호
     * @returns {Promise<boolean>} 로그인 성공 여부
     */
    async login(nickname, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // 로그인 API 호출
        const response = await authApi.login({ nickname, password });
        
        if (!response || !response.data) {
          throw new Error('서버 응답이 올바르지 않습니다.');
        }
        
        // 서버 응답에서 토큰 및 사용자 ID 추출
        const playerId = response.data;
        
        // 응답 데이터에 토큰이 있다고 가정하고 처리
        // 실제 API가 토큰을 반환하지 않는 경우 API 수정 필요
        const token = response.headers?.authorization || `temp_token_${playerId}`;
        
        // 인증 토큰 저장 (보안을 위해 sessionStorage 사용)
        sessionStorage.setItem(TOKEN_KEY, token);
        
        // 기본 사용자 정보 설정
        this.player = {
          id: playerId,
          nickname: nickname,
          // 초기값으로 설정
          money: 0
        };
        
        // 사용자 정보를 세션에 저장
        sessionStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
        
        // 인증 상태 업데이트
        this.isAuthenticated = true;
        
        // 사용자 상세 정보 로드
        await this.fetchPlayerDetail();
        
        // 로그인 성공 후 대시보드로 이동
        router.push('/dashboard');
        return true;
      } catch (error) {
        // 오류 처리
        console.error('로그인 실패:', error);
        this.error = error.response?.data?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
        this.isAuthenticated = false;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 회원가입 처리
     * @param {string} nickname - 사용자 닉네임
     * @param {string} password - 사용자 비밀번호
     * @param {number} money - 초기 자금
     * @returns {Promise<boolean>} 회원가입 성공 여부
     */
    async signUp(nickname, password, money) {
      this.loading = true;
      this.error = null;
      
      try {
        // 회원가입 API 호출
        await authApi.signUp({ nickname, password, money });
        return true;
      } catch (error) {
        // 오류 처리
        console.error('회원가입 실패:', error);
        this.error = error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 사용자 상세 정보 조회
     * @returns {Promise<void>}
     */
    async fetchPlayerDetail() {
      if (!this.player?.id) {
        console.warn('사용자 ID가 없어 상세 정보를 조회할 수 없습니다.');
        return;
      }
      
      this.loading = true;
      
      try {
        // 사용자 상세 정보 API 호출
        const response = await authApi.getPlayerDetail(this.player.id);
        
        if (response && response.data) {
          // 사용자 정보 업데이트
          this.player = {
            ...this.player,
            ...response.data
          };
          
          // 업데이트된 사용자 정보 저장
          sessionStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
        } else {
          console.warn('사용자 상세 정보 없음:', response);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        this.error = '사용자 정보를 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 사용자 자금 정보 업데이트
     * @returns {Promise<void>}
     */
    async updatePlayerMoney() {
      if (!this.player?.id) return;
      
      try {
        // 자금 정보 API 호출
        const response = await authApi.getPlayerMoney(this.player.id);
        
        if (response && response.data !== undefined) {
          // 사용자 정보의 자금 업데이트
          this.player = {
            ...this.player,
            money: response.data
          };
          
          // 업데이트된 사용자 정보 저장
          sessionStorage.setItem(PLAYER_KEY, JSON.stringify(this.player));
        }
      } catch (error) {
        console.error('자금 정보 조회 실패:', error);
        this.error = '자금 정보를 불러오는데 실패했습니다.';
      }
    },
    
    /**
     * 자금 추가
     * @param {number} amount - 추가할 금액
     * @returns {Promise<boolean>} 자금 추가 성공 여부
     */
    async addMoney(amount) {
      if (!this.player?.id || !amount || amount <= 0) return false;
      
      try {
        // 자금 추가 API 호출
        await authApi.addPlayerMoney(this.player.id, amount);
        
        // 자금 정보 갱신
        await this.updatePlayerMoney();
        return true;
      } catch (error) {
        console.error('자금 추가 실패:', error);
        this.error = '자금 추가에 실패했습니다.';
        return false;
      }
    },
    
    /**
     * 로컬 스토리지에서 사용자 정보 로드
     */
    loadPlayerFromStorage() {
      // 세션 스토리지에서 토큰 확인
      const token = sessionStorage.getItem(TOKEN_KEY);
      
      // 토큰이 없으면 로그아웃 상태로 설정
      if (!token) {
        this.isAuthenticated = false;
        this.player = null;
        return;
      }
      
      // 세션 스토리지에서 사용자 정보 로드
      const storedPlayer = sessionStorage.getItem(PLAYER_KEY);
      
      if (storedPlayer) {
        try {
          this.player = JSON.parse(storedPlayer);
          this.isAuthenticated = true;
        } catch (e) {
          console.error('저장된 사용자 정보 파싱 실패:', e);
          this.isAuthenticated = false;
          this.player = null;
          this.clearStorage();
        }
      } else {
        this.isAuthenticated = false;
        this.player = null;
      }
    },
    
    /**
     * 스토리지 데이터 초기화
     */
    clearStorage() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(PLAYER_KEY);
    },
    
    /**
     * 로그아웃 처리
     */
    logout() {
      // 인증 상태 초기화
      this.player = null;
      this.isAuthenticated = false;
      
      // 스토리지 데이터 초기화
      this.clearStorage();
      
      // 로그인 페이지로 이동
      router.push('/login');
    }
  }
});