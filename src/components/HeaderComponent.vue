<template>
  <header class="header">
    <nav>
      <a class="logo" href="/">4CutStudio</a>
      <div>
        <router-link to="/community">
          <button class="btn">COMMUNITY</button>
        </router-link>
        <button v-if="isLoggedIn" @click="logoutUser" class="btn">LOGOUT</button>
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

.logo {
  font-size: 24px;
  text-decoration: none;
  color: #DB574D;
}

.btn {
  background-color: #DB574D;
  border: none;
  border-radius: 25px;
  text-align: center;
  padding: 7px 18px;
  color: white;
  font-size: 16px;
  margin-left: 1px;
}
</style>