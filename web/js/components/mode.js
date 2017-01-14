/** mode component */
app.component('mode', {
	bindings: {
		tile: '=',
	},
	templateUrl: '/js/components/mode.html',
	controller: function($scope, DefaultTile){
		$scope.tile = this.tile;
		console.log('$scope.tile', $scope.tile);
		$scope.defaultTile = new DefaultTile(1, 'Mode', 'teal', 1, 1, 'custom', '-',
			[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]);//.init($scope.tile);
		console.log('$scope.defaultTile', $scope.defaultTile);
	}
});