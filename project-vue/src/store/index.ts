import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
  state: {
    currentContent: '',
  },
  mutations: {
    setCurrentContent(state, content: string) {
      state.currentContent = content;
    },
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      storage: window.localStorage,
      paths: ['currentContent'],
    }),
  ],
});
