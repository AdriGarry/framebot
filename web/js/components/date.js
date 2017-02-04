/** Date component */
app.component('date', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/date.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Date',
			actionList:[{label: 'Odi\'s age', icon: 'birthday-cake', url: '/age'},{label: 'Today', icon: 'calendar', url: '/date'}]
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