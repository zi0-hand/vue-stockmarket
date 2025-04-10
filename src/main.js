import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'                 
import 'bootstrap/dist/js/bootstrap.bundle'              
import 'bootstrap-icons/font/bootstrap-icons.css'       

const app = createApp(App).mount('#app')

app.use(router)
app.mount('#app')
