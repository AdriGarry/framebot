/** mode component */
app.component('mode', {
	bindings: {
		tile: '=', // TODO revoir le binding : unidirectionnel?
	},
	templateUrl: '/js/components/mode.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			id: 1,
			label: 'Mode 13',
			color: 'teal',
			rowspan: 1,
			colspan: 1,
			viewMode: 'custom',
			value: '-',
			actionList:[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]
		};

		this.tile = new DefaultTile(tileParams); console.log('this.tile', this.tile);
		this.tileData = this.tile; console.log('this.tileData', this.tileData);


		// $scope.tile = new DefaultTile(1, 'Mode', 'teal', 1, 1, 'custom', '-',
		// 	[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]);


		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});