<template>
    <div class="save-page-container">
        <p class="largeTitle">SAVE & SHARE</p>
        <div class="content-container">
            <div class="image-frame">
                <img :src="imageUrl" alt="Saved Image" class="saved-image"/>
            </div>
            <div class="save-share-panel">
                <div class="visibility-options">
                    <span class="middleTitle">공개 여부</span>
                    <div class="buttons-container">
                        <button :class="{ active: isPublic }" @click="setVisibility(true)">공개</button>
                        <button :class="{ active: !isPublic }" @click="setVisibility(false)">비공개</button>
                    </div>
                </div>
                <div class="memo-section">
                    <span class="middleTitle">메모 남기기</span>
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
.save-page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    font-family: Arial, sans-serif;
    gap: 20px;
}

.content-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 100px; /* 이미지와 공유 패널 간의 간격 */
}

.image-frame {
    width: 500px;
    height: 600px;
    background-color: #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    /* 상단에 다른 요소와 일직선 맞추기 위해 flex-start로 설정 */
    align-self: flex-start;
}

.saved-image {
    max-width: 100%;
    max-height: 100%;
}

.save-share-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    max-width: 300px;
}

.visibility-options,
.memo-section,
.sns-share {
    width: 100%;
    margin-bottom: 20px;
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
    border-radius: 5px;
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
    border-radius: 6px;
    resize: none;
    box-sizing: border-box;
    background-color: transparent;
}

.sns-share {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

</style>
