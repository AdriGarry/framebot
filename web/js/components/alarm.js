/** Alarm component */
app.component('alarm', {
	bindings: {
		data: '<'
	},
	templateUrl: '/js/components/alarm.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Alarms',
			actionList:[{url: '/alarm', params: {h:8,m:12,test:'bouts'}}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; //console.log('this.tile', this.tile);


		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});