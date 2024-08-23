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
  name: 'App',
  components: {
    CarouselComponent,
    PopularComponent,
  },
};
</script>

<style scoped>
</style>