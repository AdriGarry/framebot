// Création du module AngularJS de l'application 
var odiUI = angular.module('odiUI', [ 'ngRoute', 'ngAnimate']);

// Configuration des routes pour chaques page de l'apllication
odiUI.config(function($routeProvider) {

	$routeProvider.when('/TTS', {
		templateUrl : 'contents/tts.html',
		controller : "TTSController"
	}).when('/VoiceMail', {
		templateUrl : 'contents/voiceMail.html',
		controller : "VoiceMailController"
	}).when('/Remote', {
		templateUrl : 'contents/remote.html',
		controller : "RemoteController"
	}).otherwise({
		redirectTo : '/TTS'
	});
});
