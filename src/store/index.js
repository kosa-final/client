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
    // accessToken을 저장하는 mutation 추가
    setAccessToken(state, token) {
      state.accessToken = token;
      localStorage.setItem('accessToken', token); // 로컬 스토리지에 저장
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
  
      // 사용자 정보가 구조적으로 올바른지 확인
      const userId = userInfo.id || userInfo.userid || null;
      const nickname = userInfo.nickname || userInfo.properties?.nickname || null;
  
      // 사용자 아이디와 닉네임을 로컬 스토리지에 저장
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      if (nickname) {
        localStorage.setItem('nickname', nickname);
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
        commit('setUserInfo', response.data); // 사용자 정보 저장
      })
      .catch(error => {
        console.error('사용자 정보 불러오기 실패:', error);
      });
    },
  },
});
