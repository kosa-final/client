<template>
    <div class="main-container">
        <p class="largeTitle">SAVE & SHARE</p>
        <div class="container">
            <div class="image-container">
                <img :src="imageUrl" alt="Saved Image" class="saved-image"/>
            </div>
            <div class="right-panel">
                <div class="visibility-options">
                    <p class="middleTitle">공개 여부</p>
                    <div class="buttons-container">
                        <button :class="{ active: isPublic }" @click="setVisibility(true)">공개</button>
                        <button :class="{ active: !isPublic }" @click="setVisibility(false)">비공개</button>
                    </div>
                </div>
                <div class="memo-section">
                    <p class="middleTitle">메모 남기기</p>
                    <textarea v-model="memo"></textarea>
                </div>
                <!-- <div class="sns-share">
                    <span class="label">SNS 공유</span>
                </div> -->
            </div>
        </div>
        <div class="center">
            <button class="btn-large" @click="saveCompletePhoto">저장하기</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'SavePage',
    props: ['roomSession', 'userId'],
    data() {
        return {
            imageUrl: decodeURIComponent(this.$route.params.imageUrl || ''),
            isPublic: true,
            memo: ''
        };
    },
    mounted() {
        console.log(this.$route.params.imageUrl);
    },
    methods: {
        setVisibility(isPublic) {
            this.isPublic = isPublic;
        },
        async saveCompletePhoto() {
            const payload = {
                isPublic: this.isPublic ? 'true' : 'false',
                note: this.memo
            };
            try {
                const response = await axios.post(
                `http://localhost:8080/photo/final?roomSession=${this.roomSession}`, 
                payload,
                {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                }
                );
                alert('Photo saved successfully!');
                console.log('Response:', response.data);
                this.$router.push({
                    name: 'Home',
                });
            } catch (error) {
                alert('Error saving photo.');
                console.error('Save error:', error);
            }
        }
    }
};
</script>

<style>
.main-container {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
}

.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
}

.image-container {
  margin-right: 180px;
  margin-top: 30px;
}

.saved-image {
  position: relative;
  width: 600px;
  height: 800px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.right-panel {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.visibility-options,
.memo-section,
.sns-share {
    width: 500px;
}

.buttons-container {
    display: flex;
    gap: 30px; 
}

.visibility-options button {
    padding: 10px 20px;
    border: 1px solid #DB574D;
    background-color: transparent;
    color: #DB574D;
    cursor: pointer;
    border-radius: 15px;
    flex: 1;
    text-align: center;
}

.visibility-options button.active {
    background-color: #DB574D;
    color: white;
}

textarea {
    width: 100%;
    height: 150px; 
    padding: 10px;
    border: 1px solid #DB574D;
    border-radius: 15px;
    resize: none;
    box-sizing: border-box;
    background-color: transparent;
}
</style>
