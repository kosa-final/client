<template>
    <div class="picture-detail-container">
      <h2>PICTURE</h2>
      <div class="photo-detail">
        <img :src="photoDetail.COMPLETE_PHOTO" alt="Detail Photo" class="photo-image" />
      </div>
      <div class="photo-info">
        <p>{{ photoDetail.note || '사진 설명이 없습니다.' }}</p>
        <p>{{ formatDate(photoDetail.CREATED_AT) }}</p>
        <button @click="toggleLike" :class="{ liked: isLiked }">
          <span v-if="isLiked">♥</span>
          <span v-else>♡</span>
          {{ likesCount }}
        </button>
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
      };
    },
    methods: {
      fetchPhotoDetail(photoId) {
        axios.get(`http://localhost:8080/api/photo/${photoId}`)
          .then(response => {
            this.photoDetail = response.data;
          })
          .catch(error => {
            console.error('사진 정보를 불러오지 못했습니다.', error);
          });
      },
      fetchLikeStatus(photoId) {
        axios.get(`http://localhost:8080/api/like/${photoId}`)
          .then(response => {
            this.likesCount = response.data.likesCount;
            this.isLiked = response.data.isLiked;
          })
          .catch(error => {
            console.error('좋아요 수를 불러오지 못했습니다.', error);
          });
      },
      toggleLike() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('로그인이 필요합니다.');
          return;
        }
  
        axios.post(`http://localhost:8080/api/like/${this.$route.params.photoId}`, { userId })
        .then(response => {
            // 만약 response에서 반환된 값을 사용하지 않으면 아래 코드로 대체 가능합니다.
            console.log(response.data);  // response를 사용하여 출력해볼 수 있음

            this.isLiked = !this.isLiked;
            this.likesCount += this.isLiked ? 1 : -1;
        })
        .catch(error => {
            console.error('좋아요 상태를 변경하지 못했습니다.', error);
        });
      },
      formatDate(dateString) {
        if (!dateString) return '날짜 정보 없음';
        const date = new Date(dateString);
        return date.toLocaleDateString();
      }
    },
    mounted() {
      const photoId = this.$route.params.photoId;  // 대소문자가 일치하는지 확인
      
      if (photoId) {
        this.fetchPhotoDetail(photoId);
        this.fetchLikeStatus(photoId);
      } else {
        console.error('photoId is not defined');
      }
    }
  };
  </script>
  
  <style scoped>
  .picture-detail-container {
    padding: 20px;
    max-width: 800px;
    margin: auto;
  }
  
  h2 {
    color: #DB574D;
    text-align: center;
    font-size: 35px;
    margin-bottom: 20px;
  }
  
  .photo-detail {
    text-align: center;
  }
  
  .photo-image {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .photo-info {
    text-align: center;
    margin-top: 20px;
  }
  
  .photo-info p {
    font-size: 18px;
    color: #333;
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: #DB574D;
  }
  
  button.liked {
    color: red;
  }
  </style>
  