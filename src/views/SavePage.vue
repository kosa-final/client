<template>
    <div class="save-page-container">
      <h2 class="title">SAVE & SHARE</h2>
      <div class="content-container">
        <div class="image-frame">
          <img :src="imageUrl" alt="Saved Image" class="saved-image" />
        </div>
        <div class="save-share-panel">
          <div class="visibility-options">
            <span class="label">공개 여부</span>
            <div class="buttons-container">
              <button :disabled="!isHost" @click="setVisibility(true)" :class="{active: isPublic}">공개</button>
              <button :disabled="!isHost" @click="setVisibility(false)" :class="{active: !isPublic}">비공개</button>
            </div>
          </div>
          <div class="memo-section">
            <span class="label">메모 남기기</span>
            <textarea v-model="memo" :disabled="!isHost"></textarea>
          </div>
          <div class="sns-share">
            <span class="label">SNS 공유 {{ isHost }}</span>
            <!-- SNS 공유 아이콘 추가 -->
          </div>
        </div>
      </div>
      <button v-if="isHost" @click="saveCompletePhoto" class="btn-large">저장하기</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import _ from 'lodash'; // lodash의 debounce를 사용
  
  export default {
  name: 'SavePage',
  props: ['roomSession', 'userId'],
  data() {
    return {
      imageUrl: decodeURIComponent(this.$route.params.imageUrl || ''),
      isPublic: true,
      memo: '',
      isHost: this.$route.params.isHost === true || this.$route.params.isHost === 'true',
      webSocket: null,
      sessionId: this.$route.params.sessionId || null, // sessionId 받아오기
      broadcastDebounced: _.debounce(this.broadcastChanges, 500) // 500ms 딜레이 후 전송
    };
  },
  watch: {
    isPublic() {
      this.broadcastDebounced();
    },
    memo() {
      this.broadcastDebounced();
    }
  },
  created() {
  console.log('isHost in SavePage:', this.$route.params.isHost);
},
  methods: {
    // 공개 여부 설정
    setVisibility(isPublic) {
      this.isPublic = isPublic;
    },

    // WebSocket을 통해 변경 사항 전송
    broadcastChanges() {
  console.log("브로드 캐스팅", this.sessionId);
  if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
    const payload = {
      type: 'UPDATE_SAVE_PAGE',
      isPublic: this.isPublic,
      memo: this.memo,
      sessionId: this.sessionId
    };
    console.log('Broadcasting changes: ', payload); // 로그로 확인
    this.webSocket.send(JSON.stringify(payload));
  }
}

,

listenForUpdates() {
  this.webSocket.onmessage = (message) => {
    console.log('WebSocket 메시지 수신:', message.data); // 수신된 메시지 로그 확인
    const data = JSON.parse(message.data);

    if (data.type === 'UPDATE_SAVE_PAGE') {
      console.log('UPDATE_SAVE_PAGE 메시지 수신:', data);
      if (data.sessionId !== this.sessionId) {
        this.isPublic = data.isPublic;
        this.memo = data.memo;
        console.log('공개 여부 및 메모 업데이트:', this.isPublic, this.memo);
      }
    }
  };

  this.webSocket.onerror = (error) => {
    console.error("WebSocket 오류:", error);
  };

  this.webSocket.onclose = () => {
    console.warn("WebSocket 연결이 닫힘");
  };
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
    },
    initializeWebSocket() {
  this.webSocket = new WebSocket(`ws://localhost:8080/ws/save?roomSession=${encodeURIComponent(this.roomSession)}&sessionId=${encodeURIComponent(this.sessionId)}`);
  
  this.webSocket.onopen = () => {
    console.log("WebSocket 연결 성공");
    this.broadcastChanges(); // 연결 후 상태 전송
  };

  this.webSocket.onclose = () => {
    console.warn("WebSocket 연결이 닫힘, 재연결 시도...");
    setTimeout(() => {
      this.initializeWebSocket();  
    }, 1000); // 끊어진 경우 재연결 시도
  };

  this.webSocket.onerror = (error) => {
    console.error("WebSocket 오류 발생:", error);
  };

  this.listenForUpdates();  // WebSocket 수신 대기
}
  },


}


  </script>
  

<style>
.save-page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    font-family: Arial, sans-serif;
    gap: 20px;
}

.title {
    color: #DB574D;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
}

.content-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 100px; /* 이미지와 공유 패널 간의 간격 */
}

.image-frame {
    width: 500px;
    height: 600px;
    background-color: #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    /* 상단에 다른 요소와 일직선 맞추기 위해 flex-start로 설정 */
    align-self: flex-start;
}

.saved-image {
    max-width: 100%;
    max-height: 100%;
}

.save-share-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    max-width: 300px;
}

.visibility-options,
.memo-section,
.sns-share {
    width: 100%;
    margin-bottom: 20px;
}

.label {
    margin-top: 30px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
    display: inline-block;
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

.sns-share {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.home-button {
    padding: 10px 40px;
    background-color: #DB574D;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    margin-top: 20px;
}
</style>
  