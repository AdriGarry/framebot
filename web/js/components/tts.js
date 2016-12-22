/** mode component */
app.component('tts', {
	bindings: {
		info: '='
	},
	templateUrl: '/js/components/tts.html',
	controller: function(){
		console.log('TTS_ this.info', this.info);
	}
});