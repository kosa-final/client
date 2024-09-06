<template>
    <div class="community-container">
      <h2>COMMUNITY</h2>
      <p class="sort-options">
        <span @click="sortByDate" :class="{ active: sortType === 'date' }">최신순</span> /
        <span @click="sortByPopularity" :class="{ active: sortType === 'popularity' }">인기순</span>
      </p>
      <div class="photo-grid">
        <div v-for="photo in sortedPhotos" :key="photo.PHOTO_ID" class="photo-item" @click="goToDetail(photo.PHOTO_ID)">
          <img :src="photo.COMPLETE_PHOTO" alt="Community Photo" class="photo-image" />
          <p>{{ photo.room_name }}</p>
        </div>
      </div>
      <div class="pagination">
        <span @click="changePage(currentPage - 1)" :class="{ disabled: currentPage === 1 }" class="arrow">‹</span>
        <button
          v-for="page in paginationRange"
          :key="page"
          @click="changePage(page)"
          :disabled="page === currentPage"
        >
          {{ page }}
        </button>
        <span @click="changePage(currentPage + 1)" :class="{ disabled: currentPage === totalPages }" class="arrow">›</span>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        photos: [],
        sortType: 'date',
        currentPage: 1,
        photosPerPage: 12,
        totalPhotos: 0,
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.totalPhotos / this.photosPerPage);
      },
      sortedPhotos() {
        let sorted = [...this.photos];
        if (this.sortType === 'popularity') {
          sorted.sort((a, b) => b.user_count - a.user_count);
        } else {
          sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted.slice((this.currentPage - 1) * this.photosPerPage, this.currentPage * this.photosPerPage);
      },
      paginationRange() {
        const rangeSize = 5;
        let start = Math.max(this.currentPage - Math.floor(rangeSize / 2), 1);
        let end = Math.min(start + rangeSize - 1, this.totalPages);
  
        if (end - start < rangeSize - 1) {
          start = Math.max(end - rangeSize + 1, 1);
        }
  
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    },
    methods: {
      fetchCommunityPhotos() {
        axios.get(`${process.env.VUE_APP_BACKEND_URL}/api/community`)
          .then(response => {
            this.photos = response.data;
            this.totalPhotos = this.photos.length;
          })
          .catch(error => {
            console.error('커뮤니티 사진 불러오기 실패:', error);
          });
      },
      sortByDate() {
        this.sortType = 'date';
      },
      sortByPopularity() {
        this.sortType = 'popularity';
      },
      changePage(page) {
        if (page > 0 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
      goToDetail(photoId) {
        this.$router.push({ name: 'PictureDetail', params: { photoId } });
      }
    },
    mounted() {
      this.fetchCommunityPhotos();
    }
  };
  </script>

  <style scoped>
  .community-container {
    padding: 20px;
    max-width: 1200px;
    margin: auto;
  }
  
  h2 {
    color: #DB574D;
    text-align: center;
    font-size: 35px;
    margin-bottom: 50px;
  }
  
  .sort-options {
    text-align: left;
    font-size: 18px;
    color: #666;
    margin-bottom: 50px;
  }
  
  .sort-options span {
    cursor: pointer;
  }
  
  .sort-options .active {
    color: #DB574D;
  }
  
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .photo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .photo-image {
    width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
  
  .photo-item p {
    margin-top: 10px;
    font-size: 16px;
    color: #333;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  
  .pagination button {
    background-color: #999;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 0 5px;
    cursor: pointer;
    font-size: 18px;
  }
  
  .pagination button:disabled {
    background-color: #DB574D;
    cursor: default;
  }
  
  .arrow {
    font-size: 24px; /* 화살표 크기를 키움 */
    margin: 0 15px; /* 버튼과의 간격 설정 */
    color: #999; /* 기본 상태 화살표 색상 */
    cursor: pointer;
  }
  
  .arrow.disabled {
    color: #ccc; /* 비활성화된 상태에서는 회색으로 표시 */
    cursor: default;
  }
  </style>
  