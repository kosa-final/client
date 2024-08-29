<template>
    <div class="mypage-container">
      <h2>My Page</h2>
      <p>환영합니다, {{ userInfo.nickname }}님</p>
  
      <button @click="showConfirmModal = true" class="delete-button">회원 탈퇴</button>
  
      <!-- 탈퇴 확인 모달 -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal">
           <p class="confirm-text">정말 <span class="highlight">탈퇴</span>하시겠습니까?</p> <!-- 클래스 추가 -->
           <div class="modal-actions">
              <button @click="confirmDelete" class="confirm-button">네</button>
              <button @click="showConfirmModal = false" class="cancel-button">아니오</button>
           </div>
        </div>
      </div>

      <!-- 탈퇴 완료 모달 -->
      <div v-if="showCompletionModal" class="modal-overlay">
        <div class="modal">
           <p class="completion-text">
                회원 <span class="highlight">탈퇴</span>가 완료되었습니다.
           </p> 
        </div>
      </div>
    </div>
</template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        showConfirmModal: false, // 탈퇴 확인 모달 표시 여부
        showCompletionModal: false, // 탈퇴 완료 모달 표시 여부
      };
    },
    computed: {
      userInfo() {
        console.log(this.$store.state.userInfo); // 콘솔에 출력하여 userInfo 확인
        return this.$store.state.userInfo;
      },
      accessToken() {
        return this.$store.state.accessToken;
      }
    },
    methods: {
      confirmDelete() {
        axios.post('http://localhost:8080/api/kakao/deactivate', {}, {
          withCredentials: true // 세션 쿠키를 포함하도록 설정
        })
        .then(() => {
          this.showConfirmModal = false; // 확인 모달 닫기
          this.showCompletionModal = true; // 완료 모달 열기
          this.$store.commit('logout'); // Vuex의 logout mutation 호출
  
          // 2초 후 메인페이지로 자동 이동
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
        })
        .catch(error => {
          console.error('회원 탈퇴 실패:', error);
          alert("회원 탈퇴 중 오류가 발생했습니다.");
        });
      }
    },
    mounted() {
    if (!this.accessToken) {
        alert("로그인이 필요합니다.");
        this.$router.push('/login');
    } else if (!this.userInfo || !this.userInfo.nickname) {
        // 로컬 스토리지에서 데이터 복원
        const storedUserInfo = {
            id: localStorage.getItem('userId'),
            properties: {
                nickname: localStorage.getItem('nickname')
            }
        };
        this.$store.commit('setUserInfo', storedUserInfo);
    }
    }
  }
  </script>
  
  <style scoped>
  .mypage-container {
    padding: 20px;
    max-width: 600px;
    margin: auto;
  }
  
  h2 {
    color: #DB574D;
  }
  
  .delete-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: DB574D;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  /* 모달 스타일 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal {
    background-color: #EEEDEE;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 300px; /* 모달의 너비 설정 */
    height: 200px; /* 모달의 높이 설정 */
  }

  .modal p {
    font-size: 22px; /* 글씨 크기 설정 */
    margin-top: 40px; /* 아래쪽 마진 설정 */
  }
/* 탈퇴 확인 텍스트 스타일 */
  .confirm-text {
    font-size: 18px; /* 기본 크기 */
    color: #333;
    margin-bottom: 20px;
  }

/* 탈퇴 완료 텍스트 스타일 */
  .completion-text {
    font-size: 22px; /* 더 큰 크기 */
    font-weight: bold; /* 굵은 텍스트 */
    color: #333; /* 텍스트 색상 */
    margin-bottom: 30px; /* 하단 여백 */
  }

  .highlight {
    color: DB574D; /* 빨간색 텍스트 */
  }

  .modal-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
  
  /* 기본 버튼 스타일 */
  .confirm-button,
  .cancel-button {
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
  }
  
  /* 네 버튼 기본 상태: 투명 배경에 빨간색 텍스트 */
  .confirm-button {
    background-color: transparent;
    color: DB574D;
    margin-top: 50px;
    font-size: 18px;
  }
  
  /* 아니오 버튼 기본 상태: 투명 배경에 빨간색 텍스트 */
  .cancel-button {
    background-color: transparent;
    color: DB574D;
    margin-top: 50px;
    font-size: 18px;
  }
  
  /* 마우스를 올렸을 때 네 버튼 스타일 */
  .confirm-button:hover {
    background-color: DB574D;
    color: white;
  }
  
  /* 마우스를 올렸을 때 아니오 버튼 스타일 */
  .cancel-button:hover {
    color: white;
    background-color: DB574D;
  }
  </style>
  