/**
 * 숫자를 통화 형식으로 변환하는 함수
 * @param {number} value - 변환할 숫자
 * @param {string} currency - 통화 단위 (기본값: '')
 * @returns {string} 변환된 통화 문자열
 */
export const formatNumber = (value, currency = '원') => {
    if (value === null || value === undefined) return '-';
    
    return value.toLocaleString('ko-KR') + currency;
  };
  
  /**
   * 날짜를 포맷팅하는 함수
   * @param {string|Date} dateValue - 변환할 날짜
   * @param {boolean} includeTime - 시간 포함 여부
   * @returns {string} 변환된 날짜 문자열
   */
  export const formatDateTime = (dateValue, includeTime = true) => {
    if (!dateValue) return '-';
    
    const date = new Date(dateValue);
    
    // 날짜 부분
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let result = `${year}-${month}-${day}`;
    
    // 시간 부분 (옵션)
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      result += ` ${hours}:${minutes}`;
    }
    
    return result;
  };
  
  /**
   * 수익률을 포맷팅하는 함수
   * @param {number} value - 변환할 수익률
   * @returns {string} 변환된 수익률 문자열 (+, - 표시 포함)
   */
  export const formatProfitRate = (value) => {
    if (value === null || value === undefined) return '-';
    
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  /**
   * 날짜를 상대적인 시간으로 표시하는 함수
   * @param {string|Date} dateValue - 변환할 날짜
   * @returns {string} 상대적인 시간 문자열
   */
  export const formatRelativeTime = (dateValue) => {
    if (!dateValue) return '-';
    
    const date = new Date(dateValue);
    const now = new Date();
    const diffMs = now - date;
    
    // 1분 이내
    if (diffMs < 60000) {
      return '방금 전';
    }
    
    // 1시간 이내
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes}분 전`;
    }
    
    // 24시간 이내
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours}시간 전`;
    }
    
    // 30일 이내
    if (diffMs < 2592000000) {
      const days = Math.floor(diffMs / 86400000);
      return `${days}일 전`;
    }
    
    // 그 이상은 날짜 형식으로 표시
    return formatDateTime(date, false);
  };