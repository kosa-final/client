<template>
  <div class="login-container">
    <div class="login-text">SNS 간편 로그인</div>
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
    const redirectUri = 'http://localhost:8080/api/kakao/callback';
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    console.log("Kakao 로그인 페이지로 이동:", kakaoAuthUrl);
    window.location.href = kakaoAuthUrl;
  },
  checkLogin() {
    console.log("checkLogin 메서드 호출됨");
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    console.log("받은 코드:", code);

      if (code) {
        axios.get(`/api/kakao/callback?code=${code}`)
          .then(response => {
            console.log("로그인 응답:", response);
            this.accessToken = response.data.accessToken;
            if (this.accessToken) {
              console.log("저장된 accessToken:", this.accessToken);
              localStorage.setItem('accessToken', this.accessToken);
              this.$router.push('/profile');
            } else {
              console.error("로그인 실패: accessToken이 없음");
            }
          })
          .catch(error => {
            console.error('로그인 실패:', error);
          });
      }
    }
  },
  mounted() {
    console.log("LoginCompo 컴포넌트가 마운트됨");
    const storedToken = localStorage.getItem('accessToken');
    console.log("로컬 스토리지에서 가져온 accessToken:", storedToken);

    if (storedToken) {
      this.accessToken = storedToken;
      this.$router.push('/profile');
    } else {
      console.log("로컬 스토리지에 accessToken이 없음, checkLogin 호출");
      this.checkLogin();
    }
  }
}
</script>


<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-text {
  margin-bottom: 20px;
  margin-right:300px;
  font-size: 24px;
  font-weight: bold;
  color:808080;
}

.kakao-login-button {
  width: 500px;
  height: 75px;
  background-image: url('@/assets/kakao_login_large_wide.png');
  background-size: cover;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  margin-bottom: 200px;
}
</style>
