'use strict';
var app = angular.module('odiUI', ['ngMaterial', 'mdPickers' /*'pr.longpress'*/]);

app.constant('CONSTANTS', {
	UI_VERSION: 3.0,
	URL_ODI: 'https://odi.adrigarry.com',
	// 'DATE_TIME_REGEX': new RegExp('[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}', 'g'),
	DATE_REGEX: new RegExp('[0-9]{2}/[0-9]{2} ', 'g'),
	FILE_REGEX: new RegExp('\\[[a-zA-Z]+.(js|JS)\\] ', 'g'), //'\\[[a-zA-Z]+.(js|JS):\\d+\\] '
	// IP_REGEX: new RegExp('from (\\[(?=.*[0-9])(?=.*\\.)(?=.*\\:).*\\])', 'g'),
	IP_REGEX: new RegExp('from \\[((?=.*[0-9])(?=.*\\.)(?=.*\\:).*)\\]', 'g'),
	IP_REGEX_2: new RegExp(
		'((([0–9A-Fa-f]{1,4}:){7}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){6}:[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){5}:([0–9A-Fa-f]{1,4}:)?[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){4}:([0–9A-Fa-f]{1,4}:){0,2}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){3}:([0–9A-Fa-f]{1,4}:){0,3}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){2}:([0–9A-Fa-f]{1,4}:){0,4}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){6}((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|(([0–9A-Fa-f]{1,4}:){0,5}:((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|(::([0–9A-Fa-f]{1,4}:){0,5}((b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b).){3}(b((25[0–5])|(1d{2})|(2[0–4]d)|(d{1,2}))b))|([0–9A-Fa-f]{1,4}::([0–9A-Fa-f]{1,4}:){0,5}[0–9A-Fa-f]{1,4})|(::([0–9A-Fa-f]{1,4}:){0,6}[0–9A-Fa-f]{1,4})|(([0–9A-Fa-f]{1,4}:){1,7}:))',
		'g'
	), // IPv4 & IPv6 regex: https://sroze.io/regex-ip-v4-et-ipv6-6cc005cabe8c
	IP_LOCATION_SERVICE_URL: 'http://www.traceip.net/?query=',
	GEOLOCATION_SERVICE_URL: 'http://www.gps-coordinates.org/my-location.php?lat=$lat&lng=$lng'
});

app.config(function($mdThemingProvider) {
	$mdThemingProvider
		.theme('default')
		.primaryPalette('teal')
		.warnPalette('red');
});

/** Directive to watch scroll event 
	- restart autoRefresh
	- showFabButtons **/
app.directive('scroll', function($window) {
	return function(scope, element, attrs) {
		angular.element($window).bind('scroll', function() {
			scope.refreshDashboard();
			scope.showFabButtons();
		});
	};
});

/** Filter to format logs (link on ip address) **/
app.filter('formatLog', function(CONSTANTS) {
	return function(logLine, fullLog) {
		if (!fullLog) {
			logLine = logLine.replace(CONSTANTS.DATE_REGEX, '');
			logLine = logLine.replace(CONSTANTS.FILE_REGEX, '');
		}
		logLine = logLine.replace(CONSTANTS.IP_REGEX, function(match, capture) {
			var ip = match.substr(6, match.length - 7);
			if (ip.search(/(^192\.168\.)/g)) {
				return (
					'from [<a href="' +
					CONSTANTS.IP_LOCATION_SERVICE_URL +
					ip +
					'" title="Localize this IP" target="_blank">' +
					ip +
					'</a>]'
				);
			} else {
				return '[' + ip + ']';
			}
		});
		// logLine = logLine.replace(CONSTANTS.DATE_TIME_REGEX, function(match) {
		// 	return '<span class="timeLog">' + match + '</span>';
		// });
		return logLine;
	};
});

/** Filter to display number < 10 on 2 characters **/
app.filter('formatNumber', function() {
	return function(value, length) {
		return (1e5 + '' + value).slice(-length);
	};
});

/** Filter to display time left for timer **/
app.filter('formatTime', function($filter) {
	return function(sec) {
		var m = Math.trunc(sec / 60);
		var s = $filter('formatNumber')(sec % 60, 2);
		return m + ':' + s;
	};
});

app.filter('markdown', function($sce) {
	var converter = new Showdown.converter();
	return function(value) {
		var html = converter.makeHtml(value || '');
		return $sce.trustAsHtml(html);
	};
});
