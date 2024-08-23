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
  data() {
    return {
      userInfo: {},
      accessToken: null,
    };
  },
  methods: {
    fetchUserInfo() {
      const urlParams = new URLSearchParams(window.location.search);
      this.accessToken = urlParams.get('accessToken') || localStorage.getItem('accessToken');
      if (!this.accessToken) {
        this.$router.push('/'); 
        return;
      }

      localStorage.setItem('accessToken', this.accessToken);

      axios.get('http://localhost:5000/api/userinfo', {
        withCredentials: true, 
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })
      .then(response => {
        this.userInfo = response.data.properties; 

        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('nickname', response.data.properties.nickname);
      })
      .catch(error => {
        console.error('사용자 정보 불러오기 실패:', error);
      });
    },
    logout() {
      const params = new URLSearchParams();
      params.append('accessToken', this.accessToken);

      axios.post('http://localhost:5000/api/logout', params)
      .then(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('nickname');
          this.accessToken = null;
          this.$router.push('/');
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