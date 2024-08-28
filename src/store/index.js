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
    setAccessToken(state, token) {
      state.accessToken = token;
      localStorage.setItem('accessToken', token);
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
  
      // 사용자 아이디와 닉네임을 로컬 스토리지에 저장
      localStorage.setItem('userId', userInfo.id);
      localStorage.setItem('nickname', userInfo.nickname);
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
        commit('setUserInfo', response.data.properties);
      })
      .catch(error => {
        console.error('사용자 정보 불러오기 실패:', error);
      });
    },
  }
});
