import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router/index';
import store from './store/index';
import { debounce } from './utils/debounce';

// 重写 ResizeObserver
const originalResizeObserver = window.ResizeObserver;
if (originalResizeObserver) {
  window.ResizeObserver = class extends originalResizeObserver {
    constructor(callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) {
      // 使用更短的延迟时间，并确保正确传递参数
      const debouncedCallback = debounce((entries, observer) => {
        try {
          callback(entries as ResizeObserverEntry[], observer as ResizeObserver);
        } catch (error) {
          console.error('ResizeObserver callback error:', error);
        }
      }, 30); // 缩短延迟时间到 30ms
      super(debouncedCallback);
    }
  };
}

const app = createApp(App);
app.use(router);
app.use(store);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.mount('#app');
