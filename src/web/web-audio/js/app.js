'use strict';
var app = angular.module('audioTest', []);

app.constant('CONSTANTS', {
	URL_ODI: 'https://odi.adrigarry.com'
});

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
			ctrl.recorderAvailable = true;
		} else {
			console.error('getUserMedia not supported on your browser!');
		}

		var mediaRecorder,
			audioRecord,
			chunks = [];
		function startRecorder(stream) {
			console.log('recorder started');
			gumStream = stream;

			/* use the stream */
			input = audioContext.createMediaStreamSource(stream);

			/* Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size	*/
			rec = new Recorder(input, { numChannels: 1 });

			//start the recording process
			rec.record();

			console.log('Recording started __');
		}

		ctrl.toggleRecord = function() {
			if (!ctrl.recording) {
				ctrl.recording = true;
				startRecord();
			} else {
				ctrl.recording = false;
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
			rec.stop();
			gumStream.getAudioTracks()[0].stop(); //stop microphone access
			// rec.exportWAV(createFormDataThenUpload);
			rec.exportWAV(blob => {
				var formData = new FormData();
				formData.append('audioRecord', blob);
				console.log('=====================');
				upload(formData);
			});
			console.log('recorder stopped');
		};

		// function createFormDataThenUpload(blob) {
		// 	var formData = new FormData();
		// 	formData.append('audioRecord', blob);
		// 	upload(formData);
		// 	console.log(formData);
		// }

		var upload = function(data) {
			console.log('upload function...');
			$http({
				headers: {
					'User-Interface': 'UIv5',
					// pwd: 'nn',
					'User-position': 'noPos',
					// 'Content-Type': 'application/x-www-form-urlencoded'
					// 'Content-Type': 'multipart/form-data'
					'Content-Type': undefined
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

/**
 {
 '------WebKitFormBoundaryqiVWEnGHxUGe9KLG
 Content-Disposition: form-data; name':
   '"toto"
   
   titi
   ------WebKitFormBoundaryqiVWEnGHxUGe9KLG
   Content-Disposition: form-data; name="audioRecord"; filename="2018-10-30T19:46:29.798Z"
   Content-Type: audio/wav
   
   RIFF$\u0000\u0000\u0000WAVEfmt \u0010\u0000\u0000\u0000\u0001\u0000\u0001\u0000��\
   ------WebKitFormBoundaryqiVWEnGHxUGe9KLG--'
}
*/
