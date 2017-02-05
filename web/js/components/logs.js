/** Logs component */
app.component('logs', {
	bindings: {
		data: '<',
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Logs',
			actionList:[{label: 'Voicemail History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/voicemailHistory'},{
				label: 'Request History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/requestHistory'},{
				label: 'Config', icon: 'sliders', url: 'http://odi.adrigarry.com/config.json'}]
		};

		this.tile = new DefaultTile(tileParams);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});