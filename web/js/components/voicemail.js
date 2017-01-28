/** Voicemail component */
app.component('voicemail', {
	bindings: {
		data: '<'
	},
	templateUrl: '/js/components/voicemail.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Voicemail',
			actionList:[{label: 'Clear', icon: 'trash-o', url: '/clearVoiceMail'},{label: 'Play', icon: 'play', url: '/checkVoiceMail'}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; //console.log('this.tile', this.tile);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});