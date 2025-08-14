import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
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
    login(state, { userInfo }) {
      state.isLoggedIn = true;
      state.userInfo = userInfo;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
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
