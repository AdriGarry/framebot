'use strict';
/** Objects **/

/** Tile object **/
app.factory('Tile', function() {
	// Tile constructor function
	function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList) {
		// Basic attributes
		this.id = id || '';
		this.label = label || '';
		this.color = color || '';
		this.rowspan = rowspan || '';
		this.colspan = colspan || '';

		// Info attributes
		this.value = value;
		this.viewMode = viewMode; // 'icon' || 'value' || 'custom'
		this.html = '';

		// Action attributes
		this.actionList = actionList;
		// Set Tile.value to first Tile.actionList item
		if (this.actionList.length > 0 && !this.actionList[0].hasOwnProperty('label'))
			this.actionList[0].label = this.label;
	}

	// Tile object own properties
	Tile.prototype = {
		/*onHold: function(element){
			console.log('onHold()');
			console.log(element);
		}*/
	};
	// Return constructor
	return Tile;
});
