'use strict'
/** Objects **/

/** Tile object **/
app.factory('Tile', function(){
	// Tile constructor function
	function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){

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
		if(this.actionList.length>0 && !this.actionList[0].hasOwnProperty('label')) this.actionList[0].label = this.label;
	}

	// Tile object own properties
	Tile.prototype = {
		/*onHold: function(element){
			console.log('onHold()');
			console.log(element);
		}*/
		bindHTML: function(element){
			var html = '';
			switch(element){
				case 'mode':
					// if(!isNaN(this.value)){
					console.log('this.value.switch', this.value.switch);
					if(this.value.switch){
						html = '<i class="modeSwitch fa fa-rotate-270 fa-2x fa-toggle-on"></i>';
					}else{
						html = '<i class="modeSwitch fa fa-rotate-270 fa-2x fa-toggle-off"></i>';
					}
					if(this.value.mode == 'Sleep'){
						html += '<i class="mainInfo fa fa-moon-o"></i>';
						if(this.value.param < 255) html += '&nbsp;' + this.value.param;
					}else{
						html += '<span class="mode">' + this.value.mode
						+ '<small><span class="desktopOnlyInline">since </span>' + this.value.param + '</small></span>';
					}
					break;
				case 'switch':
					if(this.value){
						html = '<md-switch class="desktopZoom switch md-primary ng-valid md-checked ng-not-empty ng-dirty ng-valid-parse ng-touched" md-no-ink="" aria-label="Switch No Ink" tabindex="0" type="checkbox" role="checkbox" aria-checked="true" aria-invalid="false"><div class="md-container" style="touch-action: pan-x;"><div class="md-bar"></div><div class="md-thumb-container"><div class="md-thumb" md-ink-ripple="" md-ink-ripple-checkbox=""></div></div></div></md-switch>';
					}else{
						html = '<md-switch class="desktopZoom switch md-primary ng-valid ng-dirty ng-valid-parse ng-touched ng-empty" md-no-ink="" aria-label="Switch No Ink" tabindex="0" type="checkbox" role="checkbox" aria-checked="false" aria-invalid="false"><div class="md-container" style="touch-action: pan-x;"><div class="md-bar"></div><div class="md-thumb-container"><div class="md-thumb" md-ink-ripple="" md-ink-ripple-checkbox=""></div></div></div></md-switch>';
					}
					break;
				case 'volume':
					html = '<i class="mainInfo fa fa-' + (this.value == 'high' ? 'volume-up' : (this.value == 'mute' ? 'bell-slash-o' : 'volume-down')) + '"></i>';
					break;
				case 'voicemail':
					html = '<span class="mainInfo">' + this.value + '</span>&nbsp;<i class="fa fa-'
						+ (this.value > 0 ? 'envelope' : 'envelope-o') + '"></i>';
					break;
				case 'jukebox':
					html = '<i class="mainInfo fa fa-' + (this.value == 'jukebox' ? 'random' : (this.value == 'fip' ? 'globe' : 'music')) + '"></i>';
					break;
				case 'timer':
					html = '<i class="mainInfo fa fa-hourglass-half"></i>';
					if(this.value > 0) html += '&nbsp;' + Math.trunc(this.value/60) + ':' + (this.value%60 < 10 ? ('0' + this.value%60) : this.value%60);
					break;
				case 'cpu':
					html = '<table class="cpu"><tr><td><i class="mainInfo fa fa-microchip"></i>&nbsp;';
					html += '<div class="value inline">' + this.value.usage + '<small>%</small></div></td>';
					html += '<td><i class="mainInfo fa fa-thermometer-half"></i>&nbsp;<div class="value inline">' 
					+ this.value.temp + '<small>°C</small></div></td></tr></table>';
					break;
				case 'alarms':
					html = '<table class="alarms"><tr><td><i class="mainInfo fa fa-bell-o"></i></td><td><table>';
					var dayList = this.value, d = new Date().getDay();
					Object.keys(dayList).forEach(function(key,index){//key: the name of the object key && index: the ordinal position of the key within the object 
						//console.log(key, index, dayList[key].d);// A SUPPRIMER
						if(dayList[key].d && dayList[key].d.indexOf(d) > -1){
							html += '<tr><td><small class="value">' + dayList[key].h + ':' + (dayList[key].m<10?'0':'') + dayList[key].m;
							if(typeof dayList[key].mode === 'string') html += dayList[key].mode.charAt(0);
							html += '</td></tr>';
						}
					});
					html += '</table></td></tr></table>';
					break;
				case 'about':
					html = '<p class="responsive">Hi,<br> I\'m Odi !</p>';
					break;
				default:
					html = '<i>No component specified!</i>';
				break;
			}
			this.html = html;
			return this;
		}
	};
	// Return constructor
	return(Tile);
});
