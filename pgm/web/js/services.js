'use strict'

/* UI Service */
app.service('UIService', ['$http', function($http){

	/** Function to get logs */
	var logSize = 100;
	this.getLogs = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/log?logSize=' + logSize
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
		logSize += 50;
	};

	/** Function to send command to Odi */
	this.sendCommand = function(obj, callback){
		console.log('UIService.sendCommand()');
		var uri = obj.url;
		var params = '';
		$http({
			method: 'POST',
			url: 'http://odi.adrigarry.com' + uri + params
		}).then(function successCallback(res){
			// console.log(res);// console.log(cmd.url + params);
			// callback(res);
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
}]);

/* Dashboard Service */
app.service('DashboardService', function($http, Tile){
	var VALUE = 'value', ICON = 'icon', CUSTOM = 'custom';

	/** Function to initialize dashboard */
	this.initTiles = { //Tile(id, label, color, rowspan, colspan, viewMode, value, actionList)
		mode: new Tile(1, 'Mode', 'teal', 1, 1, CUSTOM, '-',
			[{label: 'Sleep', icon: 'moon-o', url: '/sleep'},{label: 'Restart', icon: 'bolt', url: '/odi'}]),
		switch: new Tile(2, 'Switch', 'blueGrey', 1, 1, CUSTOM, '', []).bindHTML('switch'),
		volume: new Tile(3, 'Volume', 'cyan', 1, 1, CUSTOM, 'normal',
			[{url: '/mute'}]).bindHTML('volume'),
		voicemail: new Tile(4, 'Voicemail', 'indigo', 1, 1, CUSTOM, '1',
			[{label: 'Empty voicemail', icon: 'trash-o', url: '/clearVoiceMail'},{label: 'Listen messages', icon: 'voicemail', url: '/checkVoiceMail'}]).bindHTML('voicemail'),
		exclamation: new Tile(5, 'Exclamation', 'lime', 1, 1, ICON, 'commenting-o',
			[{label: 'Conversation', icon: 'comments-o', url: '/conversation'},{label: 'TTS', icon: 'commenting-o', url: '/tts?msg=RANDOM'},{label: 'Exclamation', icon: 'bullhorn', url: '/exclamation'},{label: 'Last TTS', icon: 'undo', url: '/lastTTS'}]),
		jukebox: new Tile(6, 'Jukebox', 'teal', 1, 1, CUSTOM, 'fip',
			[{label: 'Jukebox', icon: 'random', url: '/jukebox'},{label: 'FIP Radio', icon: 'globe', url: '/fip'}]).bindHTML('jukebox'),
		date: new Tile(7, 'Date', 'blue', 1, 1, ICON, 'calendar',
			[{url: '/date'}]),
		time: new Tile(8, 'Time', 'blue', 1, 1, ICON, 'clock-o',
			[{url: '/time'}]),
		timer: new Tile(9, 'Timer', 'orange', 1, 1, CUSTOM, 'hourglass-hald',
			[{label: 'Stop timer', icon: 'stop', url: ''},{label: 'Increment 1', icon: 'plus', url: '/timer'}]).bindHTML('timer'),
		cpu: new Tile(10, 'CPU', 'lime', 1, 1, CUSTOM, {usage: 2, temp: 51},
			[{url: '/cpuTemp'}]).bindHTML('cpu'),
		weather: new Tile(11, 'Weather', 'teal', 1, 1, ICON, 'cloud',
			[{url: '/meteo'}]),
		alarms: new Tile(12, 'Alarms', 'indigo', 1, 1, CUSTOM, 'bell-o',
			[{url: ''}]).bindHTML('alarms'),
		party: new Tile(13, 'Party', 'indigo', 1, 1, ICON, 'glass',
			[{url: '/setParty'}]),
		russia: new Tile(14, 'Russia', 'orange', 1, 1, ICON, 'star',
			[{label: 'Subway / Street', icon: 'subway', url: '/russia'},{label: 'Hymn', icon: 'star', url: '/russia?hymn'}]),
		test: new Tile(15, 'Test', 'blue', 1, 1, ICON, 'lightbulb-o',
			[{label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{label: 'Test', icon: 'flag-checkered', url:'/test'}]),
		requestHistory: new Tile(16, 'Request History', 'blueGrey', 1, 1, ICON, 'file-text-o',
			[{label: '???', icon: 'file-text-o', url: ''},{label: 'Request History', icon: 'file-text-o', url: '/requestHistory'}]),
		cigales: new Tile(17, 'Cigales', 'lime', 1, 1, ICON, 'bug',
			[{url: '/cigales'}]),
		system: new Tile(18, 'System', 'lightGreen', 1, 1, ICON, 'power-off',
			[{label: 'Shutdown Odi', icon: 'power-off', url: '/shutdown'},{label: 'Reboot Odi', icon: 'refresh', url: '/reboot'}]),
		about: new Tile(19, 'About', 'lightGreen', 1, 2, VALUE, 'Hi, I\'m Odi !', [])
	};


	/** Function to update dashboard from Odi */
	this.refresh = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/dashboard'
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			/*var activity = {mode: 'waiting',pauseUI: false,info: res};*/
			console.log(activity);
			callback(activity);
		});
	};
});