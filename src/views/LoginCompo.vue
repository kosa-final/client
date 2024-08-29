<template>
  <div class="login-container">
    <div class="login-text">SNS 간편 로그인</div>
    <button v-if="!accessToken" @click="loginWithKakao" class="kakao-login-button"></button>
    <div v-else>
      <h2>로그인에 성공하였습니다!</h2>
      <p>환영합니다, {{ userInfo.nickname }}</p>
      <button @click="logout" class="logout-button">로그아웃</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      accessToken: localStorage.getItem('accessToken') || null,
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    }
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
              this.fetchUserInfo();  // 사용자 정보 가져오기
            } else {
              console.error("로그인 실패: accessToken이 없음");
            }
          })
          .catch(error => {
            console.error('로그인 실패:', error);
          });
      }
    },
    fetchUserInfo() {
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

        // 메인 페이지로 리다이렉트
        this.$router.push('/');
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
    console.log("LoginCompo 컴포넌트가 마운트됨");
    const storedToken = localStorage.getItem('accessToken');
    console.log("로컬 스토리지에서 가져온 accessToken:", storedToken);

    if (storedToken) {
      this.accessToken = storedToken;
      this.fetchUserInfo();  // 사용자 정보를 다시 불러옴
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

.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
