<template>
	<div v-if="streamManager">
		<ov-video :stream-manager="streamManager"/>
	</div>
	</template>
	
	<script>
	import OvVideo from './OvVideo';
	
	export default {
		name: 'UserVideo',
	
		components: {
			OvVideo,
		},
	
		props: {
			streamManager: Object,
		},
	
		computed: {
			clientData () {
				const { clientData } = this.getConnectionData();
				console.log("집에 보내줘2",this.getConnectionData())
				return clientData;
			},
		},
	
		methods: {
			getConnectionData () {
				const { connection } = this.streamManager.stream;
				console.log("집에 보내줘",this.streamManager.stream)
				return JSON.parse(connection.data);
			},
		},
	};
	</script>
	
	<style scoped>
	
	</style>