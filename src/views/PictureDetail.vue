<template>
    <div class="picture-detail-page">
      <h2 class="page-title">PICTURE</h2>
      <div class="picture-detail-container">
        <div class="left-side">
          <img :src="photoDetail.COMPLETE_PHOTO" alt="Detail Photo" class="photo-image" />
        </div>
        <div class="right-side">
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
            <div class="comment-header">
              <h3>댓글</h3>
              <!-- 더보기/접기 버튼 (드롭다운 형식) -->
              <button v-if="comments.length > 5" @click="toggleComments" class="dropdown-toggle">
                <span v-if="showAllComments">▲</span>
                <span v-else>▼</span>
              </button>
            </div>
            <ul class="comment-list">
              <li v-for="comment in visibleComments" :key="comment.commentId" class="comment-item">
                <div class="comment-content">
                  <strong>{{ comment.nickname }}</strong>: {{ comment.content }}
                </div>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </li>
            </ul>
  
            <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
            <button @click="addComment">댓글 등록</button>
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
        photoDetail: {}, // 사진 상세 정보
        isLiked: false, // 좋아요 상태
        likesCount: 0, // 좋아요 개수
        comments: [], // 댓글 목록
        newComment: '', // 새 댓글
        showAllComments: false, // 댓글을 모두 보여줄지 여부
      };
    },
    computed: {
      visibleComments() {
        // 댓글을 5개만 보여주고, showAllComments가 true이면 모든 댓글을 보여줌
        return this.showAllComments ? this.comments : this.comments.slice(0, 5);
      },
    },
    methods: {
      // 사진 상세 정보 및 좋아요 상태 불러오기
      fetchPhotoDetail(photoId) {
        axios.get(`${process.env.VUE_APP_BACKEND_URL}/api/community/${photoId}`)
          .then(response => {
            console.log(response.data);  // 데이터를 확인합니다.

            this.photoDetail = response.data;
  
            // 좋아요 수 불러오기
            axios
              .get(`http://localhost:8080/api/like/${photoId}`)
              .then((res) => {
                this.likesCount = res.data;
              })
              .catch((error) => {
                console.error('좋아요 수를 불러오지 못했습니다.', error);
              });
  
            const userId = localStorage.getItem('userId');
            if (userId) {
              axios
                .get(`http://localhost:8080/api/like/${photoId}/is-liked`, {
                  params: { userId },
                })
                .then((res) => {
                  this.isLiked = res.data;
                })
                .catch((error) => {
                  console.error('좋아요 여부 확인 중 오류가 발생했습니다.', error);
                });
            }
  
            // 댓글 불러오기
            this.fetchComments(photoId);
          })
          .catch((error) => {
            console.error('사진 정보를 불러오지 못했습니다.', error);
          });
      },
  
      // 댓글 불러오기
      fetchComments(photoId) {
        axios
          .get(`http://localhost:8080/api/comments/${photoId}`)
          .then((response) => {
            console.log('Fetched comments data:', response.data);
  
            // 댓글을 createdAt 필드를 기준으로 정렬 (오래된 순)
            this.comments = response.data.sort((a, b) => {
              return new Date(a.createdAt) - new Date(b.createdAt);
            });
          })
          .catch((error) => {
            console.error('댓글을 불러오는 중 오류가 발생했습니다.', error);
          });
      },
  
      // 댓글 등록
      addComment() {
        if (!this.newComment.trim()) {
          alert('댓글을 입력하세요.');
          return;
        }
  
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('로그인이 필요합니다.');
          return;
        }
  
        const comment = {
          userId: userId,
          photoId: this.$route.params.photoId,
          content: this.newComment,
          createdAt: new Date().toISOString(),
        };
  
        axios
          .post('http://localhost:8080/api/comments', comment)
          .then(() => {
            this.fetchComments(this.$route.params.photoId); // 새로 댓글 목록 가져오기
            this.newComment = ''; // 입력 필드 초기화
          })
          .catch((error) => {
            console.error('댓글 등록에 실패했습니다.', error);
          });
      },
  
      // 더보기/접기 버튼 동작 (드롭다운 형식)
      toggleComments() {
        this.showAllComments = !this.showAllComments;
      },
  
      // 좋아요 토글
      toggleLike() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('로그인이 필요합니다.');
          return;
        }
  

        axios.post(`${process.env.VUE_APP_BACKEND_URL}/api/like/${this.$route.params.photoId}`, { userId })

          .then(() => {
            if (this.isLiked) {
              this.likesCount -= 1;
            } else {
              this.likesCount += 1;
            }
            this.isLiked = !this.isLiked;
          })
          .catch((error) => {
            console.error('좋아요 상태 변경에 실패했습니다.', error);
          });
      },
  
      // 날짜 포맷팅
      formatDate(dateString) {
        if (!dateString || dateString === 'null') {
          return 'N/A'; // null 또는 'null' 문자열일 경우 N/A로 처리
        }
  
        const date = new Date(dateString); // 전달된 문자열을 Date 객체로 변환
  
        if (isNaN(date.getTime())) {
          // 만약 잘못된 날짜 값이면 N/A 반환
          return 'N/A';
        }
  
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // 'YYYY-MM-DD' 형식으로 반환
      },
    },
  
    mounted() {
      const photoId = this.$route.params.photoId;
      if (photoId) {
        console.log('Mounted is triggered. Fetching comments...');
        this.fetchPhotoDetail(photoId);
      } else {
        console.error('photoId가 정의되지 않았습니다.');
      }
    },
  };
  </script>
  
  <style scoped>
  .picture-detail-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
  }
  
  .page-title {
    font-size: 35px;
    color: #db574d;
    text-align: center;
    margin-bottom: 50px;
  }
  
  .picture-detail-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 50px;
    max-width: 1200px;
  }
  
  .left-side {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: -250px;
  }
  
  .photo-image {
    width: auto;
    height: 650px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
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
    color: #db574d;
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
    color: #db574d;
  }
  
  button.liked {
    color: red;
    font-size: 36px;
  }
  
  .like-count {
    font-size: 24px;
    margin-left: 10px;
  }
  
  .comment-section {
    margin-top: 20px;
  }
  
  .comment-section textarea {
    width: 300px;
    height: 80px;
    margin-bottom: 10px;
    padding: 10px;
  }
  
  .comment-section button {
    background-color: #db574d;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
  }
  
  .comment-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .comment-item {
    display: flex;
    justify-content: space-between; /* 닉네임/댓글과 날짜를 양쪽으로 배치 */
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #e0e0e0; /* 댓글 아이템 간 구분선 추가 */
    margin-bottom: 10px;
  }
  
  .comment-content {
    font-size: 16px;
    color: #333;
  }
  
  .comment-date {
    font-size: 14px;
    color: #999;
    margin-left: 20px;
  }
  
/* 드롭다운 버튼 스타일 */
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.dropdown-toggle {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
  background-color: #EEEDEE;
}
</style>
  