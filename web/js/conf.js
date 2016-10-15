'use strict'
var app = angular.module('odiUI', [/*'ngRoute', */'ngMaterial', 'pr.longpress']);

app.constant("CONSTANTS", {
	'UI_VERSION': 3.0,
	'URL_ODI': 'http://odi.adrigarry.com',
	'URL_IP_LOCALIZATOR': 'https://fr.iponmap.com/'
});

/*app.config(['$httpProvider', function($httpProvider){
	$httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
	$httpProvider.defaults.headers.common['Access-Control-Allow-Credentials'] = 'true';
	$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = 'adrigarry.com';
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['Origin, X-Requested-With, Content-Type, Accept'];
}]);*/