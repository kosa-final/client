<template>
  <div class="main-container">
    <div class="largeTitle">DECORATING ROOM</div>
    <div id="drawing-picture" class="drawing-container">
      <div class="canvas-container">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="right-panel">
        <div class="tools">
          <h2>펜 색상</h2>
          <div class="color-tools">
            <div v-for="color in colors" :key="color" :style="{ backgroundColor: color }" class="color-field" @click="changeColor(color)"></div>
            <input type="color" v-model="drawColor" class="color-picker" />
            <input type="range" v-model="drawWidth" min="1" max="100" class="pen-range" />
          </div>
          <h2>스티커</h2>
          <div class="stickers">
            <img v-for="sticker in stickers" :key="sticker" :src="sticker" draggable="true" @dragstart="dragStart" class="sticker-image" />
          </div>
          <button @click="clearCanvas" class="btn-rounded">초기화</button>
          <button @click="undoLast" class="btn-rounded">되돌리기</button>
        </div>									   
      </div>
    </div>
        <!-- 저장 버튼 -->
        <div class="center">
      <button class="btn-large" @click="saveCanvas">사진 전송하기</button>
    </div>	 
  </div>
</template>

<script>
import axios from "axios";
import alien from "@/assets/sticker/alien.png";
import butterfly from "@/assets/sticker/butterfly.png";
import fireworks from "@/assets/sticker/fireworks.png";
import havefun from "@/assets/sticker/havefun.png";
import heart from "@/assets/sticker/heart.png";
import rainbow from "@/assets/sticker/rainbow.png";
import ribbon from "@/assets/sticker/ribbon.png";
import smile from "@/assets/sticker/smile.png";
import star from "@/assets/sticker/star.png";
import sunglass from "@/assets/sticker/sunglass.png";

