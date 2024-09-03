<template>
    <div class="save-page-container">
        <h2 class="title">SAVE & SHARE</h2>
        <div class="content-container">
            <div class="image-frame">
                <img :src="imageUrl" alt="Saved Image" class="saved-image"/>
            </div>
            <div class="save-share-panel">
                <div class="visibility-options">
                    <span class="label">공개 여부</span>
                    <div class="buttons-container">
                        <button :class="{ active: isPublic }" @click="setVisibility(true)">공개</button>
                        <button :class="{ active: !isPublic }" @click="setVisibility(false)">비공개</button>
                    </div>
                </div>
                <div class="memo-section">
                    <span class="label">메모 남기기</span>
                    <textarea v-model="memo"></textarea>
                </div>
                <div class="sns-share">
                    <span class="label">SNS 공유</span>
                    <!-- 아이콘 넣을 곳 -->
                </div>
            </div>
        </div>
        <button class="home-button">저장하기</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            imageUrl: decodeURIComponent(this.$route.query.imageUrl || ''), // URL 파라미터에서 이미지 URL을 가져옴
            isPublic: true,
            memo: ''
        };
    },
    methods: {
        setVisibility(isPublic) {
            this.isPublic = isPublic;
        },
        shareToSNS(platform) {
            alert(`Share to ${platform}`);
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

.title {
    color: #DB574D;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
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

.label {
    margin-top: 30px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
    display: inline-block;
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
}

.sns-share {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.home-button {
    padding: 10px 40px;
    background-color: #DB574D;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    margin-top: 20px;
}
</style>
