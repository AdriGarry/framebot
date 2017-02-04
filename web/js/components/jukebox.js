/** Jukebox component */
app.component('jukebox', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/jukebox.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Jukebox',
			actionList:[{label: 'Jukebox', icon: 'random', url: '/jukebox'},{label: 'FIP Radio', icon: 'globe', url: '/fip'}]
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