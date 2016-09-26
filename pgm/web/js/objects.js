/** Objects **/


//app.value("trim", jQuery.trim);

/** Tile object **/
app.factory('Tile', function(){
	// Define the constructor function.
	function Tile(id, label, color, rowspan, colspan, value, bottomSheetList){
		var self = this;
		// Basic attributes
		this.id = id || '';
		this.label = label || '';
		this.color = color || '';
		this.rowspan = rowspan || '';
		this.colspan = colspan || '';

		// Info attributes
		this.value = value;
		/*this.bottomSheetList = [];
		bottomSheetList.forEach(function(bottomSheet){
			console.log(bottomSheet);
			self.bottomSheetList.push(bottomSheet);
		});*/
		this.bottomSheetList = bottomSheetList;
	}

	// Define the "instance" methods using the prototype and standard prototypal inheritance.
	Tile.prototype = {
		// getFirstName: function(){
		// 	return(this.firstName);
		// },
		// Action attributes
		onclick: function(){
		},
		onHold: function(){
		},
		onDBclick: function(){
		}
	};

	// Return constructor
	return(Tile);
});
