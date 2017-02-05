/** Alarm component */
app.component('alarm', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Alarms',
			actionList:[{url: '/alarm', params: {h:8,m:12,test:'bouts'}}]
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