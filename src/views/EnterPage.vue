<template>
  <div id="join-dialog">
    <div class="largeTitle">ENTER THE ROOM</div>
    <div class="center">
      <p class="middleTitle">참여자</p>
      <input v-model="UserName" class="form-control" type="text" required />
    </div>
    <div class="center">
      <p class="middleTitle">방 코드 입력하기</p>
      <input v-model="SessionId" class="form-control" type="text" required />
    </div>
    <div class="center marginBottom">
      <button class="btn" @click="joinSession">방 입장하기</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "EnterPage",
  data() {
    return {
      UserName: Math.floor(Math.random() * 100),
      SessionId: "",
    };
  },
  methods: {
    async joinSession() {
      if (!this.SessionId) {
        alert("방 코드를 입력하세요");
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/room/enter', null, {
          params: {
            userId: this.UserName,
            roomSession: this.SessionId
          }
        });

        if (response.status === 200) {
          const roomInfo = await this.fetchRoomInfo(this.SessionId);

          if (roomInfo) {
            this.$router.push({
              name: 'Room',
              params: {
                sessionId: this.SessionId,
                userName: this.UserName,
                participantCount: roomInfo.userCount,
                frame: roomInfo.frameId
              }
            });
          } else {
            alert('방 정보를 가져오는 데 실패했습니다. 다시 시도하세요.');
          }
        } else {
          alert('유효하지 않은 세션 코드입니다. 다시 시도하세요.');
        }
      } catch (error) {
        alert('방 입장에 실패했습니다. 다시 시도하세요.');
      }
    },
    async fetchRoomInfo(sessionId) {
      try {
        const response = await axios.get(`http://localhost:8080/room/info`, {
          params: {
            roomSession: sessionId
          }
        });

        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Failed to fetch room info:", response.data);
          return null;
        }
      } catch (error) {
        console.error("Error fetching room info:", error);
        return null;
      }
    }
  }
};
</script>
