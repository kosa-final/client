<template>
    <div class="mypage-container">
      <h2>My Page</h2>
      <!--<p>환영합니다, {{ userInfo.nickname }}님</p>-->
  
      <div v-if="photos.length > 0" class="photo-list">
        <div v-for="photo in photos" :key="photo.photo_id" class="photo-item">
          <div class="left-content">
            <img :src="photo.complete_photo" alt="photo" class="photo-image">
            <div class="photo-info">
              <p class="room-name">{{ photo.room_name }}</p>
              <p class="note">{{ photo.note || '메모' }}</p>
            </div>
          </div>
          <div class="right-content">
            <p class="user-count">총 4명</p>
            <p class="create-date">{{ formatDate(photo.create_date) }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>사진이 없습니다.</p>
      </div>
  
      <button @click="showConfirmModal = true" class="delete-button">회원 탈퇴</button>
  
      <!-- 탈퇴 확인 모달 -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal">
           <p class="confirm-text">정말 <span class="highlight">탈퇴</span>하시겠습니까?</p>
           <div class="modal-actions">
              <button @click="confirmDelete" class="confirm-button">네</button>
              <button @click="showConfirmModal = false" class="cancel-button">아니오</button>
           </div>
        </div>
      </div>
  
      <!-- 탈퇴 완료 모달 -->
      <div v-if="showCompletionModal" class="modal-overlay">
        <div class="modal">
           <p class="completion-text">회원 <span class="highlight">탈퇴</span>가 완료되었습니다.</p>
        </div>
      </div>
    </div>
</template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        showConfirmModal: false,
        showCompletionModal: false,
        photos: [], // 사진 목록을 저장할 배열
      };
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo;
      },
      accessToken() {
        return this.$store.state.accessToken;
      }
    },
    methods: {
      fetchUserPhotos() {
        axios.get('http://localhost:8080/api/photolist', { withCredentials: true })
          .then(response => {
            this.photos = response.data; // 서버에서 받은 사진 데이터를 저장
          })
          .catch(error => {
            console.error('사진 목록 불러오기 실패:', error);
          });
      },
      formatDate(dateString) {
        if (!dateString) {
            return 'Invalid Date';
        }
        
        const parts = dateString.split('/');
        if (parts.length !== 3) {
            return 'Invalid Date';
        }

        const formattedDate = `20${parts[2]}-${parts[1]}-${parts[0]}`; // '23/08/29' -> '2023-08-29'
        const date = new Date(formattedDate);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
        },


      confirmDelete() {
        axios.post('http://localhost:8080/api/kakao/deactivate', {}, {
          withCredentials: true
        })
        .then(() => {
          this.showConfirmModal = false;
          this.showCompletionModal = true;
          this.$store.commit('logout');
  
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
      } else {
          this.fetchUserPhotos(); // 마운트 시 사용자 사진 데이터를 불러옴
      }
    }
  }
  </script>
  
  <style scoped>
  .mypage-container {
    padding: 20px;
    max-width: 800px;
    margin: auto;
  }
  
  h2 {
    color: #DB574D;
    text-align: center;
  }
  
  .photo-list {
    margin-top: 20px;
  }
  
  .photo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
  }
  
  .left-content {
    display: flex;
    align-items: center;
  }
  
  .photo-image {
    width: 100px;
    height: 100px;
    margin-right: 15px;
    object-fit: cover;
  }
  
  .photo-info {
    display: flex;
    flex-direction: column;
  }
  
  .room-name {
    font-weight: bold;
    font-size: 16px;
  }
  
  .note {
    font-size: 14px;
    color: #666;
  }
  
  .right-content {
    text-align: right;
  }
  
  .user-count {
    font-size: 14px;
    margin-bottom: 5px;
    color: #333;
  }
  
  .create-date {
    font-size: 24px;
    color: #DB574D;
  }
  
  .delete-button {
    display: block;
    width: 150px;
    margin: 30px auto;
    padding: 10px 20px;
    background-color: #DB574D;
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
    color: #DB574D; /* 빨간색 텍스트 */
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
    color: #DB574D;
    margin-top: 50px;
    font-size: 18px;
  }
  
  /* 아니오 버튼 기본 상태: 투명 배경에 빨간색 텍스트 */
  .cancel-button {
    background-color: transparent;
    color: #DB574D;
    margin-top: 50px;
    font-size: 18px;
  }
  
  /* 마우스를 올렸을 때 네 버튼 스타일 */
  .confirm-button:hover {
    background-color: #DB574D;
    color: white;
  }
  
  /* 마우스를 올렸을 때 아니오 버튼 스타일 */
  .cancel-button:hover {
    color: white;
    background-color: #DB574D;
  }
  </style>