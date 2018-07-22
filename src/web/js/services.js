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
				headers: { 'User-Interface': 'UIv5', 'User-position': $rootScope.position },
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
			var uri = cmd.url;
			$http({
				headers: { 'User-Interface': 'UIv5', pwd: cmd.data, 'User-position': $rootScope.position },
				method: 'POST',
				url: CONSTANTS.URL_ODI + uri /*+ params*/,
				data: cmd.params
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
				headers: { 'User-Interface': 'UIv5' },
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
		var logSize = 100;
		var logIncrement = 10;
		ctrl.updateLogs = function(callback) {
			$http({
				headers: { 'User-Interface': 'UIv5', 'User-position': $rootScope.position },
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
				console.log('Geolocation acquired', position);
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
