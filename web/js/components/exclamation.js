/** Exclamation component */
app.component('exclamation', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/exclamation.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Exclamation',
			actionList:[{label: 'Conversation', icon: 'comments-o', url: '/conversation'},{
				label: 'TTS', icon: 'commenting-o', url: '/tts?msg=RANDOM'},{
				label: 'Exclamation', icon: 'bullhorn', url: '/exclamation'},{
				label: 'Last TTS', icon: 'undo', url: '/lastTTS'}]
		};

		this.tile = new DefaultTile(tileParams);
		//this.tile.data = this.data;
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});