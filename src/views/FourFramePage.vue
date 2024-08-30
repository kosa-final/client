<template>
  <div id="session">
    <div class="largeTitle">ENTER THE ROOM</div>
    <div class="container">
      <div class="video-container">
        <div class="photo-origin" ref="photoOrigin">
          <!-- 프레임 이미지 -->
          <img :src="frameImageUrl" alt="Frame" class="frame-image" />

          <!-- 비디오 (퍼블리셔 + 구독자들) -->
          <div class="video">
            <user-video
              :stream-manager="publisher"
              @click.native="updateMainVideoStreamManager(publisher)"
              class="video-item"
            />
            <user-video
              v-for="sub in subscribers"
              :key="sub.stream.connection.connectionId"
              :stream-manager="sub"
              @click.native="updateMainVideoStreamManager(sub)"
              class="video-item"
            />
          </div>
        </div>
      </div>
      <div class="controls-container">
        <div id="session-header">
          <p>{{ sessionId }}</p>
          <input
            class="btn"
            type="button"
            id="buttonLeaveSession"
            @click="showLeaveModal"
            value="방 나가기"
          />
          <button class="btn" @click="capturePhotoOrigin">캡처하기</button>
        </div>
      </div>
    </div>

    <!-- 방 나가기 모달 -->
    <div v-if="isLeaveModalVisible" class="modal">
      <div class="modal-content">
        <p>방을 나가시겠습니까?</p>
        <button @click="leaveSession" class="modal-btn">나가기</button>
        <button @click="hideLeaveModal" class="modal-btn">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideo from "@/components/video/UserVideo";
import html2canvas from "html2canvas";

axios.defaults.headers.post["Content-Type"] = "application/json";
const APPLICATION_SERVER_URL = "https://4cutstudio.store/";

export default {
  name: "FourFramePage",
  components: {
    UserVideo,
  },
  data() {
    return {
      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      sessionId: this.$route.query.sessionId,
      userName: this.$route.query.userName,
      selectedFrame: this.$route.query.frame,
      frameImageUrl: "",
      isLeaveModalVisible: false, // 모달창 표시 상태
    };
  },
  methods: {
    setFrameImageUrl() {
      if (this.selectedFrame) {
        try {
          this.frameImageUrl = require(`@/assets/frame/${this.selectedFrame}.png`);
        } catch (error) {
          console.error("Error loading frame image:", error);
        }
      } else {
        alert("선택된 프레임이 없습니다");
      }
    },
    
    joinSession() {
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on("streamCreated", ({ stream }) => {
        // 참가자 수 제한
        if (this.subscribers.length >= 3) {
          alert("참가자 수가 최대 한도를 초과했습니다.");
          this.$router.push('/make')
        }
        const subscriber = this.session.subscribe(stream);
        this.subscribers.push(subscriber);
        this.$nextTick(this.updateVideoStyles);
      });

      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      });

      this.session.on("exception", ({ exception }) => {
        console.warn(exception);
      });

      this.getToken(this.sessionId).then((token) => {
        this.session
          .connect(token, { clientData: this.userName })
          .then(() => {
            let publisher = this.OV.initPublisher(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              frameRate: 30,
              insertMode: "APPEND",
              mirror: false,
            });
            this.mainStreamManager = publisher;
            this.publisher = publisher;
            // 퍼블리셔는 구독자 배열에 추가하지 않음
            this.session.publish(this.publisher);
            this.$nextTick(this.updateVideoStyles);
          })
          .catch((error) => {
            console.log("Error connecting to session:", error.code, error.message);
          });
      });

      window.addEventListener("beforeunload", this.leaveSession);
    },

    leaveSession() {
      if (this.session) this.session.disconnect();
      this.session = undefined;
      this.mainStreamManager = undefined;
      this.publisher = undefined;
      this.subscribers = [];
      this.OV = undefined;
      window.removeEventListener("beforeunload", this.leaveSession);
      this.$router.push('/')
    },

    showLeaveModal() {
      this.isLeaveModalVisible = true;
    },

    hideLeaveModal() {
      this.isLeaveModalVisible = false;
    },

    updateMainVideoStreamManager(stream) {
      if (this.mainStreamManager === stream) return;
      this.mainStreamManager = stream;
    },

    async getToken(sessionId) {
      const sessionIdFromServer = await this.createSession(sessionId);
      return await this.createToken(sessionIdFromServer);
    },

    async createSession(sessionId) {
      const response = await axios.post(
        APPLICATION_SERVER_URL + "api/sessions",
        { customSessionId: sessionId },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      return response.data;
    },

    async createToken(sessionIdFromServer) {
      const response = await axios.post(
        APPLICATION_SERVER_URL + "api/sessions/" + sessionIdFromServer + "/connections",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      return response.data;
    },
    
    updateVideoStyles() {
      const videos = this.$el.querySelectorAll("video");
      videos.forEach((video) => {
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
      });
    },

    capturePhotoOrigin() {
      const element = this.$refs.photoOrigin; 
      html2canvas(element).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "capture.png";
        link.click();
      }).catch((error) => {
        console.error("Error capturing photo-origin:", error);
      });
    }
  },
  updated() {
    this.updateVideoStyles();
  },
  created() {
    this.setFrameImageUrl(); // Set the frame image when component is created
    this.joinSession();
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: auto;
  display: flex; 
  justify-content: space-between;
}

.video-container {
  width: 70%;
  padding: 100px;
}

.controls-container {
  width: 30%;
  padding: 100px;
}

.photo-origin {
  position: relative;
  width: 600px;
  height: 800px;
}

.frame-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2; /* 프레임을 최상단에 위치 */
}

.video {
  display: grid;
  position: absolute;
  width: 100%;
  height: 100%;
  grid-template-columns: 300px 300px; /* 각 열의 넓이*/
  grid-template-rows: 350px 350px; /* 각 행의 높이 */
  grid-gap: 0; /* 비디오 간의 간격 제거 */
  z-index: 1;
}

.video-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin: 0;
  padding: 0;
  transform: scaleX(-1); /* 좌우반전 */
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.modal-btn {
  margin: 10px;
  padding: 10px 20px;
  background-color: #DB574D;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}
</style>
