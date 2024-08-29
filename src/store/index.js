import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accessToken: localStorage.getItem('accessToken') || null,
    userInfo: {},
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
  
      const userId = userInfo.id || userInfo.userid || null;
      const nickname = userInfo.nickname || userInfo.properties?.nickname || null;
  
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      if (nickname) {
        localStorage.setItem('nickname', nickname);
      }
    },
    setAccessToken(state, token) {
      state.accessToken = token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
    },
    logout(state) {
      state.accessToken = null;
      state.userInfo = {};
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('nickname');
    }
  },  
  actions: {
    fetchUserInfo({ commit, state }) {
      if (!state.accessToken) {
        return;
      }
      axios.get('http://localhost:8080/api/userinfo', {
        headers: {
          Authorization: `Bearer ${state.accessToken}`
        }
      })
      .then(response => {
        commit('setUserInfo', response.data);
        commit('setAccessToken', state.accessToken); // 상태에 확실히 커밋
      })
      .catch(error => {
        console.error('사용자 정보 불러오기 실패:', error);
      });
    },
  },
});
