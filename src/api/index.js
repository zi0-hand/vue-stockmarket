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
    return response;
  },
  error => {
    // 요청 취소 에러는 따로 처리
    if (axios.isCancel(error)) {
      console.log('요청이 취소되었습니다.');
      return Promise.reject(error);
    }
    
    // 네트워크 에러 처리
    if (!error.response) {
      console.error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      return Promise.reject(new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'));
    }
    
    // 오류 상태코드별 처리
    switch (error.response.status) {
      case 400:
        console.error('잘못된 요청입니다:', error.response.data?.message || '요청 데이터를 확인해주세요.');
        break;
      case 401:
        console.warn('인증이 만료되었습니다. 다시 로그인해주세요.');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('player_data');
        window.location.href = '/login';
        break;
      case 403:
        console.error('접근 권한이 없습니다.');
        break;
      case 404:
        console.error('요청한 리소스를 찾을 수 없습니다.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        console.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
      default:
        console.error(`API 오류 (${error.response.status}):`, error.response.data?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;