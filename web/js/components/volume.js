/** mode component */
app.component('volume', {
	bindings: {
		data: '<', // TODO revoir le binding : unidirectionnel?
	},
	templateUrl: '/js/components/volume.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			id: 1,
			label: 'Volume',
			actionList:[{label: 'Mute', icon: 'retweet', url: '/mute'}]
		};

		//this.tileData = this.tile; console.log('this.tileData', this.tileData);
		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; console.log('this.tile', this.tile);

		// $scope.tile = new DefaultTile(1, 'Mode', 'teal', 1, 1, 'custom', '-',
		// 	[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]);


		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});