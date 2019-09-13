'use strict';

/* UI Service */
app.service('UIService', [
	'$rootScope',
	'$http',
	'$mdToast',
	'CONSTANTS',
	'Tile',
	function($rootScope, $http, $mdToast, CONSTANTS, Tile) {
		var ctrl = this;
		$rootScope.position = false;
		/** Function to update dashboard from Odi **/
		ctrl.refreshDashboard = function(callback) {
			// console.log('refreshDashboard()');
			$http({
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': 'http://adrigarry.com',
					'User-Interface': 'UIv5',
					'User-Position': $rootScope.position
				},
				method: 'GET',
				url: CONSTANTS.URL_ODI + '/dashboard'
			}).then(
				function successCallback(res) {
					callback(res.data);
				},
				function errorCallback(res) {
					// console.error(res);
					callback(res.data);
				}
			);
		};

		/** Function to pop down toast */
		ctrl.showToast = function(label) {
			$mdToast.show(
				$mdToast
					.simple()
					.textContent(label)
					.position('top right')
					.hideDelay(1500)
			);
		};
		/** Function to pop down error toast */
		ctrl.showErrorToast = function(label) {
			$mdToast.show(
				$mdToast
					.simple()
					.textContent(label)
					.position('top right')
					.hideDelay(2000)
					.toastClass('error')
			);
		};

		/** Function to retreive file from Odi */
		ctrl.getRequest = function(url, callback) {
			console.log('refreshDashboard()');
			$http({
				headers: {
					'User-Interface': 'UIv5',
					'User-position': $rootScope.position
				},
				method: 'GET',
				url: url
			}).then(
				function successCallback(res) {
					callback(res.data);
				},
				function errorCallback(res) {
					console.error(res);
				}
			);
		};

		/** Function to send command to Odi **/
		ctrl.sendCommand = function(cmd, callback) {
			// console.log('UIService.sendCommand()', cmd);
			let uri = cmd.url;
			let value = cmd.value;
			if (value !== 'object') value = { _wrapper: value };
			$http({
				headers: {
					'User-Interface': 'UIv5',
					pwd: cmd.data,
					'User-position': $rootScope.position
				},
				method: 'POST',
				url: CONSTANTS.URL_ODI + uri /*+ params*/,
				data: value
			}).then(
				function successCallback(res) {
					if (res.data != null) {
						if (cmd.toast) {
							ctrl.showToast(cmd.toast);
						} else if (cmd.label) {
							ctrl.showToast(cmd.label);
						}
						callback(res.data);
					}
				},
				function errorCallback(res) {
					ctrl.showErrorToast(cmd.label);
					console.error(res);
				}
			);
			/*var params = '';
		if(cmd.paramKey != '' && cmd.paramValue != ''){
			params = '?' + cmd.paramKey + '=' + cmd.paramValue;
		}
		$http({
			method: 'POST',
			url: 'https://odi.adrigarry.com' + cmd.url + params
		}).then(function successCallback(res){
			// console.log(res);
			// console.log(cmd.url + params);
			// callback(res);
		}, function errorCallback(res){
			console.error(res);
			// callback(res);
		});*/
			/*if(cmd.refreshActivity){
			// $scope.refreshActivity();
		}*/
		};

		/** Function to send TTS **/
		ctrl.sendTTS = function(tts, callback) {
			$http({
				headers: {
					'User-Interface': 'UIv5'
				},
				method: 'POST',
				url:
					CONSTANTS.URL_ODI +
					'/tts?voice=' +
					tts.voice +
					'&lg=' +
					tts.lg +
					'&msg=' +
					tts.msg +
					(tts.voicemail ? '&voicemail' : '')
			}).then(
				function successCallback(res) {
					ctrl.showToast(tts.msg);
					callback(res);
				},
				function errorCallback(res) {
					ctrl.showErrorToast('Error TTS');
					console.error(res);
					callback(res);
				}
			);
		};

		/** Function to update logs **/
		var logSize = 150;
		var logIncrement = 50;
		ctrl.updateLogs = function(callback) {
			$http({
				headers: {
					'User-Interface': 'UIv5',
					'User-position': $rootScope.position
				},
				method: 'GET',
				url: CONSTANTS.URL_ODI + '/log?logSize=' + logSize
			}).then(
				function successCallback(res) {
					logIncrement += logIncrement;
					logSize = logSize + logIncrement;
					callback(res.data);
				},
				function errorCallback(res) {
					console.error(res);
					callback(res);
				}
			);
		};

		navigator.geolocation.watchPosition(
			function(position) {
				// console.log('Geolocation acquired', position);
				$rootScope.position = JSON.stringify({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});
			},
			function(error) {
				if (error.code == error.PERMISSION_DENIED) {
					console.log('Geolocation not acquired!');
					// accept anyway if browser not compatible?
					setTimeout(function() {
						if (navigator.geolocation) {
							console.log('Geolocation retrying...');
							navigator.geolocation.getCurrentPosition(maPosition);
						}
					}, 2000);
				}
			}
		);
	}
]);

/* Audio record Service */
app.service('audioService', [
	'$rootScope',
	'$http',
	'UIService',
	function($rootScope, $http, UIService) {
		var ctrl = this;
		ctrl.recording = false;
		ctrl.recorderAvailable = false;

		//webkitURL is deprecated but nevertheless
		var gumStream; //stream from getUserMedia()
		var rec; //Recorder.js object
		var input; //MediaStreamAudioSourceNode we'll be recording
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		var audioContext = new AudioContext();

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			ctrl.recorderAvailable = true;
		} else {
			console.error('getUserMedia not supported on your browser!');
			UIService.showErrorToast('getUserMedia not supported on your browser!');
		}

		ctrl.startRecord = function(callback) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then(stream => {
					ctrl.recording = true;
					startRecorder(stream);
					callback(true);
				})
				.catch(err => {
					console.error('getUserMedia: ' + err);
					UIService.showErrorToast('getUserMedia: ' + err);
					callback(false);
				});
		};

		ctrl.stopRecord = function(callback) {
			if (ctrl.recording) {
				rec.stop();
				gumStream.getAudioTracks()[0].stop(); //stop microphone access
				ctrl.recording = false;
				rec.exportWAV(blob => {
					if (blob.size <= 44) {
						UIService.showErrorToast('Audio record error, reload app...');
					} else {
						let formData = new FormData();
						formData.append('audioRecord', blob);
						upload(formData);
					}
					callback(false);
				});
			}
		};

		ctrl.cancelRecord = function(callback) {
			if (rec && rec.recording) {
				rec.stop();
				gumStream.getAudioTracks()[0].stop(); //stop microphone access
				ctrl.recording = false;
				UIService.showToast('Record canceled');
			}
		};

		function startRecorder(stream) {
			gumStream = stream;

			/* use the stream */
			input = audioContext.createMediaStreamSource(stream);

			/* Create the Recorder object and configure to record mono sound (1 channel)
				Recording 2 channels will double the file size */
			rec = new Recorder(input, { numChannels: 2 });
			//start the recording process
			rec.record();
			UIService.showToast('Record started...');
		}

		function upload(data) {
			$http({
				headers: {
					'User-Interface': 'UIv5',
					'User-position': 'noPos',
					'Content-Type': undefined
				},
				method: 'POST',
				url: 'https://odi.adrigarry.com/audio',
				data: data
			}).then(
				function successCallback(res) {
					UIService.showToast('Record uploaded');
				},
				function errorCallback(res) {
					UIService.showToast('Error while uploading record');
				}
			);
		}
	}
]);
