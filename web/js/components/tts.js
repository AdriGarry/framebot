/** mode component */
app.component('tts', {
	bindings: {
		tile: '='
	},
	templateUrl: '/js/components/tts.html',
	controller: function(){
		console.log('TTS_ this.tile', this.tile);
	}
});