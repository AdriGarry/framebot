/** TTS component */
app.component('tts', {
	bindings: {
		data: '<'
	},
	templateUrl: '/js/components/tts.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'TTS - Voice synthesizing',
			actionList:[],
			state: 'active' //collapsed
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		//this.tile.data = this.data; //console.log('this.tile', this.tile);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
			toggleTileState();
		};

		function toggleTileState(){
			console.log('toggleTileState', toggleTileState);
		}
	}
});