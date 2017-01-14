/** mode component */
app.component('tts', {
	bindings: {
		tile: '='
	},
	templateUrl: '/js/components/tts.html',
	controller: function(){
		//console.log('TTS_ this.tile', this.tile);
		/** Function to expand Tile */
		this.expandTile = function(obj){
			if(obj.hasOwnProperty('rowspan')) obj.rowspan = 2;
		};
		/** Function to reduce Tile */
		this.reduceTile = function(obj){
			console.log(obj);
			obj.rowspan = 1;
			console.log(obj);
		};

	}
});