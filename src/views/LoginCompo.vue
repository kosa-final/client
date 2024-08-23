<template>
  <div>
    <button v-if="!accessToken" @click="loginWithKakao" class="kakao-login-button"></button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      accessToken: null,
    };
  },
  methods: {
    loginWithKakao() {
      const clientId = 'fa48f38c035cc445070338897bcbb504';
      const redirectUri = 'http://localhost:5000/api/kakao/callback';
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
      window.location.href = kakaoAuthUrl;
    },
    checkLogin() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        axios.get(`/api/kakao/callback?code=${code}`)
          .then(response => {
            this.accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', this.accessToken);
            this.$router.push('/profile');
          })
          .catch(error => {
            console.error('로그인 실패:', error);
          });
      }
    }
  },
  mounted() {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      this.accessToken = storedToken;
      this.$router.push('/profile');
    } else {
      this.checkLogin();
    }
  }
}
</script>

<style scoped>
.kakao-login-button {
  width: 300px;
  height: 75px;
  background-image: url('@/assets/kakao_login_medium_narrow.png');
  background-size: cover;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
}
</style>