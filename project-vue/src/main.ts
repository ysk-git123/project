import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router/index';
import store from './store/index';

// 处理ResizeObserver错误（Element Plus已知问题）
const resizeObserverError = new Error('ResizeObserver loop completed with undelivered notifications.');
window.addEventListener('error', (e) => {
  if (e.message === resizeObserverError.message) {
    e.stopImmediatePropagation();
  }
});

const app = createApp(App);
app.use(router);
app.use(store);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.mount('#app');
