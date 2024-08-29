<!-- PhotoEditor.vue -->
<template>
  <div>
    <input type="file" @change="onFileChange" />
    <canvas ref="canvas" width="800" height="600"></canvas>
    <button @click="saveDrawing">Save Drawing</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: null,
    };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        this.img = event.target.result;
        this.drawImage();
      };
      
      reader.readAsDataURL(file);
    },
    drawImage() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = this.img;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    },
    saveDrawing() {
      const canvas = this.$refs.canvas;
      const dataURL = canvas.toDataURL('image/png');
      
      // Send the image data to the backend
      fetch('/api/saveDrawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: dataURL }),
      }).then(response => response.json())
        .then(data => console.log(data));
    },
  },
};
</script>
