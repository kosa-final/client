<template>
  <div>
    <div class="largeTitle">MAKE A ROOM</div>
    <div class="makeroom">
      <div class="form-group">
        <div class="marginBottom">
          <p class="middleTitle">참여자</p>
          <input v-model="myUserName" class="form-control" type="text" required />
        </div>
        <div class="marginBottom">
          <p class="middleTitle">방 이름 입력하기</p>
          <input v-model="myRoomName" class="form-control" type="text" required />
        </div>
        <div class="marginBottom">
          <p class="middleTitle">방 인원 선택하기</p>
          <button @click="setParticipantCount(1)" :class="{'btn-selected': participantCount === 1, 'btn-empty': participantCount !== 1}">1명</button>
          <button @click="setParticipantCount(2)" :class="{'btn-selected': participantCount === 2, 'btn-empty': participantCount !== 2}">2명</button>
          <button @click="setParticipantCount(4)" :class="{'btn-selected': participantCount === 4, 'btn-empty': participantCount !== 4}">4명</button>
        </div>
        <p class="text-center">
          <button class="btn" @click="createRoom">방 만들기</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export default {
  data() {
    return {
      myRoomName: "",
      mySessionId: "",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
      participantCount: 1,
    };
  },
  methods: {
    setParticipantCount(count) {
      this.participantCount = count;
    },
    async createRoom() {
      this.mySessionId = uuidv4();
      try {
        await axios.post('https://clickpic.store/api/sessions', {
          participantCount: this.participantCount,
        });

        this.$router.push({
          name: "Enter",
          query: {
            sessionId: this.mySessionId,
            userName: this.myUserName,
            participantCount: this.participantCount,
          },
        });
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('The session is full. Please try again later.');
          this.$router.push({ name: 'Home' });
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    },
  },
};
</script>

<style scoped>
.makeroom {
  text-align: center;
}

</style>
