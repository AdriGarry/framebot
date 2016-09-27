'use strict'
/** Objects **/

//app.value("trim", jQuery.trim);

/** Tile object **/
app.factory('Tile', function(){
	// Define the constructor function.
	function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		// var self = this;
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
		this.action = '';
		this.actionList = actionList;
	}

	// Define the "instance" methods using the prototype and standard prototypal inheritance.
	Tile.prototype = {
		// Action attributes
		click: function(){
			console.log('click()');
			// console.log(this);
			if(this.actionList && this.actionList.constructor === Array && this.actionList.length > 0){
				console.log('IF()');
				//openBottomSheet
			}else{
				console.log('ELSE()');
			}
		},
		bindHTML: function(element){
			// console.log('bindHTML()');
			console.log(element);
			var html = '';
			switch(element){
				case 'switch':
					html = '<md-switch class="switch" ng-disabled="true" title="Switch position" aria-label="Switch position" ng-model="disabledModel"></md-switch>';
				break;
				case 'volume':
					html = '';
				break;
				default:
					html = '';
				break;
			}
			console.log(html);
			this.html = html;
			console.log(this);
			//return html;
		}

		/*onclick: function(){
		},
		onHold: function(){
		},
		onDBclick: function(){
		}*/
	};

	// Return constructor
	return(Tile);
});
