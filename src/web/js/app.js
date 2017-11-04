'use strict'
var app = angular.module('odiUI', ['ngMaterial', 'mdPickers' /*'pr.longpress'*/])

app.constant("CONSTANTS", {
	'UI_VERSION': 3.0,
	'URL_ODI': 'http://odi.adrigarry.com',
	'DATE_TIME_REGEX': new RegExp('[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}', 'g'),
	'IP_REGEX': new RegExp('(\\[(?=.*[0-9])(?=.*\\.)(?=.*\\:).*\\])', 'g'),
	'IP_LOCALIZATOR_URL': 'http://www.traceip.net/?query='
});

app.config(function($mdThemingProvider){
	$mdThemingProvider.theme('default')
	.primaryPalette('teal')
	.warnPalette('red');
});

/** Directive to watch scroll event 
	- restart autoRefresh
	- showFabButtons **/
app.directive("scroll", function ($window){
	return function(scope, element, attrs){
		angular.element($window).bind("scroll", function(){
			scope.refreshDashboard();
			scope.showFabButtons();
		});
	};
});

/** Filter to format logs (link on ip address) **/
app.filter('formatLog', function(CONSTANTS){
	return function(logLine){
		logLine = logLine.replace(CONSTANTS.IP_REGEX, function(match, capture){
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
app.filter('formatNumber', function(){
	return function(value, length){
		return (1e5+''+value).slice(-length);
	}
});

/** Filter to display time left for timer **/
app.filter('formatTime', function($filter){
	return function(sec){
		var m = Math.trunc(sec/60);
		var s = $filter('formatNumber')(sec%60, 2);
		return m+':'+s;
	}
});

// /** Filter to display x worlds of a string **/ // NOT USED
// app.filter('words', function () {
// 	return function (input, words) {
// 		if(isNaN(words)) return input;
// 		if(words <= 0) return '';
// 		if(input){
// 			var inputWords = input.split(/\s+/);
// 			if(inputWords.length > words){
// 				input = inputWords.slice(0, words).join(' ') + '…';
// 			}
// 		}
// 		return input;
// 	};
// });