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

		//webkitURL is deprecated but nevertheless
		URL = window.URL || window.webkitURL;
		var gumStream; //stream from getUserMedia()
		var rec; //Recorder.js object
		var input; //MediaStreamAudioSourceNode we'll be recording
		// shim for AudioContext when it's not avb.
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		var audioContext = new AudioContext(); //new audio context to help us record

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
			// mediaRecorder = new MediaRecorder(stream);
			// mediaRecorder.start();
			console.log('recorder started');
			// console.log('mediaRecorder.state=' + mediaRecorder.state);
			gumStream = stream;

			/* use the stream */
			input = audioContext.createMediaStreamSource(stream);

			/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
			*/
			rec = new Recorder(input, { numChannels: 1 });

			//start the recording process
			rec.record();

			console.log('Recording started __');
		}

		// mediaRecorder.ondataavailable = function(e) {
		// 	console.log('ondataavailable:');
		// 	chunks.push(e.data);
		// 	console.log('chunks updated');
		// };

		// mediaRecorder.onstop = function(e) {
		// 	console.log('data available after MediaRecorder.stop() called.');
		// 	console.log(e);
		// 	// console.log('1.mediaRecorder.requestData()');
		// 	// mediaRecorder.requestData();
		// 	// audioRecord = document.createElement('audio');
		// 	// audioRecord.controls = true;
		// 	var blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
		// 	// var audioURL = window.URL.createObjectURL(blob);
		// 	// audioRecord.src = audioURL;
		// 	console.log('blob');
		// 	console.log(blob);

		// 	let formData = new FormData();
		// 	formData.append('fname', 'test.wav');
		// 	formData.append('data', blob);
		// 	console.log('formData');
		// 	console.log(formData);
		// 	upload(formData);
		// 	// upload('formData22');
		// 	console.log('uploaded ?');
		// };
		// }

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
			// mediaRecorder.stop();
			rec.stop();

			//stop microphone access
			// gumStream.getAudioTracks()[0].stop();

			//create the wav blob and pass it on to createDownloadLink
			rec.exportWAV(createFormDataThenUpload);

			console.log('recorder stopped');
		};

		function createFormDataThenUpload(blob) {
			var filename = new Date().toISOString(); //filename to send to server without extension
			var formData = new FormData();
			formData.append('audio_data', blob, filename);

			// xhr.open('POST', 'upload.php', true);
			// xhr.send(fd);
			upload(formData);
			console.log(formData);
		}

		var upload = function(data) {
			console.log('upload function...');
			$http({
				headers: {
					'User-Interface': 'UIv5',
					pwd: 'nn',
					'User-position': 'noPos',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				url: 'https://odi.adrigarry.com/audio',
				data: data
			}).then(
				function successCallback(res) {
					console.log('<b>REQUEST OK !!</b>');
					// console.log(res);
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
