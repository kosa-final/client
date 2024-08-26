<template>
  <div id="session">
    <div class="largeTitle">ENTER THE ROOM</div>
    <div class="container">
      <div class="video-container">
        <div id="video-grid">
          <div v-for="(stream, index) in videoSlots" :key="index" class="video-slot">
            <user-video v-if="stream" :stream-manager="stream" @click.native="updateMainVideoStreamManager(stream)" />
            <div v-else class="waiting-message">대기중...</div>
          </div>
        </div>
      </div>
      <div class="controls-container">
        <div id="session-header">
          <h1 id="middleTitle">{{ mySessionId }}</h1>
          <input class="btn" type="button" id="buttonCaptureSnapshot" @click="captureSnapshot" value="사진 촬영하기" />
          <input class="btn" type="button" id="buttonLeaveSession" @click="leaveSession" value="방 나가기" />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import UserVideo from '@/components/video/UserVideo.vue';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const APPLICATION_SERVER_URL = 'https://clickpic.store/';

export default {
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
      mySessionId: this.$route.query.sessionId || '',
      myUserName: this.$route.query.userName || '',
      videoSlots: [null, null, null, null], // 2x2 grid
    };
  },
  mounted() {
    this.joinSession();
  },
  methods: {
    async joinSession() {
      this.videoSlots = [null, null, null, null];
      
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on('streamCreated', ({ stream }) => {
        const subscriber = this.session.subscribe(stream);
        this.addStreamToGrid(subscriber);
      });

      this.session.on('streamDestroyed', ({ stream }) => {
        this.removeStreamFromGrid(stream.streamManager);
      });

      this.session.on('exception', ({ exception }) => {
        console.warn(exception);
      });

      try {
        const token = await this.getToken(this.mySessionId);
        await this.session.connect(token, { clientData: this.myUserName });

        this.publisher = this.OV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '480x600',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false,
        });

        this.mainStreamManager = this.publisher;

        await this.session.publish(this.publisher);
        this.addStreamToGrid(this.publisher);
      } catch (error) {
        console.log('There was an error connecting to the session:', error.code, error.message);
      }

      window.addEventListener('beforeunload', this.leaveSession);
    },

    leaveSession() {
      if (this.session) this.session.disconnect();
      this.session = undefined;
      this.mainStreamManager = undefined;
      this.publisher = undefined;
      this.subscribers = [];
      this.videoSlots = [null, null, null, null];
      this.OV = undefined;
      window.removeEventListener('beforeunload', this.leaveSession);
      this.$router.push('/');
    },

    updateMainVideoStreamManager(stream) {
      if (this.mainStreamManager === stream) return;
      this.mainStreamManager = stream;
    },

    async getToken(mySessionId) {
      const sessionId = await this.createSession(mySessionId);
      return await this.createToken(sessionId);
    },

    async createSession(sessionId) {
      try {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error) {
        console.error('Session creation error:', error.response || error.message);
        throw error;
      }
    },

    async createToken(sessionId) {
      try {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('참여자 수가 초과되었습니다. 더 이상 입장할 수 없습니다.');
        }
        console.error('Token creation error:', error.response || error.message);
        throw error;
      }
    },

    captureSnapshot() {
      const videoElements = Array.from(document.querySelectorAll('video')).filter(video =>
        video.id.startsWith('local-video') || video.id.startsWith('remote-video')
      );

      if (videoElements.length > 0) {
        videoElements.forEach((videoElement, index) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          const imageUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `snapshot-${index + 1}.png`;
          link.click();
        });
      } else {
        console.error('No matching video elements found!');
      }
    },

    addStreamToGrid(stream) {
      const emptyIndex = this.videoSlots.indexOf(null);
      if (emptyIndex !== -1) {
        this.$set(this.videoSlots, emptyIndex, stream);
      } else {
        console.warn('No empty slots available to add the new stream.');
      }
    },

    removeStreamFromGrid(stream) {
      const index = this.videoSlots.indexOf(stream);
      if (index !== -1) {
        this.$set(this.videoSlots, index, null);
      } else {
        console.warn('Stream not found in video slots.');
      }
    },
  },
};
</script>

<style scoped>
#session {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  display: flex;
  width: 90%;
}

.video-container {
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}

.controls-container {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

#video-grid {
  display: grid;
  grid-template-columns: repeat(2, 480px);
  grid-template-rows: repeat(2, 600px);
}

.video-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

</style>

