<template>
  <div>
    <h2>로그인에 성공하였습니다!</h2>
    <p>환영합니다, {{ userInfo.nickname }}</p>
    <button @click="logout" class="logout-button">로그아웃</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    }
  },
  methods: {
    fetchUserInfo() {
      const storedToken = localStorage.getItem('accessToken');
      this.accessToken = new URLSearchParams(window.location.search).get('accessToken') || storedToken;

      if (!this.accessToken) {
        this.$router.push('/');
        return;
      }

      axios.get('http://localhost:8080/api/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        withCredentials: true,
      })
      .then(response => {
        // Vuex 상태 업데이트
        this.$store.commit('setUserInfo', response.data);

        // 로컬 스토리지에 사용자 정보를 저장
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('nickname', response.data.properties.nickname);
        localStorage.setItem('accessToken', this.accessToken);
      })
      .catch(error => {
        console.error('사용자 정보 불러오기 실패:', error);
      });
    },
    logout() {
      axios.post('http://localhost:8080/api/logout', new URLSearchParams({ accessToken: this.accessToken }))
      .then(() => {
        this.$store.commit('logout'); // Vuex의 logout mutation 호출
        this.$router.push('/'); // 로그아웃 후 메인페이지로 이동
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
      });
    }
  },
  mounted() {
    this.fetchUserInfo();
  }
}
</script>

<style scoped>
.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
