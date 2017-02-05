/** Russia component */
app.component('russia', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Russia',
			actionList:[{label: 'Subway / Street', icon: 'subway', url: '/russia'},{
				label: 'Hymn', icon: 'star', url: '/russia?hymn'}]
		};

		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});