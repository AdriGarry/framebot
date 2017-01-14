'use strict'
var app = angular.module('odiUI', [/*'ngRoute', */'ngMaterial', 'pr.longpress'/*, 'smDateTimeRangePicker'*/])
/*.config(function($mdThemingProvider, pickerProvider){
	pickerProvider.setOkLabel('Save');
	pickerProvider.setCancelLabel('Close');
	$mdThemingProvider.theme('default')
	.primaryPalette('deep-orange')
	.backgroundPalette('grey');
});*/

app.constant("CONSTANTS", {
	'UI_VERSION': 3.0,
	'URL_ODI': 'http://odi.adrigarry.com',
	'DATE_TIME_REGEX': new RegExp('[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}', 'g'),
	'IPV4_REGEX': new RegExp('([0-9]{1,3}.){3}([0-9]{1,3})', 'g'),
	'IPV4_REGEX': new RegExp('\\[([0-9]{1,3}.){3}([0-9]{1,3})\\]', 'g'),
	//'IP_REGEX': new RegExp('\\[((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|(([0-9A-Fa-f]{1,4}:){0,5}:((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|(::([0-9A-Fa-f]{1,4}:){0,5}((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))]', 'g'),
	//'IP_REGEX': new RegExp('([0-9]{1,3}.){3}([0-9]{1,3})', 'g'),
	'IP_LOCALIZATOR_URL': 'http://www.traceip.net/?query='
});

app.filter('formatLog', function(CONSTANTS){
	return function(logLine){
		//logLine = logLine.replace(/\[([0-9]{1,3}\.){3}([0-9]{1,3})\]/g, function(match, capture){
		logLine = logLine.replace(CONSTANTS.IPV4_REGEX, function(match, capture){
			var ip = match.substr(1,match.length-2);
			if(ip.search(/(^192\.168\.)/g)){
				return '[<a href="'+ CONSTANTS.IP_LOCALIZATOR_URL + ip + '" title="Localize this IP" target="_blank">' + ip + '</a>]';
			}else{
				return '[' + ip + ']';
			}
		});
		logLine = logLine.replace(CONSTANTS.DATE_TIME_REGEX, function(match){
			return '<span class="timeLog">' + match + '</span>';
		});
		return logLine;
	};
});

/*app.factory('DefaultTile', function($mdSidenav, $mdDialog, $mdBottomSheet){
	//console.log('DefaultTile factory this', this);
	return {
		action: function(){ // Function to refresh Tile data
			console.log('Tile action');
		}
	}
});*/

/** DefaultTile object **/
app.factory('DefaultTile', function(){
	// Tile constructor function
	function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		console.log(id, label, color, rowspan, colspan, viewMode, value, actionList);
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
	};
	// Return constructor
	return(Tile);
});


/*function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){

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
	}*/


/*app.config(['$httpProvider', function($httpProvider){
	$httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
	$httpProvider.defaults.headers.common['Access-Control-Allow-Credentials'] = 'true';
	$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = 'adrigarry.com';
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['Origin, X-Requested-With, Content-Type, Accept'];
}]);*/