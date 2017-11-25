'use strict'

/* UI Service */
app.service('UIService', ['$http', '$mdToast', 'CONSTANTS', 'Tile', function($http, $mdToast, CONSTANTS, Tile){

	/** Function to update dashboard from Odi **/
	this.refreshDashboard = function(callback){
		// console.log('refreshDashboard()');
		$http({
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': 'http://adrigarry.com',
				'User-Interface': 'UIv5'
			},
			method: 'GET',
			url: CONSTANTS.URL_ODI + '/dashboard'
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			// console.error(res);
			callback(res.data);
		});
	};

	/** Function to retreive file from Odi */
	this.getRequest = function(url, callback){
		console.log('refreshDashboard()');
		$http({
			headers: {'User-Interface': 'UIv5'},
			method: 'GET',
			url: url
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
		});
	};

	/** Function to send command to Odi **/
	this.sendCommand = function(cmd, callback){
		// console.log('UIService.sendCommand()', cmd);
		var uri = cmd.url;
		$http({
			headers: {'User-Interface': 'UIv5', pwd: cmd.data},
			method: 'POST',
			url: CONSTANTS.URL_ODI + uri /*+ params*/,
			data: cmd.params
		}).then(function successCallback(res){
			if(res.data != null){
				if(cmd.toast){
					$mdToast.show($mdToast.simple().textContent(cmd.toast).position('top right').hideDelay(1500));
				}else if(cmd.label){
					$mdToast.show($mdToast.simple().textContent(cmd.label).position('top right').hideDelay(1500));
				}
				callback(res.data);
			}
		}, function errorCallback(res){
			$mdToast.show($mdToast.simple().textContent(cmd.label).position('top right').hideDelay(2500).toastClass('error'));
			console.error(res);
		});
		/*var params = '';
		if(cmd.paramKey != '' && cmd.paramValue != ''){
			params = '?' + cmd.paramKey + '=' + cmd.paramValue;
		}
		$http({
			method: 'POST',
			url: 'http://odi.adrigarry.com' + cmd.url + params
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
	this.sendTTS = function(tts, callback){
		$http({
			headers: {'User-Interface': 'UIv5'},
			method: 'POST',
			url: CONSTANTS.URL_ODI + '/tts?voice=' + tts.voice + '&lg=' + tts.lg 
				+ '&msg=' + tts.msg + (tts.voicemail ? '&voicemail' : '')
		}).then(function successCallback(res){
			$mdToast.show($mdToast.simple().textContent(tts.msg).position('top right').hideDelay(1500));
			callback(res);
		}, function errorCallback(res){
			$mdToast.show($mdToast.simple().textContent('Error TTS').position('top right').hideDelay(2500).toastClass('error'));
			console.error(res);
			callback(res);
		});
	};

	/** Function to update logs **/
	var logSize = 100; var logIncrement = 10;
	this.updateLogs = function(callback){
		$http({
			headers: {'User-Interface': 'UIv5'},
			method: 'GET',
			url: CONSTANTS.URL_ODI + '/log?logSize=' + logSize
		}).then(function successCallback(res){
			logIncrement += logIncrement;
			logSize = logSize+logIncrement;
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
	};
}]);