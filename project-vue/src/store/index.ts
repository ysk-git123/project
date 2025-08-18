import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

// 定义状态接口
interface State {
  currentContent: string;
  theme: string;
  sidebarOpen: boolean;
  isLoggedIn: boolean;
  userInfo: { [key: string]: unknown } | null;
}

export default createStore<State>({
  state: {
    currentContent: '',
    userInfo: null,
    theme: 'light',
    sidebarOpen: true,
    isLoggedIn: false,
    // 移除token存储，只保留用户信息
  },
  mutations: {
    setCurrentContent(state, content: string) {
      state.currentContent = content;
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    login(state, payload) {
      state.isLoggedIn = payload.isLoggedIn !== undefined ? payload.isLoggedIn : true;
      state.userInfo = payload.userInfo || null;
      console.log('Store updated:', state);
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      key: 'my-app-vuex-state',
      storage: window.localStorage,
      paths: [
        'currentContent',
        'userInfo',
        'theme',
        'sidebarOpen',
        'isLoggedIn',
      ],
    }),
  ],
});
