import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
  state: {
    currentContent: '',
    userInfo: null,
    theme: 'light',
    sidebarOpen: true,
    isLoggedIn: false,
    token: '',
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
    login(state, token) {
      state.isLoggedIn = true;
      state.token = token;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = '';
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
        'token',
      ],
    }),
  ],
});
