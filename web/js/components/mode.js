/** mode component */
app.component('mode', {
	bindings: {
		data: '<'
	},
	templateUrl: '/js/components/mode.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Mode',
			actionList:[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{
				label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{
				label: 'Sleep', icon: 'moon-o', url: '/sleep'},{
				label: 'Restart', icon: 'bolt', url: '/odi'}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);

		/** Overwrite tile action */
		/*this.tile.click = function(){
			console.log('Overwrite tile action');
		};*/
	}
});