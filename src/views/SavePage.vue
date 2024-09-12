<template>
  <div class="main-container">
    <p class="largeTitle">SAVE & SHARE</p>
    <div class="content-container">
      <div class="image-frame">
        <img :src="imageUrl" alt="Saved Image" class="saved-image" />
      </div>
      <div class="right-panel">
        <div class="visibility-options">
          <p class="middleTitle">공개 여부</p>
          <div class="buttons-container">
            <button @click="setVisibility(true)" :class="{active: isPublic}">공개</button>
            <button @click="setVisibility(false)" :class="{active: !isPublic}">비공개</button>
          </div>
        </div>
        <div class="memo-section">
          <p class="middleTitle">메모 남기기</p>
          <textarea v-model="memo"></textarea>
        </div>
      </div>
    </div>
    <div class="center">
      <button @click="saveCompletePhoto" class="btn-large">저장하기</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SavePage',
  props: ['roomSession', 'userId'],
  data() {
    return {
      imageUrl: decodeURIComponent(this.$route.params.imageUrl || ''),
      isPublic: true,
      memo: ''
    };
  },
  methods: {
    setVisibility(isPublic) {
      this.isPublic = isPublic;
    },
    async saveCompletePhoto() {
      const payload = {
        isPublic: this.isPublic ? 'true' : 'false',
        note: this.memo
      };
      try {
        await axios.post(`${process.env.VUE_APP_BACKEND_URL}/photo/final?roomSession=${this.roomSession}`, payload);
        alert('사진이 성공적으로 저장되었습니다!');
        this.$router.push({ name: 'Home' });
      } catch (error) {
        alert('사진 저장 중 오류가 발생했습니다.');
        console.error('Error:', error);
      }
    }
  }
};
</script>

<style>
.main-container {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
}

.content-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  margin-top: 20px;
}

.image-frame {
  margin-right: 180px;
  margin-top: 30px;
}

.saved-image {
  position: relative;
  width: 600px;
  height: 800px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.right-panel {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.visibility-options,
.memo-section {
  width: 100%;
  margin-bottom: 20px;
}

.buttons-container {
  display: flex;
  gap: 30px; 
}

.visibility-options button {
  padding: 10px 20px;
  border: 1px solid #DB574D;
  background-color: transparent;
  color: #DB574D;
  cursor: pointer;
  border-radius: 5px;
  flex: 1;
  text-align: center;
}

.visibility-options button.active {
  background-color: #DB574D;
  color: white;
}

textarea {
  width: 100%;
  height: 150px; 
  padding: 10px;
  border: 1px solid #DB574D;
  border-radius: 6px;
  resize: none;
  box-sizing: border-box;
}
</style>
