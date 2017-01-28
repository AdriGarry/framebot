/** CPU component */
app.component('cpu', {
	bindings: {
		data: '<', // TODO revoir le binding : unidirectionnel?
	},
	templateUrl: '/js/components/cpu.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'CPU',
			actionList:[{label: 'Set alarm', icon: 'retweet', url: '/alarm'}] // <-- TODO ...
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; console.log('this.tile', this.tile);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});