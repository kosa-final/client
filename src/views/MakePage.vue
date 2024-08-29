<template>
  <div id="join-dialog" class="jumbotron vertical-center">
    <div class="largeTitle">MAKE A ROOM</div>
    <div class="center marginBottom">
      <p class="middleTitle">참여자</p>
      <input v-model="UserName" class="form-control" type="text" required />
    </div>
    <div class="center marginBottom">
      <p class="middleTitle">방 이름 입력하기</p>
      <input v-model="RoomName" class="form-control" type="text" required />
    </div>
    <div class="center marginBottom">
      <p class="middleTitle">방 인원 선택하기</p>
      <button @click="setParticipantCount(1)" :class="{'btn-selected': participantCount === 1, 'btn-empty': participantCount !== 1}">1명</button>
      <button @click="setParticipantCount(2)" :class="{'btn-selected': participantCount === 2, 'btn-empty': participantCount !== 2}">2명</button>
      <button @click="setParticipantCount(4)" :class="{'btn-selected': participantCount === 4, 'btn-empty': participantCount !== 4}">4명</button>
    </div>
    <div class="center marginBottom">
      <button class="btn btn-lg btn-success" @click="joinSession">방 만들기</button>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "MakePage",
  data() {
    return {
      UserName: "Participant" + Math.floor(Math.random() * 100),
      RoomName: "",
      SessionId: "",
      participantCount: 1, 
    };
  },
  methods: {
    setParticipantCount(count) {
      this.participantCount = count; 
    },
    joinSession() {
      if (this.RoomName) {
        this.SessionId = uuidv4();
        let targetPage = '';

        if (this.participantCount === 1) {
          targetPage = 'OneFrame';
        } else if (this.participantCount === 2) {
          targetPage = 'TwoFrame';
        } else if (this.participantCount === 4) {
          targetPage = 'FourFrame';
        }

        this.$router.push({
          name: targetPage,
          params: {},
          query: {
            sessionId: this.SessionId,
            userName: this.UserName,
            participantCount: this.participantCount, 
          },
        });
      } else {
        alert("방 이름을 입력하세요");
      }
    },
  },
};
</script>
