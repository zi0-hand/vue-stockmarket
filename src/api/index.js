// api/index.js
/**
 * API 클라이언트 설정
 * Axios 인스턴스 생성 및 인터셉터 설정
 */
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 토큰 키 상수
const TOKEN_KEY = 'auth_token';

/**
 * API 요청에 사용할 axios 인스턴스 생성
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 타임아웃 설정
  timeout: 10000,
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  config => {
    // 세션 스토리지에서 토큰 가져오기
    const token = sessionStorage.getItem(TOKEN_KEY);
    
    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 요청 에러 처리
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  response => {
    // 성공적인 응답 처리
    return response;
  },
  error => {
    // 인증 오류 (401) 처리
    if (error.response && error.response.status === 401) {
      console.warn('인증이 만료되었습니다. 다시 로그인해주세요.');
      // 세션 스토리지에서 인증 정보 제거
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('player_data');
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    
    // 서버 오류 (500) 처리
    else if (error.response && error.response.status >= 500) {
      console.error('서버 오류가 발생했습니다:', error.response.status);
    }
    
    // 기타 오류 처리
    else {
      console.error('API 요청 실패:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;