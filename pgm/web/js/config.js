// Création du module AngularJS de l'application 
var odiUI = angular.module('odiUI', [ 'ngRoute', 'pr.longpress']);

// Configuration des routes pour chaques page de l'apllication
odiUI.config(function($routeProvider) {

	$routeProvider.when('/TTS', {
		templateUrl : 'contents/tts.html',
		controller : "TTSController"
	}).when('/Settings', {
		templateUrl : 'contents/settings.html',
		controller : "SettingsController"
	}).when('/Remote', {
		templateUrl : 'contents/remote.html',
		controller : "RemoteController"
	}).otherwise({
		redirectTo : '/TTS'
	});
});

/*angular.module('includeHtml', ['ngSanitize'])
	.controller('ExampleController', ['$scope', '$sce', function($scope, $sce){
		this.includeHtml = function(html){
		return $sce.trustAsHtml(html);
	};
}]);*/