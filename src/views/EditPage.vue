<template>
    <div id="drawing-picture">
      <div class="canvas-container">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="tools">
        <!-- 컬러 선택 버튼 -->
        <div
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="color-field"
          @click="changeColor(color)"
        ></div>
  
        <!-- 컬러피커 -->
        <input type="color" v-model="drawColor" class="color-picker" />
  
        <!-- 펜 굵기 조절 -->
        <input
          type="range"
          v-model="drawWidth"
          min="1"
          max="100"
          class="pen-range"
        />
  
        <!-- 기능 버튼들 -->
        <button @click="clearCanvas" class="button">초기화</button>
        <button @click="undoLast" class="button">되돌리기</button>
        <button @click="saveCanvas" class="button">다운로드</button>
      </div>
      <!-- 스티커 영역 -->
      <div class="stickers">
        <img
          v-for="sticker in stickers"
          :key="sticker"
          :src="sticker"
          draggable="true"
          @dragstart="dragStart"
          class="sticker-image"
        />
      </div>
    </div>
  </template>
  
  <script>
  import frameImage from "@/assets/basicFrame.png"; // 프레임 이미지 가져오기
  import sticker1 from "@/assets/Sticker/sticker1.png";
  import sticker2 from "@/assets/Sticker/sticker2.png";
  import sticker3 from "@/assets/Sticker/sticker3.png";
  
  export default {
    data() {
      return {
        canvas: null,
        context: null,
        drawColor: "#000000",
        drawWidth: 5,
        isDrawing: false,
        restoreArray: [],
        index: -1,
        colors: ["#212738", "#F97068", "#D1D646", "#57C4E5"],
        stickers: [sticker1, sticker2, sticker3], // 스티커 이미지 배열
        draggingSticker: null,
      };
    },
    mounted() {
      this.initializeCanvas();
    },
    methods: {
      initializeCanvas() {
        this.canvas = this.$refs.canvas;
        this.context = this.canvas.getContext("2d");
        this.canvas.width = 600; // 이미지에 맞춰 크기를 설정합니다.
        this.canvas.height = 800;
  
        // 이미지 로드
        const image = new Image();
        image.src = frameImage;
        image.onload = () => {
          // 이미지가 로드되면 캔버스에 이미지를 그립니다.
          this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        };
  
        // 이벤트 리스너 등록
        this.canvas.addEventListener("mousedown", this.startDrawing);
        this.canvas.addEventListener("mousemove", this.draw);
        this.canvas.addEventListener("mouseup", this.stopDrawing);
        this.canvas.addEventListener("mouseout", this.stopDrawing);
  
        this.canvas.addEventListener("touchstart", this.startDrawing);
        this.canvas.addEventListener("touchmove", this.draw);
        this.canvas.addEventListener("touchend", this.stopDrawing);
  
        this.canvas.addEventListener("dragover", this.allowDrop);
        this.canvas.addEventListener("drop", this.dropSticker);
      },
      changeColor(color) {
        this.drawColor = color;
      },
      startDrawing(event) {
        this.isDrawing = true;
        this.context.beginPath();
        this.context.moveTo(
          event.clientX - this.canvas.offsetLeft,
          event.clientY - this.canvas.offsetTop
        );
        event.preventDefault();
  
        if (event.type !== "mouseout") {
          // 이전 상태를 저장하기
          if (this.index < this.restoreArray.length - 1) {
            this.restoreArray = this.restoreArray.slice(0, this.index + 1);
          }
          this.restoreArray.push(
            this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
          );
          this.index += 1;
        }
      },
      draw(event) {
        if (!this.isDrawing) return;
  
        this.context.lineTo(
          event.clientX - this.canvas.offsetLeft,
          event.clientY - this.canvas.offsetTop
        );
        this.context.strokeStyle = this.drawColor;
        this.context.lineWidth = this.drawWidth;
        this.context.lineCap = "round";
        this.context.lineJoin = "round";
        this.context.stroke();
      },
      stopDrawing(event) {
        if (!this.isDrawing) return;
  
        this.context.stroke();
        this.context.closePath();
        this.isDrawing = false;
        event.preventDefault();
      },
      undoLast() {
        if (this.index <= 0) {
          this.clearCanvas();
        } else {
          this.index -= 1;
          this.context.putImageData(this.restoreArray[this.index], 0, 0);
        }
      },
      clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
        // 배경 이미지를 다시 로드
        const image = new Image();
        image.src = frameImage;
        image.onload = () => {
          this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        };
  
        this.restoreArray = [];
        this.index = -1;
      },
      saveCanvas() {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL("image/png");
        link.download = `canvas-image.png`;
        link.click();
      },
      // 스티커 드래그 시작
      dragStart(event) {
        this.draggingSticker = event.target;
      },
      // 캔버스로 드래그 허용
      allowDrop(event) {
        event.preventDefault();
      },
      // 스티커 드랍
      dropSticker(event) {
        event.preventDefault();
        const x = event.clientX - this.canvas.offsetLeft;
        const y = event.clientY - this.canvas.offsetTop;
        const sticker = new Image();
        sticker.src = this.draggingSticker.src;
        sticker.onload = () => {
          this.context.drawImage(sticker, x, y, 100, 100); // 스티커 크기는 100x100으로 설정
          this.restoreArray.push(
            this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
          );
          this.index += 1;
        };
      },
    },
  };
  </script>
  
  <style>
  .canvas-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    background-color: whitesmoke;
  }
  
  .tools {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
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
    width: 100px;
  }
  
  .button {
    padding: 10px 20px;
    background-color: #222;
    color: white;
    cursor: pointer;
    border: none;
    font-weight: bold;
  }
  
  .stickers {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
  }
  
  .sticker-image {
    width: 50px;
    height: 50px;
    cursor: move;
  }
  </style>
  