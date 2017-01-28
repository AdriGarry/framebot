/** Volume component */
app.component('volume', {
	bindings: {
		data: '<'
	},
	templateUrl: '/js/components/volume.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Volume',
			actionList:[{label: 'Mute', url: '/mute'}]
		};

		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
		this.tile.data = this.data; //console.log('this.tile', this.tile);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});