/** mode component */
app.component('mode', {
	bindings: {
		info: '='
	},
	templateUrl: '/js/components/mode.html',
	controller: function(){
		console.log('MODE_ this.info', this.info);
	}
});