/** mode component */
app.component('mode', {
	bindings: {
		tile: '=',
	},
	templateUrl: '/js/components/mode.html',
	controller: function(){
		console.log('MODE_ this.tile', this.tile);
	}
});