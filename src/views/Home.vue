<template>
    <div class="home-container">
      <div class="home-content">
        <div class="auth-section">
          <div class="auth-card">
            <div class="auth-header">
              <h1 class="auth-title">주식 시뮬레이션</h1>
              <p class="auth-subtitle">가상 자산으로 안전하게 투자를 경험해보세요</p>
            </div>
            
            <div class="nav-tabs">
              <button 
                class="nav-tab" 
                :class="{ 'active': activeTab === 'login' }" 
                @click="activeTab = 'login'"
              >
                로그인
              </button>
              <button 
                class="nav-tab" 
                :class="{ 'active': activeTab === 'signup' }" 
                @click="activeTab = 'signup'"
              >
                회원가입
              </button>
            </div>
            
            <!-- 로그인 폼 -->
            <div v-if="activeTab === 'login'" class="auth-form">
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="loginNickname" class="form-label">닉네임</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="loginNickname" 
                    v-model="loginForm.nickname" 
                    placeholder="닉네임을 입력하세요"
                    required
                  >
                </div>
                
                <div class="mb-4">
                  <label for="loginPassword" class="form-label">비밀번호</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="loginPassword" 
                    v-model="loginForm.password" 
                    placeholder="비밀번호를 입력하세요"
                    required
                  >
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    로그인 중...
                  </span>
                  <span v-else>로그인</span>
                </button>
              </form>
              
              <div class="mt-3 text-center">
                <small class="text-muted">
                  계정이 없으신가요? <a href="#" @click.prevent="activeTab = 'signup'">회원가입</a>
                </small>
              </div>
            </div>
            
            <!-- 회원가입 폼 -->
            <div v-if="activeTab === 'signup'" class="auth-form">
              <form @submit.prevent="handleSignUp">
                <div class="mb-3">
                  <label for="signupNickname" class="form-label">닉네임</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="signupNickname" 
                    v-model="signupForm.nickname" 
                    placeholder="사용할 닉네임을 입력하세요"
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="signupPassword" class="form-label">비밀번호</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="signupPassword" 
                    v-model="signupForm.password" 
                    placeholder="비밀번호를 입력하세요"
                    required
                  >
                </div>
                
                <div class="mb-4">
                  <label for="signupMoney" class="form-label">초기 자금</label>
                  <div class="input-group">
                    <span class="input-group-text">₩</span>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="signupMoney" 
                      v-model="signupForm.money" 
                      min="10000"
                      required
                    >
                  </div>
                  <small class="form-text text-muted">
                    시작할 초기 자금을 설정하세요
                  </small>
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    가입 중...
                  </span>
                  <span v-else>회원가입</span>
                </button>
              </form>
              
              <div class="mt-3 text-center">
                <small class="text-muted">
                  이미 계정이 있으신가요? <a href="#" @click.prevent="activeTab = 'login'">로그인</a>
                </small>
              </div>
            </div>
            
            <!-- 오류 메시지 -->
            <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
              {{ errorMessage }}
            </div>
          </div>
        </div>
        
        <div class="features-section">
          <div class="feature-header">
            <h2>실제 투자 경험을 안전하게</h2>
            <p>주식 시뮬레이션에서는 실제 손실 없이 투자를 연습하고 시장 감각을 키울 수 있습니다.</p>
          </div>
          
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="bi bi-graph-up"></i>
              </div>
              <h3>실시간 시장 시뮬레이션</h3>
              <p>실제 시장 환경과 유사한 변동성을 체험하고 다양한 시장 상황에 대응하는 연습을 할 수 있습니다.</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="bi bi-wallet2"></i>
              </div>
              <h3>가상 자금으로 안전한 투자</h3>
              <p>실제 돈을 사용하지 않고 가상 자금으로 다양한 투자 전략을 안전하게 테스트해 볼 수 있습니다.</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="bi bi-pie-chart"></i>
              </div>
              <h3>포트폴리오 분석</h3>
              <p>투자 결과를 다양한 지표와 차트로 분석하여 자신의 투자 성과를 객관적으로 평가할 수 있습니다.</p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="bi bi-clock-history"></i>
              </div>
              <h3>투자 기록 관리</h3>
              <p>모든 거래 내역이 기록되어 투자 패턴을 분석하고 더 나은 투자 결정을 내릴 수 있도록 도와줍니다.</p>
            </div>
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
  .home-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #e0f2fe, #f8fafc);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .home-content {
    display: flex;
    max-width: 1200px;
    width: 100%;
    background-color: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }
  
  .auth-section {
    flex: 0 0 40%;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .auth-card {
    width: 100%;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .auth-subtitle {
    color: var(--secondary-color);
    font-size: 1rem;
  }
  
  .nav-tabs {
    display: flex;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .nav-tab {
    flex: 1;
    padding: 0.75rem 0;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: var(--secondary-color);
    cursor: pointer;
    text-align: center;
    position: relative;
  }
  
  .nav-tab.active {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .nav-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-color);
  }
  
  .auth-form {
    margin-top: 1rem;
  }
  
  .form-label {
    font-weight: 500;
    color: var(--text-color);
  }
  
  .form-control {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background-color: var(--background-gray);
  }
  
  .form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
  
  .features-section {
    flex: 0 0 60%;
    background: linear-gradient(135deg, var(--primary-color), #2563eb);
    color: white;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .feature-header {
    margin-bottom: 2.5rem;
  }
  
  .feature-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .feature-header p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
  
  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 2rem;
  }
  
  .feature-item {
    padding: 1.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
  }
  
  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 0.75rem;
    background-color: rgba(255, 255, 255, 0.2);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  .feature-item h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  
  .feature-item p {
    font-size: 0.95rem;
    opacity: 0.9;
  }
  
  @media (max-width: 992px) {
    .home-content {
      flex-direction: column;
    }
    
    .auth-section, .features-section {
      flex: none;
      width: 100%;
    }
    
    .auth-section {
      order: 2;
    }
    
    .features-section {
      order: 1;
      padding: 2rem;
    }
    
    .feature-list {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 576px) {
    .home-container {
      padding: 1rem;
    }
    
    .auth-section, .features-section {
      padding: 1.5rem;
    }
  }
  </style>