<template>
  <div>
    <p class="middleTitle">Hot</p>
    <div class="photos">
      <img v-for="photo in photos" :key="photo" :src="photo" class="photo" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      photos: [],
    };
  },
  mounted() {
    axios.get('http://localhost:8080/photo/hot')
      .then(response => {
        this.photos = response.data.map(photo => photo.completePhoto).filter(photo => photo !== null);
      })
      .catch(error => {
        this.error = error;
      });
  }
}
</script>

<style>
.photos {
  width: 100%;
  height: 300px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.photo {
  width: auto;
  height: 150px;
  object-fit: cover;
}

</style>
