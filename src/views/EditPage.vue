<template>
  <div class="main-container">
    <div class="largeTitle">DECORATING ROOM</div>
    <div id="drawing-picture" class="drawing-container">
      <div class="canvas-container">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="right-panel">
          <p class="middleTitle">꾸미기 순서</p>
            <div v-if="isMyTurn" class="output">{{ localUserNickname }}님의 차례입니다</div>
            <div v-else class="output">{{ currentTurnNickname }}님의 차례입니다</div>
          <p class="middleTitle">펜 색상</p>
          <div class="color-tools">
            <div v-for="color in colors" :key="color" :style="{ backgroundColor: color }" class="color-field" @click="changeColor(color)"></div>
          </div>
          <div class="color-tools">
            <input type="color" v-model="drawColor" class="color-picker" />
            <input type="range" v-model="drawWidth" min="1" max="100" class="pen-range" />
          </div>
          <p class="middleTitle">스티커</p>
          <div class="stickers">
            <img v-for="sticker in stickers" :key="sticker" :src="sticker" draggable="true" @dragstart="dragStart" class="sticker-image" />
          </div>
          <button @click="clearCanvas" class="btn-rounded">초기화</button>
          <button @click="undoLast" class="btn-rounded">되돌리기</button>

          <!-- 순서 넘기기 버튼, 마지막 차례가 아닌 경우에만 표시 -->
          <button v-if="isMyTurn && !isLastTurn" @click="passTurn" class="btn-rounded turnbtn">순서 넘기기</button>
        </div>
    </div>
        <div class="center">
          <!-- 마지막 차례일 때 사진 전송하기 버튼 표시 -->
          <button v-if="isMyTurn && isLastTurn" class="btn-large" @click="saveCanvas">사진 전송하기</button>
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
  name: 'EditPage',
  props: ['roomSession'],
  data() {
    return {
          // 기존 코드 유지
    canvasWidth: this.$route.query.canvasWidth || 600,  // 전달받은 canvasWidth가 없으면 기본값 600
    canvasHeight: this.$route.query.canvasHeight || 800,  // 전달받은 canvasHeight가 없으면 기본값 800
      // 드로잉 및 스티커 관련 상태 추가
      drawingActions: [],  // 드로잉 작업 저장
      stickerActions: [],  // 스티커 작업 저장
      undoStack: [],       // 되돌리기 스택
      redoStack: [],       // 다시 실행 스택
      canvas: null,
      context: null,
      drawColor: "#000000",
      drawWidth: 5,
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      colors: ["#FF0000", "#FFFF00", "#0000FF", "#FF00FF", "#FFFFFF", "#000000"],
      stickers: [alien, butterfly, havefun, smile, heart, fireworks, rainbow, ribbon,  star, sunglass],
      draggingSticker: null,
      roomInfo: {},
      webSocket: null,
      isLastTurn: false,
      isMyTurn: false,  
      currentTurnNickname: "",  
      localUserNickname: '', 
      restoreArray: [],  // 캔버스 상태를 저장하는 배열
      index: -1,  // 현재 상태 배열의 인덱스 
      isHost: this.$route.params.isHost
    };
  },
  created() {
    this.canvas.width = this.canvasWidth;
this.canvas.height = this.canvasHeight;

    console.log(this.$route.query.canvasWidth);  // 전달된 값 확인
console.log(this.$route.query.canvasHeight);

    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      this.localUserNickname = storedNickname;
      console.log('User Nickname from Local Storage: ', this.localUserNickname);
    } else {
      console.error('No userNickname found in local storage!');
    }
    this.isHost = this.$route.query.isHost === 'true'; 
    this.fetchRoomInfo().then(() => {
      this.initializeWebSocket();
    });
  },
  methods: {
    async fetchRoomInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/photo/info`, {
          params: { roomSession: this.roomSession }
        });
        this.roomInfo = response.data;

        if (this.roomInfo.originPhoto) {
          this.initializeCanvas();
        } else {
          console.error('Origin photo not found in roomInfo');
        }
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    },
    initializeWebSocket() {

      if (!this.localUserNickname) {
        console.error('Cannot establish WebSocket connection: userNickname is undefined.');
        return;
      }

      this.webSocket = new WebSocket(`ws://localhost:8080/ws/turn?nickname=${encodeURIComponent(this.localUserNickname)}`);

      this.webSocket.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === 'SESSION_ID') {
          this.userId = data.userId;
          console.log('Session ID received: ', this.userId);
        }

        if (data.type === 'DRAW') {
        console.log('Received DRAW event:', data);  // 로그 추가
        this.context.strokeStyle = data.color;
        this.context.lineWidth = data.width;
        this.context.beginPath();
        this.context.moveTo(data.fromX, data.fromY);
        this.context.lineTo(data.toX, data.toY);
        this.context.stroke();
        this.context.closePath();
        this.drawingActions.pop();
      }


        if (data.type === 'STICKER') {
          const sticker = new Image();
          sticker.src = data.stickerSrc;
          this.stickerActions.pop();
          sticker.onload = () => {
            this.context.drawImage(sticker, data.x, data.y, 100, 100);
          };
        }
        // PHOTO_SAVED 메시지 처리
        if (data.type === 'PHOTO_SAVED') {
          // 만약 현재 사용자가 사진 전송을 이미 한 사용자라면 이동하지 않도록 설정
          if (this.userId !== data.userId) { 
            console.log('PHOTO_SAVED 메시지 수신: ', data.imageUrl);
            this.$router.push({
              name: 'Save',
              params: { 
                roomSession: this.roomSession, 
                imageUrl: encodeURIComponent(data.imageUrl), 
                userId: this.userId ,
                isHost: this.isHost,  // 여기서 문자열로 변환하지 말고, boolean 값 그대로 전달
                sessionId: this.userId // 세션 ID를 전달

              }
            }).catch(err => {
              if (err.name !== 'NavigationDuplicated') {
                console.error(err);
              }
            });
          }
}
        if (data.type === 'TURN') {
        // Vue.set을 사용해 isMyTurn 상태를 동적으로 설정
        this.$set(this, 'isMyTurn', data.userId === this.userId);
        console.log('WebSocket TURN event: isMyTurn =', this.isMyTurn);
        this.currentTurnNickname = data.nickname;
        this.isLastTurn = data.isLastTurn; // 마지막 차례 여부 업데이트

        if (this.isMyTurn) {
          alert('그림을 그려주세요!');
          this.fixDrawing();
        }

        // 상태가 변경된 후 DOM 업데이트 보장
        this.$nextTick(() => {
          console.log('Next tick after TURN event: isMyTurn =', this.isMyTurn);
        });
      } else if (data.type === 'ERROR') {
        alert(data.message);
      }
    };
    },
    passTurn() {
    console.log('passTurn() 호출됨');
    if (this.isMyTurn) {
      this.fixDrawing();
      this.webSocket.send(JSON.stringify({ type: 'PASS_TURN' }));

      this.isMyTurn = false;  // 명시적으로 상태 변경

      this.$nextTick(() => {
        console.log("Next tick DOM 업데이트되었습니다. isMyTurn =", this.isMyTurn);
      });
    } else {
      alert('당신의 턴이 아닙니다!');
    }
  },

  initializeCanvas() {
  if (!this.roomInfo.originPhoto) {
    console.error('Cannot initialize canvas: originPhoto is undefined');
    return;
  }

  this.canvas = this.$refs.canvas;
  this.context = this.canvas.getContext("2d");
  // 캔버스 크기를 동적으로 설정
  this.canvas.width = this.canvasWidth;
  this.canvas.height = this.canvasHeight;

  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = this.roomInfo.originPhoto;

  image.onload = () => {
    this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
  };

  this.fixedDrawing = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

  this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
  this.canvas.addEventListener("mousemove", this.draw.bind(this));
  this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));

  this.canvas.addEventListener("mouseout", this.stopDrawing);
  this.canvas.addEventListener("touchstart", this.startDrawing);
  this.canvas.addEventListener("touchmove", this.draw);
  this.canvas.addEventListener("touchend", this.stopDrawing);

  this.canvas.addEventListener("dragover", this.allowDrop);
  this.canvas.addEventListener("drop", this.dropSticker);
},
    fixDrawing() {
      this.fixedDrawing = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height); // 다른 사용자 작업 고정
    },

    clearCanvas() {
      this.context.putImageData(this.fixedDrawing, 0, 0);  // 고정된 그림은 유지
      this.drawingActions = [];
      this.stickerActions = [];
      this.undoStack = [];

      // WebSocket으로 초기화 상태 전송
      this.webSocket.send(JSON.stringify({
        type: 'CLEAR',
      }));
    },

    changeColor(color) {
      this.drawColor = color;
    },
    startDrawing(event) {
      if (!this.isMyTurn) {
        alert('It is not your turn!');
        return;
      }
      this.isDrawing = true;
      this.lastX = event.clientX - this.canvas.offsetLeft;
      this.lastY = event.clientY - this.canvas.offsetTop;
      event.preventDefault();
    },
    draw(event) {
  if (!this.isDrawing) return;

  const currentX = event.clientX - this.canvas.offsetLeft;
  const currentY = event.clientY - this.canvas.offsetTop;

  this.context.strokeStyle = this.drawColor;
  this.context.lineWidth = this.drawWidth;
  this.context.beginPath();
  this.context.moveTo(this.lastX, this.lastY);
  this.context.lineTo(currentX, currentY);
  this.context.stroke();
  this.context.closePath();

  // 드로잉 작업을 저장
  this.drawingActions.push({
    type: 'DRAW',
    color: this.drawColor,
    width: this.drawWidth,
    fromX: this.lastX,
    fromY: this.lastY,
    toX: currentX,
    toY: currentY
  });
  this.undoStack.push('DRAW');

  // WebSocket으로 드로잉 상태 전송
  this.webSocket.send(JSON.stringify({
    type: 'DRAW',
    color: this.drawColor,
    width: this.drawWidth,
    fromX: this.lastX,
    fromY: this.lastY,
    toX: currentX,
    toY: currentY
  }));

  this.lastX = currentX;
  this.lastY = currentY;
},


