import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/css/global.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 核心：注册全局事件总线
app.config.globalProperties.$bus = app

// 先注册所有图标（必须在 use(ElementPlus) 之前）
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 再注册 ElementPlus 和路由
app.use(ElementPlus, { locale: zhCn })
app.use(router)

// 最后挂载
app.mount('#app')