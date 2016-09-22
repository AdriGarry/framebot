'use strict'
app.controller('UIController', function($scope, $timeout, $mdSidenav){
	$scope.message = 'UI V3';

	$scope.showLogs = showLogs();
	function showLogs(){
		return function(){
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('logs').toggle().then(function(){
				console.log('showLogs()');
			});
		}
	};
	$scope.hideLogs = function(){
		// Component lookup should always be available since we are not using `ng-if`
		// $timeout(function(){
		$mdSidenav('logs').close().then(function(){
			console.log('hideLogs()');
		});
		// }, 200);
	};


	$scope.tuiles = {
			mode: {
				lib: 'Mode',
				value: 'Ready',
				color: 'blue',
				rowspan : 1,
				colspan: 1
			}, switch: {
				lib: 'Switch',
				value: 1,
				color: 'blueGrey',
				rowspan : 1,
				colspan: 1
			}, volume: {
				lib: 'Volume',
				value: 'Normal',
				color: 'lime',
				rowspan : 1,
				colspan: 1
			}, tts: {
				lib: 'TTS - Exclamation',
				value: '<i>Soon available</i>',
				color: 'cyan',
				rowspan : 1,
				colspan: 2
			}, jukebox: {
				lib: 'Jukebox',
				value: '<i>Soon available</i>',
				color: 'teal',
				rowspan : 1,
				colspan: 1
			}, voiceMail: {
				lib: 'VoiceMail',
				value: 0,
				color: 'indigo',
				rowspan : 1,
				colspan: 1
			}, dateTime: {
				lib: 'Date & Time',
				value: '<i class="fa fa-3x fa-calendar"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-3x fa-clock-o"></i><br><i>Soon available</i>',
				color: 'blue',
				rowspan: 1,
				colspan: 2
			}, timer: {
				lib: 'timer',
				value: '<i class="fa fa-3x fa-hourglass"></i>',
				color: 'indigo',
				rowspan: 1,
				colspan: 1
			}, cpu: {
				lib: 'CPU',
				value: 38,
				color: 'lime',
				rowspan : 1,
				colspan: 2
			}, alarms: {
				lib: 'Alarms',
				value: '<i>Soon available</i>',
				color: 'orange',
				rowspan : 1,
				colspan: 1
			}, system: {
				lib: 'System',
				value: '<i>Soon available</i>',
				color: 'lime',
				rowspan : 1,
				colspan: 1
			}
		};


});