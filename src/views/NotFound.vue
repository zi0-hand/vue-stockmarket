<template>
    <div class="not-found">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">페이지를 찾을 수 없습니다</h1>
        <p class="error-message">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div class="error-actions">
          <router-link to="/dashboard" class="btn btn-primary">
            대시보드로 이동
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound'
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 2rem;
  }
  
  .not-found-content {
    text-align: center;
    max-width: 500px;
  }
  
  .error-code {
    font-size: 8rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  .error-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .error-message {
    color: var(--secondary-color);
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  .error-actions {
    display: flex;
    justify-content: center;
  }
  </style>