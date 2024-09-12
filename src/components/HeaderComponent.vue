<template>
  <header class="header">
    <nav>
      <div class="left-section">
        <a class="logo" href="/">4CutStudio</a>
        <div class="menu">
          <router-link to="/select">사진촬영</router-link>
          <router-link to="/community">커뮤니티</router-link>
        </div>
      </div>
      <div class="right-section">
        <button v-if="isLoggedIn" @click="logoutUser" class="btn logout">LOGOUT</button>
        <router-link v-if="isLoggedIn" to="/mypage">
          <button class="btn">MY PAGE</button>
        </router-link>
        <router-link v-else to="/login">
          <button class="btn">LOGIN</button>
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'HeaderComponent',
  computed: {
    ...mapState(['accessToken', 'userInfo']),
    isLoggedIn() {
      return !!this.accessToken; // accessToken이 존재하면 로그인 상태로 간주
    }
  },
  methods: {
    logoutUser() {
      this.$store.commit('logout'); // Vuex의 logout 메서드 호출
      
      if (this.$route.path !== '/') {
        this.$router.push('/'); // 현재 경로가 '/'가 아닌 경우에만 리다이렉트
      }
    }
  },
  watch: {
    accessToken(newValue) {
      // accessToken이 변경될 때 컴포넌트를 강제로 다시 렌더링
      if (newValue) {
        this.$forceUpdate();
      }
    }
  }
};
</script>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
}

.left-section {
  display: flex;
  align-items: center;
}

.menu {
  margin-left: 32px;
}

.menu a {
  margin-right: 20px;
  text-decoration: none;
  color: #DB574D;
  font-weight: 500;
  font-size: 23px;
  position: relative;
  display: inline-block;
}
.menu a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #DB574D;
  visibility: hidden;
  transform: scaleX(0);
  transition: all 0.3s ease-in-out;
}

.menu a:hover::after {
  visibility: visible;
  transform: scaleX(1);
}

.logo {
  font-size: 32px;
  text-decoration: none;
  color: black;
}

.right-section {
  display: flex;
  align-items: center;
}

.btn {
  margin: 0 15px;
  font-size: 20px;
  padding: 11px 25px; /* 상하 10px, 좌우 20px */
}

.logout {
  color: #DB574D; /* 글자 색상 */
  background-color: white; /* 배경색 흰색 */
  border: 1px solid #DB574D; /* 테두리 색상과 굵기 */
}

.logout:hover {
  background-color: #DB574D; /* 마우스 오버 시 배경색 변경 */
  color: white; /* 마우스 오버 시 글자 색상 변경 */
}

.btn:not(.logout):hover {
  background-color: white; /* 일반 버튼의 마우스 오버 시 배경색 변경 */
  color: #DB574D; /* 일반 버튼의 마우스 오버 시 글자 색상 변경 */
}

</style>