export default {
  name: 'EditPage2',
  props: ['roomSession'],
  data() {
    return {
      isDrawing: false,
      context: null,
      lastX: 0,
      lastY: 0,
      drawColor: '#000000',
      drawWidth: 5,
      colors: ["#FF0000", "#FFFF00", "#0000FF", "#FF00FF", "#FFFFFF", "#000000"],
      stickers: [alien, butterfly, havefun, smile, heart, fireworks, rainbow, ribbon, star, sunglass],
      draggingSticker: null,
      restoreArray: [],
      index: -1,
      roomInfo: null, // 방 정보 저장
      photoImageUrl: null,  // S3에서 가져올 이미지 URL
    };
  },
  async created() {
    // 닉네임 설정
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      this.localUserNickname = storedNickname;
    } else {
      console.error('로컬 저장소에 닉네임이 없습니다!');
    }
    await this.fetchRoomInfo();
    this.initializeCanvas();  // 방 정보 불러온 후 캔버스 초기화
  },
  methods: {
    // 방 정보를 서버에서 가져오는 메서드
    async fetchRoomInfo() {
      try {
        const response = await axios.get('http://localhost:8080/photo/info', {
          params: { roomSession: this.roomSession }
        });
        this.roomInfo = response.data;
        this.photoImageUrl = this.roomInfo.originPhoto;
        if (!this.photoImageUrl) {
          console.error('S3 이미지 URL이 없습니다.');
        }
      } catch (error) {
        console.error('방 정보 가져오기 실패:', error);
      }
    },
    // 캔버스를 초기화하는 메서드
    initializeCanvas() {
      const canvas = this.$refs.canvas;
      this.context = canvas.getContext('2d');
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;

      if (this.photoImageUrl) {
        const image = new Image();
        image.crossOrigin = "Anonymous"; // CORS 설정
        image.src = this.photoImageUrl;

        image.onload = () => {
          this.context.drawImage(image, 0, 0, canvas.width, canvas.height);
          this.saveState(); // 이미지를 불러온 후 상태 저장
        };

        image.onerror = (error) => {
          console.error("이미지 로드 실패:", error);
        };
      }

      // 마우스 이벤트 리스너 추가
      canvas.addEventListener('mousedown', this.startDrawing);
      canvas.addEventListener('mousemove', this.draw);
      canvas.addEventListener('mouseup', this.stopDrawing);
      canvas.addEventListener('mouseout', this.stopDrawing);

      // 스티커 드래그 앤 드롭 이벤트 리스너 추가
      canvas.addEventListener("dragover", this.allowDrop);
      canvas.addEventListener("drop", this.dropSticker);
    },
    startDrawing(event) {
      this.isDrawing = true;
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    },
    draw(event) {
      if (!this.isDrawing) return;

      const currentX = event.offsetX;
      const currentY = event.offsetY;

      this.context.strokeStyle = this.drawColor;
      this.context.lineWidth = this.drawWidth;
      this.context.lineJoin = 'round';
      this.context.lineCap = 'round';

      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.context.lineTo(currentX, currentY);
      this.context.stroke();

      this.lastX = currentX;
      this.lastY = currentY;

      this.saveState(); // 드로잉 후 상태 저장
    },
    stopDrawing() {
      this.isDrawing = false;
    },
    changeColor(color) {
      this.drawColor = color;
    },
    clearCanvas() {
      this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.restoreArray = [];
      this.index = -1;

      // 초기 이미지를 다시 로드
      this.initializeCanvas();
    },
    undoLast() {
      if (this.index <= 0) {
        this.clearCanvas();
      } else {
        this.index -= 1;
        this.context.putImageData(this.restoreArray[this.index], 0, 0);
      }
    },
    saveState() {
      this.restoreArray.push(this.context.getImageData(0, 0, this.$refs.canvas.width, this.$refs.canvas.height));
      this.index += 1;
    },
    dragStart(event) {
      this.draggingSticker = event.target;
    },
    allowDrop(event) {
      event.preventDefault();
    },
    dropSticker(event) {
      event.preventDefault();
      const x = event.offsetX;
      const y = event.offsetY;

      const sticker = new Image();
      sticker.src = this.draggingSticker.src;
      sticker.onload = () => {
        this.context.drawImage(sticker, x, y, 100, 100);
        this.saveState(); // 스티커 붙인 후 상태 저장
      };
    },
    async saveCanvas() {
      const canvas = this.$refs.canvas;  // this.$refs.canvas로 캔버스 참조
    if (!canvas) {
      console.error('Canvas element is not defined');
      return;
    }

    const imageBase64 = canvas.toDataURL('image/png');  // 캔버스를 base64로 변환
    const photoData = {
      originPhoto: imageBase64,
      roomId: this.roomInfo.roomId
    };
  try {
    const response = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/photo/complete?roomSession=${this.roomSession}`, photoData, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 모든 사용자에게 페이지 이동 메시지 전송
    this.webSocket.send(JSON.stringify({
      type: 'PHOTO_SAVED',
      imageUrl: response.data
    }));

    const currentRoute = this.$route.fullPath;
    const targetRoute = `/save/${this.roomSession}`;

    // 중복된 경로로 이동하지 않도록 처리
    if (currentRoute !== targetRoute) {
      this.$router.push({
        name: 'Save',
        params: { 
          roomSession: this.roomSession, 
          imageUrl: encodeURIComponent(response.data), 
          userId: this.userId 
        }
      });
    }
    
  } catch (error) {
    console.error('Error uploading image to S3:', error.response ? error.response.data : error.message);
  }
},
  },
};
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.drawing-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  margin-top: 20px;
}

.canvas-container {
  margin-right: 180px;
}

.right-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tools {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-tools {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-field {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.color-picker {
  width: 50px;
  height: 40px;
}

.pen-range {
  width: 150px;
}

.stickers {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sticker-image {
  width: 50px;
  height: 50px;
  cursor: move;
}
</style>
