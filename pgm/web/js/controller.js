'use strict'
app.controller('UIController', function($rootScope, $scope, $timeout, $sce, $mdSidenav,
		$mdBottomSheet, $mdToast, UIService, DashboardService){
	$scope.loading = false;/*true*/
	$scope.admin = false;

	$scope.logData;
	$scope.showLogs = showLogs();


	//$scope.tile = new Tile(1, 'TileTitle', 'orange', 1, 2, 1, [{label: 'RESTART', icon: 'bolt', url: 'url1'},{label: 'REFRESH', icon: 'refresh', url:'url2'}]);
	/*console.log($scope.tile);*/

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
					return '[<a href="https://fr.iponmap.com/' + ip 
						+ '" title="Localize this IP" target="_blank">' + ip + '</a>]';
				}else{
					// console.log('ipELSE: ' + ip);
					return '[' + ip + ']';
				}
			});
			$scope.logData = logs.split('\n');
		});
	};

	/** Function to inject HTML code */
	$scope.toHtml = function(html){
		// console.log(html);
		return $sce.trustAsHtml(html);
	};

	$scope.openBottomSheet = function(bottomSheetList){
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

	$scope.bottomSheetBtnClick = function(item){
		console.log(item);
		$mdBottomSheet.hide(item);
	};

	/*$timeout(function(){
		$scope.loading = false;
	}, 1000);*/
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

	/** Fonction de suivi d'activite */
	// utilService.monitoringActivity = function(callback){
	// 	$http({
	// 		method: 'GET',
	// 		url: 'http://odi.adrigarry.com/monitoring'
	// 	}).then(function successCallback(res){
	// 		callback(res.data);
	// 	}, function errorCallback(res){
	// 		var activity = {
	// 			mode: 'waiting',
	// 			pauseUI: false,
	// 			info: res
	// 		};
	// 		console.error(activity);
	// 		callback(activity);
	// 	});
	// };

	return UIService;
}]);

/* Dashboard Factory FACTORY // SERVICE ??? */
app.factory('DashboardService', function(Tile){
	var VALUE = 'value', ICON = 'icon', CUSTOM = 'custom';
	var DashboardService = {};

	/** Function to initialize dashboard */
	var value = 'VALUE';
	DashboardService.initTiles = { //Tile(id, label, color, rowspan, colspan, viewMode, value, actionList)
		mode: new Tile(1, 'Mode', 'teal', 1, 1, VALUE, 'Ready', [{label: 'Sleep', icon: 'moon-o', url: 'URL1'},{label: 'Restart', icon: 'bolt', url: 'URL2'}]),
		switch: new Tile(2, 'Switch', 'blueGrey', 1, 1, CUSTOM, []).bindHTML('switch'),
		volume: new Tile(3, 'Volume', 'cyan', 1, 1, CUSTOM, 'Normal', [{label: '', icon: '', url: ''}]),
		voicemail: new Tile(4, 'Voicemail', 'indigo', 1, 1, CUSTOM, '1', [{label: 'Empty voicemail', icon: 'trash-o', url: 'URL1'},{label: 'Listen messages', icon: 'voicemail', url: 'URL1'}]),
		exclamation: new Tile(5, 'Exclamation', 'lime', 1, 1, ICON, 'commenting-o', [{label: 'Conversation', icon: 'comments-o', url: ''},{label: 'TTS', icon: 'commenting-o', url: ''},{label: 'Exclamation', icon: 'bullhorn', url: ''}]),
		jukebox: new Tile(6, 'Jukebox', 'teal', 1, 1, CUSTOM, 'music', [{label: 'Jukebox', icon: 'random', url: ''},{label: 'FIP Radio', icon: 'globe', url: ''}]),
		date: new Tile(7, 'Date', 'blue', 1, 1, ICON, 'calendar', [{label: '', icon: '', url: ''}]),
		time: new Tile(8, 'Time', 'blue', 1, 1, ICON, 'clock-o', [{label: '', icon: '', url: ''}]),
		timer: new Tile(9, 'Timer', 'orange', 1, 1, CUSTOM, 'hourglass-hald', [{label: 'Stop timer', icon: 'stop', url: ''},{label: 'Increment 1', icon: 'plus', url: ''}]),
		cpu: new Tile(10, 'CPU', 'lime', 1, 1, CUSTOM, value, [{label: '', icon: '', url: ''}]),
		weather: new Tile(11, 'Weather', 'teal', 1, 1, ICON, 'cloud', [{label: '', icon: '', url: ''}]),
		alarms: new Tile(12, 'Alarms', 'indigo', 1, 1, CUSTOM, 'bell-o', [{label: '', icon: '', url: ''}]),
		party: new Tile(13, 'Party', 'indigo', 1, 1, ICON, 'glass', [{label: '', icon: '', url: ''}]),
		russia: new Tile(14, 'Russia', 'orange', 1, 1, ICON, 'star', [{label: 'Subway/Street', icon: '', url: ''},{label: 'Hymn', icon: '', url: ''}]),
		test: new Tile(15, 'Test', 'blue', 1, 1, ICON, 'flag-checkered', [{label: '', icon: '', url: ''}]),
		requestHistory: new Tile(16, 'Request History', 'blueGrey', 1, 1, ICON, 'file-text-o', [{label: '???', icon: 'file-text-o', url: ''},{label: 'Request History', icon: 'file-text-o', url: ''}]),
		cigales: new Tile(17, 'Cigales', 'lime', 1, 1, ICON, 'bug', [{label: '', icon: '', url: ''}]),
		system: new Tile(18, 'System', 'lightGreen', 1, 1, ICON, 'power-off', [{label: 'Shutdown Odi', icon: 'power-off', url: ''},{label: 'Reboot Odi', icon: 'refresh', url: ''}]),
	};

	/** Function to refresh dashboard */
	// DashboardService.refreshDashboard = function(data){
	// 	console.log('refreshDashboard()');
	// 	DashboardService.initTiles
	// };

	return DashboardService;
});