<template>
  <div id="join-dialog">
    <div class="largeTitle">MAKE A ROOM</div>
    <div class="center">
      <p class="middleTitle">참여자</p>
      <input v-model="UserName" class="form-control" type="text" required />
    </div>
    <div class="center">
      <p class="middleTitle">방 이름 입력하기</p>
      <input v-model="RoomName" class="form-control" type="text" required />
    </div>
    <div class="center">
      <p class="middleTitle">방 인원 선택하기</p>
      <button @click="setParticipantCount(1)" :class="{'btn-selected': participantCount === 1, 'btn-empty': participantCount !== 1}">1명</button>
      <button @click="setParticipantCount(2)" :class="{'btn-selected': participantCount === 2, 'btn-empty': participantCount !== 2}">2명</button>
      <button @click="setParticipantCount(3)" :class="{'btn-selected': participantCount === 3, 'btn-empty': participantCount !== 3}">3명</button>
      <button @click="setParticipantCount(4)" :class="{'btn-selected': participantCount === 4, 'btn-empty': participantCount !== 4}">4명</button>
    </div>
    <div class="center">
      <p class="middleTitle">프레임 선택하기</p>
      <p>색상별</p>
      <div class="frame-options">
        <div v-for="(frame, index) in currentFrames" :key="index" class="frame-option">
          <img 
            :src="frame.src" 
            :alt="frame.name" 
            class="frame-image" 
            :class="{'selected-frame': selectedFrame === frame.name}" 
            @click="selectFrame(frame)" 
          />
        </div>
      </div>
      <p>패턴별</p>
      <div class="frame-options">
        <div v-for="(frame, index) in currentPatternFrames" :key="index" class="frame-option">
          <img 
            :src="frame.src" 
            :alt="frame.name" 
            class="frame-image" 
            :class="{'selected-frame': selectedFrame === frame.name}" 
            @click="selectFrame(frame)" 
          />
        </div>
      </div>
    </div>
    <div class="center marginBottom">
      <button class="btn" @click="joinSession">방 만들기</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "MakePage",
  data() {
    return {
      UserName: Math.floor(Math.random() * 100),
      RoomName: "",
      SessionId: "",
      participantCount: 1,
      frames: {
        1: [
          { name: '1frame_black', src: require('@/assets/frame/1frame_black.png') },
          { name: '1frame_blue', src: require('@/assets/frame/1frame_blue.png') },
          { name: '1frame_green', src: require('@/assets/frame/1frame_green.png') },
          { name: '1frame_purple', src: require('@/assets/frame/1frame_purple.png') },
          { name: '1frame_red', src: require('@/assets/frame/1frame_red.png') },
          { name: '1frame_white', src: require('@/assets/frame/1frame_white.png') },
        ],
        2: [
          { name: '2frame_black', src: require('@/assets/frame/2frame_black.png') },
          { name: '2frame_blue', src: require('@/assets/frame/2frame_blue.png') },
          { name: '2frame_green', src: require('@/assets/frame/2frame_green.png') },
          { name: '2frame_purple', src: require('@/assets/frame/2frame_purple.png') },
          { name: '2frame_red', src: require('@/assets/frame/2frame_red.png') },
          { name: '2frame_white', src: require('@/assets/frame/2frame_white.png') },
        ],
        3: [
          { name: '3frame_black', src: require('@/assets/frame/3frame_black.png') },
          { name: '3frame_blue', src: require('@/assets/frame/3frame_blue.png') },
          { name: '3frame_green', src: require('@/assets/frame/3frame_green.png') },
          { name: '3frame_purple', src: require('@/assets/frame/3frame_purple.png') },
          { name: '3frame_red', src: require('@/assets/frame/3frame_red.png') },
          { name: '3frame_white', src: require('@/assets/frame/3frame_white.png') },
        ],
        4: [
          { name: '4frame_black', src: require('@/assets/frame/4frame_black.png') },
          { name: '4frame_blue', src: require('@/assets/frame/4frame_blue.png') },
          { name: '4frame_green', src: require('@/assets/frame/4frame_green.png') },
          { name: '4frame_purple', src: require('@/assets/frame/4frame_purple.png') },
          { name: '4frame_red', src: require('@/assets/frame/4frame_red.png') },
          { name: '4frame_white', src: require('@/assets/frame/4frame_white.png') },
        ]
      },
      frames_pattern: {
        1: [
          { name: '1frame_black', src: require('@/assets/frame/1frame_black_pattern.png') },
          { name: '1frame_blue', src: require('@/assets/frame/1frame_blue_pattern.png') },
          { name: '1frame_green', src: require('@/assets/frame/1frame_green_pattern.png') },
          { name: '1frame_purple', src: require('@/assets/frame/1frame_purple_pattern.png') },
          { name: '1frame_red', src: require('@/assets/frame/1frame_red_pattern.png') },
          { name: '1frame_white', src: require('@/assets/frame/1frame_white_pattern.png') },
        ],
        2: [
          { name: '2frame_black', src: require('@/assets/frame/2frame_black_pattern.png') },
          { name: '2frame_blue', src: require('@/assets/frame/2frame_blue_pattern.png') },
          { name: '2frame_green', src: require('@/assets/frame/2frame_green_pattern.png') },
          { name: '2frame_purple', src: require('@/assets/frame/2frame_purple_pattern.png') },
          { name: '2frame_red', src: require('@/assets/frame/2frame_red_pattern.png') },
          { name: '2frame_white', src: require('@/assets/frame/2frame_white_pattern.png') },
        ],
        3: [
          { name: '3frame_black', src: require('@/assets/frame/3frame_black_pattern.png') },
          { name: '3frame_blue', src: require('@/assets/frame/3frame_blue_pattern.png') },
          { name: '3frame_green', src: require('@/assets/frame/3frame_green_pattern.png') },
          { name: '3frame_purple', src: require('@/assets/frame/3frame_purple_pattern.png') },
          { name: '3frame_red', src: require('@/assets/frame/3frame_red_pattern.png') },
          { name: '3frame_white', src: require('@/assets/frame/3frame_white_pattern.png') },
        ],
        4: [
          { name: '4frame_black_pattern', src: require('@/assets/frame/4frame_black_pattern.png') },
          { name: '4frame_blue_pattern', src: require('@/assets/frame/4frame_blue_pattern.png') },
          { name: '4frame_green_pattern', src: require('@/assets/frame/4frame_green_pattern.png') },
          { name: '4frame_purple_pattern', src: require('@/assets/frame/4frame_purple_pattern.png') },
          { name: '4frame_red_pattern', src: require('@/assets/frame/4frame_red_pattern.png') },
          { name: '4frame_white_pattern', src: require('@/assets/frame/4frame_white_pattern.png') },
        ]
      },
      selectedFrame: null,
    };
  },
  computed: {
    currentFrames() {
      return this.frames[this.participantCount] || [];
    },
    currentPatternFrames() {
      return this.frames_pattern[this.participantCount] || [];
    }
  },
  methods: {
    setParticipantCount(count) {
      this.participantCount = count; 
    },
    selectFrame(frame) {
      this.selectedFrame = frame.name;
    },
    async joinSession() {
      if (this.RoomName) {
        this.SessionId = uuidv4();

        const payload = {
          userId: Number(this.UserName),
          userCount: this.participantCount,
          roomName: this.RoomName,
          roomSession: this.SessionId,
          frameId: this.selectedFrame
        };
        
        try {
          await axios.post('http://localhost:8080/room/create', payload);

          this.$router.push({
            name: 'Room',
            params: {
              sessionId: this.SessionId,
              userName: this.UserName,
              participantCount: this.participantCount,
              frame: this.selectedFrame
            }
          });

        } catch (error) {
          console.error('There was an error creating the room:', error);
          alert('Failed to create room. Please try again.' + error);
        }
      } else {
        alert("방 이름을 입력하세요");
      }
    },
  },
};
</script>

<style scoped>
div {
  padding: 10px;
}

.frame-options {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.frame-option {
  text-align: center;
}

.frame-image {
  width: 150px;
  height: auto;
  cursor: pointer;
  transition: transform 0.2s;
}

.frame-image:hover {
  transform: scale(1.1);
}

.selected-frame {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

</style>
