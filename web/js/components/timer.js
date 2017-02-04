/** Timer component */
app.component('timer', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/timer.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Timer',
			actionList:[{label: 'Stop timer', icon: 'stop', url: '/timer?stop'},{label: 'Timer +1', icon: 'plus', url: '/timer'}]
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