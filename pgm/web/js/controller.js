'use strict'
app.controller('UIController', function($scope, $timeout, $sce, $mdSidenav, $mdBottomSheet, $mdToast, UIService){
	$scope.loading = false;/*true*/
	$scope.admin = false;

	$scope.logData;
	$scope.showLogs = showLogs();

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


	$scope.expandTuile = function(obj){
		console.log('expandTuile()');
		obj.rowspan = 2;
	};


	/** Function to show Logs */
	function showLogs(){
		$scope.logData = undefined;
		return function(){
			$mdSidenav('logs').toggle().then(function(){
				// $timeout(function() {
					$scope.refreshLog();
				// }, 3000);
			});
		}
	};
	/** Function to hide Logs */
	$scope.hideLogs = function(){
		$mdSidenav('logs').close().then(function(){
			// console.log('hideLogs()');
		});
	};

	/** Function to refresh logs */
	$scope.refreshLog = function(){
		$scope.logData = undefined;
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
	// $scope.toHtml = function(html){
	// 	console.log('toHtml()');
	// 	return $sce.trustAsHtml(html);
	// };

	$scope.openBottomSheet = function(){
		$scope.alert = '';
		$mdBottomSheet.show({
			templateUrl: 'content/bottom-sheet.html',
			controller: 'BottomSheetCtrl',
			clickOutsideToClose: true
		}).then(function(clickedItem){
			$mdToast.show(
				$mdToast.simple()
				.textContent(clickedItem + ' clicked!')
				.position('top right')
				.hideDelay(1500)
			);
		});
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
		{label: 'Restart Odi', icon: 'bolt', url: ''},
		{label: 'Sleep Odi', icon: 'moon-o', url: ''},
		{label: 'Shutdown Odi', icon: 'power-off', url: ''}
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