'use strict'

/* UI Service */
app.service('UIService', ['$http', 'CONSTANTS', 'Tile', function($http, CONSTANTS, Tile){

	/** Function to update dashboard from Odi **/
	this.refreshDashboard = function(callback){
		console.log('refreshDashboard()');
		$http({
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': 'http://adrigarry.com',
				/*'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Headers':'X-Requested-With',*/
				ui: 'v3'
			},
			method: 'GET',
			url: CONSTANTS.URL_ODI + '/dashboard'
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
			//callback(activity);
		});
	};

	/** Function to send command to Odi **/
	this.sendCommand = function(obj, callback){
		// console.log('UIService.sendCommand()');
		var uri = obj.url;
		var params = '';
		$http({
			headers: {ui: 'v3', pwd: obj.data},
			method: 'POST',
			url: CONSTANTS.URL_ODI + uri + params
		}).then(function successCallback(res){
			if(res.data != null) callback(res.data);
			//return res;
		}, function errorCallback(res){
			console.error(res);
			// callback(res);
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
			headers: {ui: 'v3'},
			method: 'POST',
			url: CONSTANTS.URL_ODI + '/tts?voice=' + tts.voice + '&lg=' + tts.lg 
				+ '&msg=' + tts.msg + (tts.voicemail ? '&voicemail' : '')
		}).then(function successCallback(res){
			callback(res);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
	};

	/** Function to update logs **/
	var logSize = 100;
	this.updateLogs = function(callback){
		$http({
			headers: {ui: 'v3'},
			method: 'GET',
			url: CONSTANTS.URL_ODI + '/log?logSize=' + logSize
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
		logSize += 100;
	};

	/** Return object with dashboard tiles initialized **/
	var VALUE = 'value', ICON = 'icon', CUSTOM = 'custom';
	this.initDashboardTiles = { //Tile(id, label, color, rowspan, colspan, viewMode, value, actionList)
		mode: new Tile(1, 'Mode', 'teal', 1, 1, CUSTOM, '-',
			[{label: 'Toggle debug', icon: 'terminal', url: '/toggleDebug'},{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]),
		switch: new Tile(2, 'Switch', 'blueGrey', 1, 1, CUSTOM, '', []).bindHTML('switch'),
		volume: new Tile(3, 'Volume', 'cyan', 1, 1, CUSTOM, 'normal',
			[{label: 'Mute', url: '/mute'}]).bindHTML('volume'),
		voicemail: new Tile(4, 'Voicemail', 'indigo', 1, 1, CUSTOM, 0,
			[{label: 'Empty voicemail', icon: 'trash-o', url: '/clearVoiceMail'},{label: 'Play voicemail', icon: 'play', url: '/checkVoiceMail'}]).bindHTML('voicemail'),
		exclamation: new Tile(5, 'Exclamation', 'lime', 1, 1, ICON, 'commenting-o',
			[{label: 'Conversation', icon: 'comments-o', url: '/conversation'},{label: 'TTS', icon: 'commenting-o', url: '/tts?msg=RANDOM'},{label: 'Exclamation', icon: 'bullhorn', url: '/exclamation'},{label: 'Last TTS', icon: 'undo', url: '/lastTTS'}]),
		jukebox: new Tile(6, 'Jukebox', 'teal', 1, 1, CUSTOM, 'fip',
			[{label: 'Jukebox', icon: 'random', url: '/jukebox'},{label: 'FIP Radio', icon: 'globe', url: '/fip'}]).bindHTML('jukebox'),
		cpu: new Tile(10, 'CPU', 'lime', 1, 1, CUSTOM, {usage: 2, temp: 51},
			[{url: '/cpuTemp'}]).bindHTML('cpu'),
		weather: new Tile(11, 'Weather', 'teal', 1, 1, ICON, 'cloud',
			[{url: '/meteo'}]),
		timer: new Tile(9, 'Timer', 'orange', 1, 1, CUSTOM, 'hourglass-hald',
			[{label: 'Stop timer', icon: 'stop', url: '/timer?stop'},{label: 'Timer +1', icon: 'plus', url: '/timer'}]).bindHTML('timer'),
		date: new Tile(7, 'Date', 'blue', 1, 1, ICON, 'calendar',
			[{label: 'Odi\'s age', icon: 'birthday-cake', url: '/age'},{label: 'Today', icon: 'calendar', url: '/date'}]),
		time: new Tile(8, 'Time', 'blue', 1, 1, ICON, 'clock-o',
			[{url: '/time'}]),
		alarms: new Tile(12, 'Alarms', 'indigo', 1, 1, CUSTOM, 'bell-o',
			[{url: ''}]).bindHTML('alarms'),
		party: new Tile(13, 'Party', 'indigo', 1, 1, ICON, 'glass',
			[{url: '/setParty'}]),
		russia: new Tile(14, 'Russia', 'orange', 1, 1, ICON, 'star',
			[{label: 'Subway / Street', icon: 'subway', url: '/russia'},{label: 'Hymn', icon: 'star', url: '/russia?hymn'}]),
		idea: new Tile(15, 'Idea', 'blue', 1, 1, ICON, 'lightbulb-o',
			[{label: 'Naheulbeuk', icon: 'fort-awesome', url: '/naheulbeuk'},{label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{label: 'Test', icon: 'flag-checkered', url:'/test'}]),
		logs: new Tile(16, 'Logs', 'blueGrey', 1, 1, ICON, 'file-text-o',
			[{label: 'Voicemail History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/voicemailHistory'},{label: 'Request History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/requestHistory'}]),
		cigales: new Tile(17, 'Cigales', 'lime', 1, 1, ICON, 'bug',
			[{url: '/cigales'}]),
		system: new Tile(18, 'System', 'lightGreen', 1, 1, ICON, 'power-off',
			[{label: 'Shutdown Odi', icon: 'power-off', url: '/shutdown'},{label: 'Reboot Odi', icon: 'refresh', url: '/reboot'}]),
		about: new Tile(19, 'About', 'grey', 1, 3, CUSTOM, '', []).bindHTML('about')
	};

}]);