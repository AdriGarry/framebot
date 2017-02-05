/** CPU component */
app.component('cpu', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'CPU',
			//disableOnSleep: true,
			//odiState: this.state,
			actionList:[{url: '/cpuTemp'}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		//this.tile.data = this.data; //console.log('this.tile', this.tile);
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});