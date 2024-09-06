<template>
    <div class="picture-detail-page">
      <h2 class="page-title">PICTURE</h2>
      <div class="picture-detail-container">
        <div class="left-side">
          <!-- 사진이 있는 부분 -->
          <img :src="photoDetail.COMPLETE_PHOTO" alt="Detail Photo" class="photo-image" />
        </div>
        <div class="right-side">
          <!-- 사진과 관련된 정보들 -->
          <p class="photo-date">{{ formatDate(photoDetail.CREATED_AT) }}</p>
          <p class="photo-name">{{ photoDetail.ROOM_NAME }}</p>
          <p class="photo-description">{{ photoDetail.NOTE || '메모가 없습니다.' }}</p>
          <div class="like-section">
            <button @click="toggleLike" :class="{ liked: isLiked }">
              <span v-if="isLiked">♥</span>
              <span v-else>♡</span>
            </button>
            <span class="like-count">{{ likesCount }}</span>
          </div>
          <!-- 댓글 섹션 -->
          <div class="comment-section">
            <p>댓글</p>
            <div class="comments" v-for="(comment, index) in comments" :key="index">
              <p class="comment-user">{{ comment.nickname }}</p>
              <p class="comment-content">{{ comment.content }}</p>
              <p class="comment-date">{{ formatDate(comment.date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        photoDetail: {}, // 사진 상세 정보를 저장할 객체
        isLiked: false, // 좋아요 여부
        likesCount: 0,  // 좋아요 수
        comments: [ // 더미 댓글 데이터
          { nickname: '닉네임', content: '너무 보기 좋아요오오', date: '2024-08-15' },
          { nickname: '닉네임2', content: '굿굿', date: '2024-08-26' }
        ]
      };
    },
    methods: {
      fetchPhotoDetail(photoId) {
        axios.get(`${process.env.VUE_APP_BACKEND_URL}/api/community/${photoId}`)
          .then(response => {
            console.log(response.data);  // 데이터를 확인합니다.
            this.photoDetail = response.data;
          })
          .catch(error => {
            console.error('사진 정보를 불러오지 못했습니다.', error);
          });
      },
      toggleLike() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('로그인이 필요합니다.');
          return;
        }
  
        axios.post(`${process.env.VUE_APP_BACKEND_URL}/api/like/${this.$route.params.photoId}`, { userId })
          .then(() => {
            this.isLiked = !this.isLiked;
            this.likesCount += this.isLiked ? 1 : -1;
          })
          .catch(error => {
            console.error('좋아요 상태를 변경하지 못했습니다.', error);
          });
      },
      // 날짜 포맷팅 함수
      formatDate(dateString) {
        if (!dateString) {
          return 'N/A';  // 날짜가 없을 때 처리
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'N/A';  // 유효하지 않은 날짜일 경우
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');  // 월을 2자리로 표시
        const day = String(date.getDate()).padStart(2, '0');  // 일을 2자리로 표시

        return `${year}-${month}-${day}`;  // YYYY-MM-DD 형식으로 반환
      }
    },
    mounted() {
      const photoId = this.$route.params.photoId;
      if (photoId) {
        this.fetchPhotoDetail(photoId);
      } else {
        console.error('photoId is not defined');
      }
    }
  };
  </script>
  
  <style scoped>
  /* 전체 페이지 스타일 */
  .picture-detail-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
  }
  
  /* 제목 스타일 */
  .page-title {
    font-size: 35px;
    color: #DB574D;
    text-align: center;
    margin-bottom: 50px;
  }
  
  /* 메인 컨테이너 Flexbox 적용 */
  .picture-detail-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 50px;
    max-width: 1200px;
  }
  
  /* 왼쪽 사진 부분 */
  .left-side {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: -250px; /* 사진을 왼쪽으로 50px 이동 */
  }
  
  .photo-image {
    width: auto;
    height: 650px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* 오른쪽 정보 부분 */
  .right-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 100px;
    margin-top: 100px;
  }
  
  .photo-date {
    font-size: 25px;
    color: #666;
    margin: 5px 0;
  }

  .photo-name {
    font-size: 18px;
    color: #DB574D;
    margin: 5px 0;
  }
  
  .photo-description {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }
  
  .like-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 30px;
    color: #DB574D;
  }
  
  button.liked {
    color: red;
  }
  
  .like-count {
    font-size: 24px;
    margin-left: 10px;
  }
  
  .comment-section {
    margin-top: 20px;
  }
  
  .comments {
    margin-bottom: 10px;
  }
  
  .comment-user {
    font-weight: bold;
    color: #DB574D;
  }
  
  .comment-content {
    font-size: 16px;
    margin: 5px 0;
  }
  
  .comment-date {
    font-size: 14px;
    color: #666;
  }
  </style>
