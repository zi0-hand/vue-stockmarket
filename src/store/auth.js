import { defineStore } from 'pinia';
import { authApi } from '@/api/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    player: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.player,
    playerName: (state) => state.player?.nickname || '',
    playerMoney: (state) => state.player?.money || 0,
    playerId: (state) => state.player?.id || null
  },
  
  actions: {
    async login(nickname, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authApi.login({ nickname, password });

        // 로그인 성공 시 플레이어 정보 조회
        const playerDetailResponse = await authApi.getPlayerDetail(response.data.id);
        this.player = playerDetailResponse.data;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('player', JSON.stringify(this.player));
        
        router.push('/dashboard');
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || '로그인에 실패했습니다.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async signUp(nickname, password, money) {
      this.loading = true;
      this.error = null;
      
      try {
        await authApi.signUp({ nickname, password, money });
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || '회원가입에 실패했습니다.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchPlayerDetail() {
      if (!this.player?.id) return;
      
      this.loading = true;
      
      try {
        const response = await authApi.getPlayerDetail(this.player.id);
        this.player = response.data;
        localStorage.setItem('player', JSON.stringify(this.player));
      } catch (error) {
        console.error('플레이어 정보 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updatePlayerMoney() {
      if (!this.player?.id) return;
      
      try {
        const response = await authApi.getPlayerMoney(this.player.id);
        if (this.player) {
          this.player.money = response.data;
          localStorage.setItem('player', JSON.stringify(this.player));
        }
      } catch (error) {
        console.error('자금 정보 조회 실패:', error);
      }
    },
    
    loadPlayerFromStorage() {
      const storedPlayer = localStorage.getItem('player');
      if (storedPlayer) {
        this.player = JSON.parse(storedPlayer);
      }
    },
    
    logout() {
      this.player = null;
      localStorage.removeItem('player');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }
});