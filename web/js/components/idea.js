/** Idea component */
app.component('idea', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/js/components/idea.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Idea',
			actionList:[{label: 'Survivaure', icon: 'space-shuttle', url: '/survivaure'},{
				label: 'Naheulbeuk', icon: 'fort-awesome', url: '/naheulbeuk'},{
				label: 'AAAdri', icon: 'font', url: '/adriExclamation'},{
				label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{
				label: 'Test', icon: 'flag-checkered', url:'/test'}]
		};

		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});