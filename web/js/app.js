'use strict'
var app = angular.module('odiUI', [/*'ngRoute', */'ngMaterial', /*'pr.longpress'*//*, 'smDateTimeRangePicker'*/])
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

/** Directive to watch scroll event and restart autoRefresh **/
app.directive("scroll", function ($window){
	return function(scope, element, attrs){
		angular.element($window).bind("scroll", function(){
			// scope.dashboard.autoRefresh = true;
			scope.instantRefreshDasboard();
		});
	};
});

/** Filter to format logs (link on ip address) **/
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

/** Filter to display number < 10 on 2 characters **/
// USE-> {{alarm.m | formatNumber:2}}
app.filter('formatNumber', function(){
	return function(value, length){
		return (1e5+''+value).slice(-length);
		//return value < 10 ? '0'+value : value;
	}
});

/** Filter to display time left for timer **/
// USE-> {{timerValue | formatTimeLeftTimer}}
app.filter('formatTimeLeftTimer', function(formatNumber){
	return function(sec){
		var m = Math.trunc(sec/60);
		var s = formatNumber(sec%60);
		return m+':'+s;
	}
});



