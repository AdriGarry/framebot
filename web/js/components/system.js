/** System component */
app.component('system', {
	bindings: {
		data: '<',
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'System',
			actionList:[{label: 'Shutdown', icon: 'power-off', url: '/shutdown'},{label: 'Reboot', icon: 'refresh', url: '/reboot'}]
		};

		this.tile = new DefaultTile(tileParams);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});