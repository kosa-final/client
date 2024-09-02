<template>
  <div class="main-container">
    <div class="largeTitle">ENTER THE ROOM</div>
    <div class="container">
      <div class="video-container">
        <div class="photo-origin" ref="photoOrigin" :style="{ backgroundImage: hasCapturedPhoto ? `url(${photoImageUrl})` : '' }">
          <!-- 프레임 이미지 -->
          <img :src="frameImageUrl" alt="Frame" class="frame-image" />

          <!-- 비디오 (퍼블리셔 + 구독자들) -->
          <div class="video" v-if="!hasCapturedPhoto">
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
      <div class="right-panel">
        <div id="session-header">
          <p><span class="middleTitle">방 이름</span></p>
          <p><span>dd</span></p>
          <p><span class="middleTitle">초대코드</span></p>
          <p><span>{{ roomSession }}</span></p>
          <p>방장여부: {{ isHost }}</p>
          <p>1. 입장 순서대로 프레임이 선정됩니다</p>
          <p>2. 인원이 다 차면 자동으로 촬영 타이머가 시작되며</p>
          <p>&nbsp;&nbsp;10초 이내에 사진을 찍어야 하며</p>
          <p>&nbsp;&nbsp;10초 이내에 사진을 못 찍을 경우 10초일 때 자동으로 사진이 찍힙니다</p>
          <p>3. 사진 촬영은 방장만 가능합니다</p>
          <button class="btn-rounded" @click="capturePhotoOrigin" :disabled="!isCaptureButtonEnabled">사진촬영</button>
        </div>
      </div>
    </div>
    <div class="center">
      <button class="btn-large" @click="showLeaveModal">사진 꾸미러가기</button>
    </div>

    <!-- 방 나가기 모달 -->
    <div v-if="isLeaveModalVisible" class="modal">
      <div class="modal-content">
        <p>방을 나가시겠습니까?</p>
        <button @click="leaveSession" class="modal-btn">네</button>
        <button @click="hideLeaveModal" class="modal-btn">아니요</button>
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
  props: ['roomInfo'],
  data() {
    return {
      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      roomSession: this.$route.params.roomSession,
      userId: this.$route.params.userId,
      selectedFrame: this.$route.params.frame,
      frameImageUrl: "",
      isLeaveModalVisible: false,
      photoImageUrl: "",
      hasCapturedPhoto: false,
      isHost: this.$route.params.isHost,
      isCaptureButtonEnabled: false,
    };
  },
  methods: {
    setFrameImageUrl() {
      this.frameImageUrl = require(`@/assets/frame/${this.selectedFrame}.png`);
    },
    
    joinSession() {
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on("streamCreated", ({ stream }) => {
        // 참가자 수 제한
        if (this.subscribers.length >= 3) {
          alert("참가자 수가 최대 한도를 초과했습니다.");
          this.$router.push('/make');
        } else {
          const subscriber = this.session.subscribe(stream);
          this.subscribers.push(subscriber);
          this.updateCaptureButtonState(); // 버튼 상태 업데이트
          this.$nextTick(this.updateVideoStyles);
        }
      });

      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager, 0);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
          this.updateCaptureButtonState(); // 버튼 상태 업데이트
        }
      });

      this.session.on("exception", ({ exception }) => {
        console.warn(exception);
      });

      this.getToken(this.roomSession).then((token) => {
        this.session
          .connect(token, { clientData: this.userId })
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
      this.$router.push({
        path: `/edit/${this.roomSession}`,
        params: {
          roomSession: this.roomSession,
          userId: this.userId
        }
      });
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

    async getToken(roomSession) {
      const roomSessionFromServer = await this.createSession(roomSession);
      return await this.createToken(roomSessionFromServer);
    },

    async createSession(roomSessionFromServer) {
      const response = await axios.post(
        APPLICATION_SERVER_URL + "api/sessions",
        { customSessionId: roomSessionFromServer },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      return response.data;
    },

    async createToken(roomSessionFromServer) {
      const response = await axios.post(
        APPLICATION_SERVER_URL + "api/sessions/" + roomSessionFromServer + "/connections",
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

    updateCaptureButtonState() {
      // 참가자 수가 3명이면 버튼을 활성화
      this.isCaptureButtonEnabled = this.subscribers.length >= 3;
    },

    async capturePhotoOrigin() {
      if (!this.isHost) {
        alert("방장만 사진을 촬영할 수 있습니다");
        return;
      }

      const element = this.$refs.photoOrigin;

      try {
        const canvas = await html2canvas(element);
        const imageData = canvas.toDataURL("image/png");
        
        // 캡처한 이미지를 photoImageUrl에 저장하여 backgroundImage로 사용
        this.photoImageUrl = imageData;
        this.hasCapturedPhoto = true;

        await axios.post(
          "http://localhost:8080/photo/save",
          { 
            originPhoto: imageData,
            roomId: this.roomInfo.roomId
          },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
        alert('이미지가 성공적으로 촬영되었습니다');
      } catch (error) {
        console.error("Error capturing or saving image:", error.response ? error.response.data : error.message);
      }
    }
  },
  updated() {
    this.updateVideoStyles();
  },
  created() {
    this.setFrameImageUrl();
    this.joinSession();
  }
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

.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  margin-top: 20px;
}

.video-container {
  margin-right: 180px;
}

.controls-container {
  width: 300px; /* 우측 패널의 고정된 너비 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-origin {
  position: relative;
  width: 600px;
  height: 800px;
  background-size: cover; /* 배경 이미지가 요소 크기에 맞게 조정됨 */
  background-position: center; /* 배경 이미지가 중앙에 위치하도록 조정됨 */
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
}
</style>
