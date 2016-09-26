'use strict'
app.controller('UIController', function($scope, $timeout, $sce, $mdSidenav, $mdBottomSheet, $mdToast, UIService, Tile){
	$scope.loading = false;/*true*/
	$scope.admin = false;

	$scope.logData;
	$scope.showLogs = showLogs();


	$scope.object = new Tile();
	console.log($scope.object);

	/** Function to pop down toast */
	$scope.showToast = function(label) {
		$mdToast.show(
			$mdToast.simple()
			.textContent(label)
			.position('top right')
			.hideDelay(1500)
		);
	};

	$scope.ttsTuile = {
		lib: 'TTS - Voice synthesizing',
		value: '...',
		color: 'blue',
		rowspan : 1,
		colspan: 3
	};
	$scope.tts = {
		voice: ':3'
	};


	/** Function to expand Tile */
	$scope.expandTile = function(obj){
		obj.rowspan = 2;
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
						+ '" title="Localize this IP" target="_blank">' + ip + '<a/>]';
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
		return $sce.trustAsHtml(html);
	};

	$scope.openBottomSheet = function(){
		if($scope.admin){
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'content/bottom-sheet.html',
				controller: 'BottomSheetCtrl',
				clickOutsideToClose: true
			}).then(function(clickedItem){
				$scope.showToast(clickedItem + ' clicked!');
			});
		}
	};


	/*$timeout(function(){
		$scope.loading = false;
	}, 1000);*/
});


app.controller('BottomSheetCtrl', function($scope, $mdBottomSheet){

	$scope.listItemClick = function(item){
		console.log(item);
		$mdBottomSheet.hide(item);
	};

	$scope.buttons = [
		{label: 'Shutdown Odi', icon: 'power-off', url: ''},
		{label: 'Sleep Odi', icon: 'moon-o', url: ''},
		{label: 'Restart Odi', icon: 'bolt', url: ''}
	];
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