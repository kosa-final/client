<template>
  <div id="session">
    <div class="largeTitle">4컷 프레임 테스트</div>
    <div class="container">
      <div class="photo-origin">
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
      <div class="controls-container">
        <div id="session-header">
          <h1 id="session-title">{{ sessionId }}</h1>
          <input
            class="btn btn-large btn-danger"
            type="button"
            id="buttonLeaveSession"
            @click="leaveSession"
            value="Leave session"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideo from "@/components/video/UserVideo";
import frameImage from "@/assets/basicFrame.png";

axios.defaults.headers.post["Content-Type"] = "application/json";

const APPLICATION_SERVER_URL = "https://4cutstudio.store/";

export default {
  name: "EnterPage",
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
      frameImageUrl: frameImage,
    };
  },
  methods: {
    // 세션에 참여하는 함수
    joinSession() {
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on("streamCreated", ({ stream }) => {
        const subscriber = this.session.subscribe(stream);
        this.subscribers.push(subscriber);
        this.$nextTick(this.updateVideoStyles); // 비디오 스타일 업데이트
      });

      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager, 0);
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

            this.session.publish(this.publisher);
            this.$nextTick(this.updateVideoStyles); // 비디오 스타일 업데이트
          })
          .catch((error) => {
            console.log("세션에 연결하는 중 오류 발생:", error.code, error.message);
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

    // 비디오 스타일 강제 적용 함수
    updateVideoStyles() {
  const videos = this.$el.querySelectorAll("video");
  videos.forEach((video) => {
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
  });
}

  },
  updated() {
    this.updateVideoStyles();
  },
  created() {
    this.joinSession();
  }
};
</script>

<style scoped>
.photo-origin {
  position: relative;
  width: 600px; /* 전체 프레임의 너비 */
  height: 800px; /* 전체 프레임의 높이 */
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
  grid-template-columns: 300px 300px; /* 각 열의 넓이/
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

.video-item:nth-child(3),
.video-item:nth-child(4) {
  transform: translateY(-8px) scaleX(-1); /* 8px 위로 이동하면서 좌우반전 */
}

</style>