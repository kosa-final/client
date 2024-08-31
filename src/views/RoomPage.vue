<template>
  <div>
    <component :is="currentComponent" :room-info="roomInfo" />
  </div>
</template>

<script>
import axios from 'axios';
import OneFramePage from '@/components/room/OneFramePage.vue';
import TwoFramePage from '@/components/room/TwoFramePage.vue';
import ThreeFramePage from '@/components/room/ThreeFramePage.vue';
import FourFramePage from '@/components/room/FourFramePage.vue';

export default {
  name: 'RoomPage',
  props: ['sessionId', 'participantCount'],
  components: {
    OneFramePage,
    TwoFramePage,
    ThreeFramePage,
    FourFramePage,
  },
  data() {
    return {
      roomInfo: null,
    };
  },
  created() {
    this.loadRoomInfo();
  },
  computed: {
    currentComponent() {
      switch (this.participantCount) {
        case 1:
          return 'OneFramePage';
        case 2:
          return 'TwoFramePage';
        case 3:
          return 'ThreeFramePage';
        case 4:
          return 'FourFramePage';
        default:
          return null;
      }
    },
  },
  methods: {
    async loadRoomInfo() {
      if (!this.roomInfo) {
        try {
          const response = await axios.get(`http://localhost:8080/room/info`, {
            params: {
              roomSession: this.sessionId,
            },
          });

          if (response.status === 200) {
            this.roomInfo = response.data;
          } else {
            console.error("Failed to load room info:", response.data);
          }
        } catch (error) {
          console.error("Error loading room info:", error);
        }
      }
    },
  },
};
</script>
