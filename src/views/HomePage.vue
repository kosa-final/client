<template>
  <div>
    <CarouselComponent />
    <PopularComponent />
    <FooterComponent />
  </div>
</template>

<script>
import CarouselComponent from '@/components/main/CarouselComponent.vue';
import PopularComponent from '@/components/main/PopularComponent.vue';

export default {
  name: 'HomePage',
  components: {
    CarouselComponent,
    PopularComponent,
  },
  mounted() {
    const storedToken = localStorage.getItem('accessToken');
    
    // Vuex에 accessToken이 없고 로컬 스토리지에 저장된 토큰이 있다면 갱신
    if (storedToken && !this.$store.state.accessToken) {
      this.$store.dispatch('fetchUserInfo'); // Vuex 상태 갱신
    }
  }
};
</script>

<style scoped>
</style>
