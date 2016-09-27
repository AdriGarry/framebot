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
		//this.html = '';

		// Action attributes
		//this.action = '';
		this.actionList = actionList;

		// console.log(this.actionList);
		if(this.actionList.length>0 && !this.actionList[0].hasOwnProperty('label')){
			this.actionList[0].label = this.label;
		}
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
			// console.log(element);
			var html = '';
			switch(element){
				case 'switch':
					html = '<md-switch class="switch" ng-disabled="true" title="Switch position" aria-label="Switch position" ng-model="disabledModel"></md-switch>';
					html = '<i>TEST</i>';
					break;
				case 'volume':
					html = '<i class="mainInfo fa fa-' + (this.value == 'high' ? 'volume-up' : (this.value == 'sleep' ? 'bell-slash-o' : 'volume-down')) + '"></i>';
					break;
				case 'voicemail':
					html = '<span class="mainInfo">' + this.value + '</span><i class="fa fa-envelope"></i>';
					break;
				case 'jukebox':
					html = '<i class="mainInfo fa fa-' + (this.value == 'jukebox' ? 'random' : (this.value == 'fip' ? 'globe' : 'music')) + '"></i>';
					break;
				case 'timer':
					html = '<i class="mainInfo fa fa-hourglass-half"></i>';
					break;
				case 'cpu':
					html = '<table><tr><td rowspan="2" class="mainInfo"><i class="fa fa-heartbeat"></i></td><td>';
					html += '<div class="value inline">' + this.value.usage + '<small>%</small></div></td></tr><tr><td>';
					html += '<div class="value inline">' + this.value.temp + '<small>°C</small></div></td></tr></table>';
					break;
				case 'alarms':
					html = '<i class="mainInfo fa fa-bell-o"></i>';
					break;
				default:
					html = '<i>No component specified!</i>';
				break;
			}
			this.value = html;
			return this;
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
