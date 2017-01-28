/** Alarm component */
app.component('alarm', {
	bindings: {
		data: '<', // TODO revoir le binding : unidirectionnel?
	},
	templateUrl: '/js/components/alarm.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Alarms',
			actionList:[{label: 'Set alarm', icon: 'retweet', url: '/alarm'}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; console.log('this.tile', this.tile);


		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});