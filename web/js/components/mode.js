/** mode component */
app.component('mode', {
	bindings: {
		tile: '=',
	},
	templateUrl: '/js/components/mode.html',
	controller: function($scope){
		console.log('MODE_ this.tile', this.tile);
	}
});