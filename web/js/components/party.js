/** Party component */
app.component('party', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/party.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Party',
			actionList:[{url: '/setParty'}]
		};

		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});