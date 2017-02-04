/** About component */
app.component('about', {
	bindings: {
		data: '<',
	},
	templateUrl: '/js/components/about.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'About',
			actionList:[]
		};

		this.tile = new DefaultTile(tileParams);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});