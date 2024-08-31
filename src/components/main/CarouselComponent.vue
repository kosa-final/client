<template>
  <div class="slider">
    <button @click="prevImage">‹</button>
    <div class="slides">
    <a href="#" @click="navigatorLogin"><img :src="images[currentIndex]" /></a>  
    </div>
    <button @click="nextImage">›</button>
  </div>
</template>

<script>
import main from '@/assets/MainPage2.png';

export default {
  data() {
    return {
      currentIndex: 0,
      images: [
        main,
      ]
    };
  },
  methods: {
    prevImage() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    navigatorLogin(){
      // const userId = localStorage.getItem('userId') ;
      // if(!userId){
      //   alert('로그인이 필요합니다.');
      // } else {
      //   this.$router.push('/select');
      // }
      this.$router.push('/select');
    }
  }
};
</script>

<style scoped>
.slider {
  position: relative;
  width: 100%;
  height: auto;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
}

.slides img {
  width: 100%;
  height: auto;
  display: block;
}

button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

button:first-of-type {
  left: 0;
}

button:last-of-type {
  right: 0;
}
</style>
