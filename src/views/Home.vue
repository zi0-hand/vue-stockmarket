<template>
  <div class="app-container">
    <!-- 왼쪽 기능 소개 섹션 -->
    <div class="left-side">
      <div class="background-pattern"></div>
      <div class="left-content">
        <h1 class="app-logo">주식 시뮬레이션</h1>
        <h2 class="app-slogan">실제 투자 경험을 가상으로 체험하세요</h2>
        <p class="app-description">
          리스크 없이 주식 투자를 연습하고, 시장 감각을 키워보세요.
          가상 자금으로 실제 주식 시장과 유사한 환경에서 투자 전략을 테스트해볼 수 있습니다.
        </p>
        
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span class="feature-text">실시간 시장 시뮬레이션</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💰</span>
            <span class="feature-text">가상 자금으로 안전한 투자 연습</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span class="feature-text">포트폴리오 관리 및 성과 분석</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔍</span>
            <span class="feature-text">다양한 주식 정보 검색 및 비교</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 오른쪽 인증 섹션 -->
    <div class="right-side">
      <div class="auth-container">
        <div class="auth-header">
          <h1 class="auth-title">환영합니다</h1>
          <p class="auth-subtitle">계정에 로그인하고 투자를 시작하세요</p>
        </div>
        
        <div class="tab-container">
          <div class="tab" :class="{ 'active': activeTab === 'login' }" @click="activeTab = 'login'">로그인</div>
          <div class="tab" :class="{ 'active': activeTab === 'signup' }" @click="activeTab = 'signup'">회원가입</div>
        </div>
        
        <!-- 로그인 폼 -->
        <div v-if="activeTab === 'login'" class="auth-form">
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label" for="loginNickname">아이디</label>
              <input 
                type="text" 
                class="form-input" 
                id="loginNickname" 
                v-model="loginForm.nickname" 
                placeholder="아이디를 입력하세요"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="loginPassword">비밀번호</label>
              <input 
                type="password" 
                class="form-input" 
                id="loginPassword" 
                v-model="loginForm.password" 
                placeholder="비밀번호를 입력하세요"
                required
              >
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                로그인 중...
              </span>
              <span v-else>로그인</span>
            </button>
          </form>
          
          <div class="form-footer">
            계정이 없으신가요? <a class="form-link" @click.prevent="activeTab = 'signup'">회원가입</a>
          </div>
        </div>
        
        <!-- 회원가입 폼 -->
        <div v-if="activeTab === 'signup'" class="auth-form">
          <form @submit.prevent="handleSignUp">
            <div class="form-group">
              <label class="form-label" for="signupNickname">아이디</label>
              <input 
                type="text" 
                class="form-input" 
                id="signupNickname" 
                v-model="signupForm.nickname" 
                placeholder="사용할 아이디를 입력하세요"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="signupPassword">비밀번호</label>
              <input 
                type="password" 
                class="form-input" 
                id="signupPassword" 
                v-model="signupForm.password" 
                placeholder="비밀번호를 입력하세요"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="signupMoney">초기 자금</label>
              <input 
                type="number" 
                class="form-input" 
                id="signupMoney" 
                v-model="signupForm.money" 
                min="1000000"
                max="100000000"
                required
              >
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                가입 중...
              </span>
              <span v-else>회원가입</span>
            </button>
          </form>
          
          <div class="form-footer">
            이미 계정이 있으신가요? <a class="form-link" @click.prevent="activeTab = 'login'">로그인</a>
          </div>
        </div>
        
        <!-- 오류 메시지 -->
        <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const activeTab = ref('login');
    const isSubmitting = ref(false);
    const errorMessage = ref('');
    
    const loginForm = reactive({
      nickname: '',
      password: ''
    });
    
    const signupForm = reactive({
      nickname: '',
      password: '',
      money: 10000000
    });
    
    const handleLogin = async () => {
      errorMessage.value = '';
      isSubmitting.value = true;
      
      try {
        const success = await authStore.login(loginForm.nickname, loginForm.password);
        
        if (success) {
          router.push('/dashboard');
        }
      } catch (error) {
        errorMessage.value = error.message || '로그인에 실패했습니다.';
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const handleSignUp = async () => {
      errorMessage.value = '';
      isSubmitting.value = true;
      
      try {
        const success = await authStore.signUp(
          signupForm.nickname, 
          signupForm.password, 
          signupForm.money
        );
        
        if (success) {
          // 회원가입 성공 시 로그인 탭으로 이동
          activeTab.value = 'login';
          // 닉네임 복사
          loginForm.nickname = signupForm.nickname;
          loginForm.password = '';
          
          // 메시지로 알림
          alert('회원가입이 완료되었습니다. 로그인해주세요.');
        }
      } catch (error) {
        errorMessage.value = error.message || '회원가입에 실패했습니다.';
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      activeTab,
      loginForm,
      signupForm,
      isSubmitting,
      errorMessage,
      handleLogin,
      handleSignUp
    };
  }
}
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif;
}

.app-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}

/* 왼쪽 소개 영역 스타일 */
.left-side {
  background-color: var(--primary-blue);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%);
  z-index: 0;
}

.left-content {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
  max-width: 500px;
}

.app-logo {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.app-slogan {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.4;
}

.app-description {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.85;
  margin-bottom: 40px;
  line-height: 1.6;
}

.feature-list {
  text-align: left;
  margin-bottom: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.feature-icon {
  margin-right: 12px;
  font-size: 20px;
}

.feature-text {
  font-size: 16px;
  font-weight: 500;
}

/* 오른쪽 로그인 영역 스타일 */
.right-side {
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--secondary-text);
}

.tab-container {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  padding: 12px 16px;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  font-weight: 500;
  color: var(--secondary-text);
}

.tab.active {
  color: var(--primary-blue);
  font-weight: 600;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-blue);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  background-color: var(--background-gray);
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background-color: var(--white);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: var(--white);
}

.btn-primary:hover {
  background-color: #2b74df;
}

.btn-primary:disabled {
  background-color: #bfc7d4;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  color: var(--secondary-text);
  font-size: 14px;
}

.form-link {
  color: var(--primary-blue);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.form-link:hover {
  text-decoration: underline;
}

.auth-form {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 반응형 디자인 */
@media (max-width: 992px) {
  .app-container {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }
  
  .left-side {
    min-height: 500px;
  }
  
  .right-side {
    padding: 3rem 1.5rem;
  }
}

@media (max-width: 576px) {
  .left-side {
    padding: 2rem 1rem;
    min-height: 400px;
  }
  
  .feature-list {
    text-align: center;
  }
  
  .feature-item {
    flex-direction: column;
    align-items: center;
  }
  
  .feature-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>