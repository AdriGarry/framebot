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

app.controller('Controller', function($rootScope, $scope) {
	var ctrl = $scope;
});

const template = `
<h3>audioRecorder component</h3>
<p>Recording: {{$ctrl.recording}}</p>
<button data-ng-click="$ctrl.toggleRecord()" style="background-color:{{$ctrl.recording ? 'red':'green'}}"><h3>ToggleRecord</h3></button>
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
		ctrl.recording = false;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// console.log('getUserMedia supported.');
			ctrl.recorderAvailable = true;
			// navigator.mediaDevices
			// 	.getUserMedia({ audio: true })
			// 	.then(stream => setupRecorder(stream))
			// 	.catch(err => {
			// 		console.error('The following getUserMedia error occured: ' + err);
			// 	});
		} else {
			console.error('getUserMedia not supported on your browser!');
		}

		var mediaRecorder,
			audioRecord,
			chunks = [];
		function startRecorder(stream) {
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.start();
			console.log('recorder started');
			console.log('mediaRecorder.state=' + mediaRecorder.state);

			mediaRecorder.ondataavailable = function(e) {
				console.log('ondataavailable:');
				chunks.push(e.data);
				console.error('chunks updated');
			};

			mediaRecorder.onstop = function(e) {
				console.log('data available after MediaRecorder.stop() called.');
				console.log(e);
				// console.log('1.mediaRecorder.requestData()');
				// // mediaRecorder.requestData();
				audioRecord = document.createElement('audio');
				audioRecord.controls = true;
				var blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
				var audioURL = window.URL.createObjectURL(blob);
				audioRecord.src = audioURL;
				console.log('blob');

				let formData = new FormData();
				formData.append('fname', 'test.wav');
				formData.append('data', blob);
				console.log('formData');
				upload(formData);
				console.log('uploaded ?');
			};
		}

		ctrl.toggleRecord = function() {
			if (!ctrl.recording) {
				ctrl.recording = true;
				// console.log('<br>starting record...');
				startRecord();
			} else {
				ctrl.recording = false;
				// console.log('<br>stopping record.');
				stopRecord();
			}
		};

		var startRecord = function() {
			console.log('<br>startRecord()');
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then(stream => startRecorder(stream))
				.catch(err => {
					console.error('The following getUserMedia error occured: ' + err);
				});
		};

		var stopRecord = function() {
			console.log('<br>stopRecord()');
			mediaRecorder.stop();
			console.log('recorder stopped');
			console.log('mediaRecorder.state=' + mediaRecorder.state);
			// sendRecord();
		};

		// var sendRecord = function() {
		// 	console.log('sendRecord...');
		// 	let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
		// 	console.log(chunks);
		// 	console.log(blob);
		// 	chunks = [];
		// 	// var audioURL = window.URL.createObjectURL(blob);
		// 	// audio.src = audioURL;

		// 	var formData = new FormData();
		// 	formData.append('fname', 'test.wav');
		// 	formData.append('data', blob);
		// 	upload(formData);
		// };

		var upload = function(data) {
			console.log('upload function...');
			$http({
				headers: {
					'User-Interface': 'UIv5',
					pwd: 'nn',
					'User-position': 'noPos'
				},
				method: 'POST',
				url: 'https://odi.adrigarry.com/audio',
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
	if (!console) console = {};
	var oldLog = console.log;
	var logs = document.getElementById('logs');
	console.log = function(message) {
		if (typeof message == 'object') {
			logs.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br>';
		} else {
			logs.innerHTML += message + '<br>';
		}
		oldLog(message);
	};
	var oldError = console.error;
	console.error = function(message) {
		if (typeof message == 'object') {
			logs.innerHTML +=
				'<i><b>ERR: ' + (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '</b></i><br>';
		} else {
			logs.innerHTML += '<i><b>ERR: ' + message + '</b></i><br>';
		}
		oldError(message);
	};
	// console.log('console initialized');
});
