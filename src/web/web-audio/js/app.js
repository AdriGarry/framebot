'use strict';
var app = angular.module('audioTest', []);

app.constant('CONSTANTS', {
	URL_ODI: 'https://odi.adrigarry.com'
});

// app.config(function($mdThemingProvider) {
// 	// $mdThemingProvider
// 	// 	.theme('default')
// 	// 	.primaryPalette('teal')
// 	// 	.warnPalette('red');
// });

app.controller('Controller', function($scope) {
	var ctrl = $scope;

	// ctrl.toggleRecord = function(arg) {
	// 	console.log(arg);
	// 	toggleRecording(arg);
	// };
});

const template = `
<h2>audioRecorder component</h2>
<p>Recording: {{$ctrl.recording}}</p>
<h3><button data-ng-click="$ctrl.toggleRecord()" style="background-color:{{$ctrl.recording ? 'red':'green'}}">ToggleRecord</button></h3>

`;
//data-ng-disabled="!$ctrl.recorderAvailable"

app.component('audioRecorder', {
	bindings: {
		// data: '<'
	},
	// templateUrl: 'templates/tiles.html',
	template: template,
	controller: function($http, $window) {
		var ctrl = this;
		// $rootScope.position = false;
		console.log('audioRecorder init');
		ctrl.recorderAvailable = false;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// console.log('getUserMedia supported.');
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then(stream => setupRecorder(stream))
				.catch(err => {
					console.error('salut.........');

					console.log('The following getUserMedia error occured: ' + err);
				});
		} else {
			console.log('getUserMedia not supported on your browser!');
		}

		var mediaRecorder, audioRecord, chunks;
		function setupRecorder(stream) {
			mediaRecorder = new MediaRecorder(stream);
			ctrl.recorderAvailable = true;
			ctrl.recording = false;

			mediaRecorder.ondataavailable = function(e) {
				chunks.push(e.data);
				console.log('ondataavailable:');
				console.log(e.data);
			};

			mediaRecorder.onstop = function(e) {
				console.log('data available after MediaRecorder.stop() called.');

				audioRecord = document.createElement('audio');
				audioRecord.controls = true;
				var blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
				var audioURL = window.URL.createObjectURL(blob);
				audioRecord.src = audioURL;
				console.log('recorder stopped 23');
			};

			console.log('Recorder ready');
		}

		ctrl.toggleRecord = function() {
			if (!ctrl.recording) {
				console.log('<br>starting record...');
				startRecord();
			} else {
				console.log('<br>stopping record.');
				stopRecord();
			}
		};

		var startRecord = function() {
			mediaRecorder.start();
			console.log('recorder started');
			console.log('mediaRecorder.state=' + mediaRecorder.state);
			ctrl.recording = true;
		};

		var stopRecord = function() {
			mediaRecorder.stop();
			console.log('recorder stopped');
			console.log('mediaRecorder.state=' + mediaRecorder.state);
			ctrl.recording = false;
			console.error('salut.........');
			console.log('--recorder stopped');

			// sendRecord();
		};

		var sendRecord = function() {
			console.log('sendRecord...');
			let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
			console.log(chunks);
			console.log(blob);
			chunks = [];
			// var audioURL = window.URL.createObjectURL(blob);
			// audio.src = audioURL;

			var formData = new FormData();
			formData.append('fname', 'test.wav');
			formData.append('data', blob);
			upload(formData);
		};

		var upload = function(data) {
			$http({
				headers: {
					'User-Interface': 'UIv5',
					pwd: cmd.data,
					'User-position': 'noPos'
				},
				method: 'POST',
				url: 'http://odi.adrigarry.com/audio',
				data: data
			}).then(
				function successCallback(res) {
					console.log('REQUEST OK !!');
					console.log(res);
				},
				function errorCallback(res) {
					console.log('ERROR REQUEST:');
					console.log(res);
				}
			);
		};
	}
});

angular.element(document).ready(function() {
	(function() {
		if (!console) {
			console = {};
		}
		var oldLog = console.log;
		var logs = document.getElementById('logs');
		// console.log(logs);
		console.log = function(message) {
			if (typeof message == 'object') {
				logs.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br>';
			} else {
				logs.innerHTML += message + '<br>';
			}
			oldLog(message);
		};
		var oldError = console.error;
		var logs = document.getElementById('logs');
		// console.log(logs);
		console.error = function(message) {
			if (typeof message == 'object') {
				logs.innerHTML +=
					'<i>ERR: ' + (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '</i><br>';
			} else {
				logs.innerHTML += '<i>ERR: ' + message + '</i><br>';
			}
			oldError(message);
		};
	})();
});
