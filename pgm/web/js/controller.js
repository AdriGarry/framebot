'use strict'
app.controller('UIController', function($rootScope, $scope, $timeout, $sce, $mdSidenav,
		$mdBottomSheet, $mdToast, UIService, DashboardService){
	$scope.loading = false;/*true*/
	$scope.admin = false;

	$scope.logData;
	$scope.showLogs = showLogs();

	$scope.dashboard = {
		mode: '',
		loading: false,
		tileList: DashboardService.initTiles
	};

	$scope.ttsTile = {
		lib: 'TTS - Voice synthesizing',
		value: '...',
		color: 'blue',
		rowspan : 1,
		colspan: 3
	};
	$scope.tts = {
		voice: ':3'
	};

	/** Function to pop down toast */
	$scope.showToast = function(label) {
		$mdToast.show($mdToast.simple().textContent(label).position('top right').hideDelay(1500));
	};

	/** Function to expand Tile */
	$scope.expandTile = function(obj){
		if(obj.hasOwnProperty('rowspan')) obj.rowspan = 2;
	};
	/** Function to reduce Tile */
	$scope.reduceTile = function(obj){
		console.log('reduceTile');
		console.log(obj);
		obj.rowspan = 1;
		console.log(obj);
	};

	/** Function to show Logs */
	function showLogs(){
		$scope.logData = undefined;
		return function(){
			$mdSidenav('logs').toggle().then(function(){
				$scope.refreshLog();
			});
		}
	};
	/** Function to hide Logs */
	$scope.hideLogs = function(){
		$mdSidenav('logs').close().then(function(){});
	};
	/** Function to refresh logs */
	$scope.refreshLog = function(){
		//$scope.logData = undefined;
		//$scope.showToast('Logs');
		console.log('refreshing logs');
		var ipRegex = '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
		UIService.getLogs(function(logs){
			// var ipRegex = new RegExp("\\[([0-9]{1,3}\\.){3}([0-9]{1,3})\\]","g");
			logs = logs.replace(/\[([0-9]{1,3}\.){3}([0-9]{1,3})\]/g, function(match, capture){
				var ip = match.substr(1,match.length-2);
				if(ip.search(/(^192\.168\.)/g)){
					return '[<a href="https://fr.iponmap.com/' + ip + '" title="Localize this IP" target="_blank">' + ip + '</a>]';
				}else{
					// console.log('ipELSE: ' + ip);
					return '[' + ip + ']';
				}
			});
			$scope.logData = logs.split('\n');
		});
	};




	/** Function to refresh Dashboard **/
	$scope.refreshDashboard = function(){
		console.log('refreshDashboard()');
		DashboardService.refresh(function(data){
			console.log('AAA');
			$scope.dashboard.loading = true;
			// $scope.dashboard.tileList;
			angular.forEach(data, function(tile, key){
				console.log(key);
				//console.log(tile);
				console.log($scope.dashboard.tileList[key]);
				if($scope.dashboard.tileList[key]) $scope.dashboard.tileList[key].value = data[key].value;
				//tile.value = 
				//this.push(key + ': ' + value);
			});//, log
		});
	}
	/** Function on click on Tile **/
	$scope.tileAction = function(tile){
		// console.log('tileAction()');
		console.log(tile.actionList);
		if(tile.actionList.length>1){
			$scope.openBottomSheet(tile.actionList);
		}else{
			$scope.action(tile.actionList[0]);
		}
	}
	/** Function to open bottom sheet **/
	$scope.openBottomSheet = function(bottomSheetList){
		// console.log('openBottomSheet()');
		if($scope.admin){
			$rootScope.bottomSheetButtonList = bottomSheetList;
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'content/bottom-sheet.html',
				controller: 'UIController',
				clickOutsideToClose: true
			}).then(function(action){
				$scope.showToast(action.label);
			});
		}
	};
	/** Function on click on bottom sheet **/
	$scope.bottomSheetAction = function(button){
		console.log('bottomSheetAction()');
		console.log(button);
		$scope.action(button);
		$mdBottomSheet.hide(button);
	};
	/** Function to send action **/
	$scope.action = function(button){
		UIService.sendCommand(button);
	};

	/** Function to inject HTML code */
	$scope.toHtml = function(html){
		// console.log(html);
		return $sce.trustAsHtml(html);
	};

	$scope.refreshDashboard();
	/*$timeout(function(){
		$scope.loading = false;
	}, 1000);*/
});


/* UIFactory FACTORY // SERVICE ??? */
app.factory('UIService', ['$http', function($http){

	var UIService = {};

	/** Function to get logs */
	var logSize = 100;
	UIService.lib = '';
	UIService.getLogs = function(callback){
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
	UIService.sendCommand = function(obj, callback){
		console.log('UIService.sendCommand()');
		console.log(obj);
		var uri = obj.url;
		console.log(uri);
		var params = '';
		$http({
			method: 'POST',
			url: 'http://odi.adrigarry.com' + uri + params
		}).then(function successCallback(res){
			// console.log(res);
			// console.log(cmd.url + params);
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

	return UIService;
}]);

/* Dashboard Factory FACTORY // SERVICE ??? */
app.factory('DashboardService', function($http, Tile){
	var VALUE = 'value', ICON = 'icon', CUSTOM = 'custom';
	var DashboardService = {};

	/** Function to initialize dashboard */
	var value = 'VALUE';
	DashboardService.initTiles = { //Tile(id, label, color, rowspan, colspan, viewMode, value, actionList)
		mode: new Tile(1, 'Mode', 'teal', 1, 1, VALUE, '',
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
			[{label: 'Subway/Street', icon: '', url: ''},{label: 'Hymn', icon: '', url: '/russia'}]),
		test: new Tile(15, 'Test', 'blue', 1, 1, ICON, 'lightbulb-o',
			[{label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{label: 'Test', icon: 'flag-checkered', url:'/test'}]),
		requestHistory: new Tile(16, 'Request History', 'blueGrey', 1, 1, ICON, 'file-text-o',
			[{label: '???', icon: 'file-text-o', url: ''},{label: 'Request History', icon: 'file-text-o', url: '/requestHistory'}]),
		cigales: new Tile(17, 'Cigales', 'lime', 1, 1, ICON, 'bug',
			[{url: '/cigales'}]),
		system: new Tile(18, 'System', 'lightGreen', 1, 1, ICON, 'power-off',
			[{label: 'Shutdown Odi', icon: 'power-off', url: '/shutdown'},{label: 'Reboot Odi', icon: 'refresh', url: '/reboot'}]),
		about: new Tile(19, 'About', 'lightGreen', 1, 1, VALUE, '', [])
	};


	/** Function to update dashboard from Odi */
	DashboardService.refresh = function(callback){
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


	/** Function to refresh dashboard */
	// DashboardService.refreshDashboard = function(data){
	// 	console.log('refreshDashboard()');
	// 	DashboardService.initTiles
	// };

	return DashboardService;
});

/*app.controller('BottomSheetCtrl', function($scope, $mdBottomSheet){
	$scope.listItemClick = function(item){
		console.log(item);
		$mdBottomSheet.hide(item);
	};
	$scope.buttons = [
		{label: 'Shutdown Odi', icon: 'power-off', url: ''},
		{label: 'Sleep Odi', icon: 'moon-o', url: ''},
		{label: 'Restart Odi', icon: 'bolt', url: ''}
	];
});*/