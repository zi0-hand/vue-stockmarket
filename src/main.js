import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'                 
import 'bootstrap/dist/js/bootstrap.bundle'              
import 'bootstrap-icons/font/bootstrap-icons.css'       

import { formatNumber, formatDateTime } from './utils/format'

const app = createApp(App)

// Pinia 스토어 설정
const pinia = createPinia()
app.use(pinia)

// Vue 라우터 설정
app.use(router)

// 전역 필터 (Vue 3에서는 전역 속성으로 사용)
app.config.globalProperties.$filters = {
    formatNumber,
    formatDateTime
}

// 앱 마운트
app.mount('#app')