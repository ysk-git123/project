import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
  state: {
    currentContent: '',
    userInfo: null,
    theme: 'light',
    sidebarOpen: true,
    isLoggedIn: false,
    accessToken: '', // 访问令牌
    refreshToken: '', // 刷新令牌
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
    login(state, { accessToken, refreshToken, userInfo }) {
      state.isLoggedIn = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.userInfo = userInfo;
    },
    updateTokens(state, { accessToken, refreshToken }) {
      state.accessToken = accessToken;
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
    },
    logout(state) {
      state.isLoggedIn = false;
      state.accessToken = '';
      state.refreshToken = '';
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
        'currentContent',
        'isLoggedIn',
        'accessToken',
        'refreshToken',
      ],
    }),
  ],
});