undoLast() {
  if (this.drawingActions.length > 0 || this.stickerActions.length > 0) {
    const lastAction = this.undoStack.pop();

    if (lastAction === 'DRAW') {
      this.drawingActions.pop();  // 마지막 드로잉 작업을 제거
    } else if (lastAction === 'STICKER') {
      this.stickerActions.pop();  // 마지막 스티커 작업을 제거
    }

    // 캔버스를 고정된 이미지로 초기화
    this.context.putImageData(this.fixedDrawing, 0, 0);

    // 남은 작업들을 다시 그리기
    this.redrawCanvas();
    
    // WebSocket으로 되돌리기 상태 전송
    this.webSocket.send(JSON.stringify({
      type: 'UNDO_LAST'
    }));
  } else {
    alert('더 이상 되돌릴 작업이 없습니다.');
  }
},

    stopDrawing(event) {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      event.preventDefault();
    },
    async saveCanvas() {
    const imageBase64 = this.canvas.toDataURL('image/png');
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

    dragStart(event) {
      this.draggingSticker = event.target;
    },
    allowDrop(event) {
      event.preventDefault();
    },
    redrawCanvas() {
  // 남아있는 모든 드로잉을 다시 그리기
  this.drawingActions.forEach(action => {
    this.context.strokeStyle = action.color;
    this.context.lineWidth = action.width;
    this.context.beginPath();
    this.context.moveTo(action.fromX, action.fromY);
    this.context.lineTo(action.toX, action.toY);
    this.context.stroke();
    this.context.closePath();
  });

  // 남아있는 모든 스티커를 다시 그리기
  this.stickerActions.forEach(action => {
    const sticker = new Image();
    sticker.src = action.src;
    sticker.onload = () => {
      this.context.drawImage(sticker, action.x, action.y, 100, 100);
    };
  });
},

dropSticker(event) {
  if (!this.isMyTurn) {
    alert('It is not your turn!');
    return;
  }

  event.preventDefault();

  const x = event.offsetX;
  const y = event.offsetY;
  const sticker = new Image();
  sticker.src = this.draggingSticker.src;

  sticker.onload = () => {
    this.context.drawImage(sticker, x, y, 100, 100);
    
    // 스티커 작업을 저장
    this.stickerActions.push({ type: 'STICKER', src: sticker.src, x, y });
    this.undoStack.push('STICKER');

    // WebSocket으로 스티커 상태 전송
    this.webSocket.send(JSON.stringify({
      type: 'STICKER',
      stickerSrc: sticker.src,
      x: x,
      y: y,
    }));
  };
},


  }
}
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  height: auto;
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
  margin-top: 30px;
}

canvas {
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

.color-tools {
  display: flex;
  width: 100%;
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
