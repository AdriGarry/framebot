'use strict'
app.controller('UIController', function($rootScope, $scope, $location, $http, $filter, $timeout, $interval, $sce, $window, $mdSidenav,
		$mdDialog, $mdBottomSheet, $mdToast, CONSTANTS, UIService/*, smDateTimePicker*/){
	$scope.loading = false;/*true*/
	$scope.pauseUI = false;
	$scope.irda = false;

	$scope.logData;
	$scope.showLogs = showLogs();

	$scope.dashboard = {
		autoRefresh: true,
		loopInterval: 0,
		loading: false,
		ttsTile: {
			label: 'TTS - Voice synthesizing',
			color: 'grey',/*lightBlue*/
			rowspan : 1,
			colspan: 3,
			voice: 'google',
			lg: 'fr',
			msg: '',
			voicemail: false,
			error: '',
			conf: {
				languageList: [{code: 'fr', label: 'French'}, {code: 'en', label: 'English'}, {code: 'ru', label: 'Russian'},
					{code: 'es', label: 'Spanish'}, {code: 'it', label: 'Italian'}, {code: 'de', label: 'German'}],
				voiceList: [{code: ':3', label: 'Nice voice'}, {code: ':1', label: 'Robot voice'}]
			},
			cleanText: function(){
				var message = $scope.dashboard.ttsTile.msg || '';
				message = message.replace(/[àâ]/g,'a');
				message = message.replace(/[ç]/g,'c');
				message = message.replace(/[èéêë]/g,'e');
				message = message.replace(/[îï]/g,'i');
				message = message.replace(/[ôóö]/g,'o');
				message = message.replace(/[ù]/g,'u');
				$scope.dashboard.ttsTile.msg = message;
			},
			submit: function(){
				if($scope.dashboard.ttsTile.msg != ''){
					UIService.sendTTS($scope.dashboard.ttsTile, function(callback){
						if(callback.status != 200){
							$scope.dashboard.ttsTile.error = 'UNE ERREUR EST SURVENUE';
						}
						else{
							$scope.showToast($scope.dashboard.ttsTile.msg);// LIMITER / TRONQUER la longueur du message !!! WWWWWWWW => 200
							$scope.dashboard.ttsTile.msg = ''; $scope.dashboard.ttsTile.error = ''; // Reinit TTS
						}
					});
				}
			}
		},
		tileList: UIService.initDashboardTiles,
		runningData: null
	};

	/** Function to refresh Dashboard **/
	$scope.refreshDashboard = function(){
		// if($scope.dashboard.autoRefresh){
			console.log('refreshDashboard()');
			$scope.dashboard.loading = true;
			UIService.refreshDashboard(function(data){
				angular.forEach(data, function(tile, key){
					switch(key){
						case 'debug':
							$scope.dashboard.debug = data.debug.value;
							//$scope.dashboard2.debug = data.debug.value;
						break;
						case 'version':
							$scope.dashboard.version = data.version.value;
							//$scope.dashboard2.version = data.version.value;
						break;
						default:
							console.log('data', data, 'data[' + key + ']', data[key]);
							$scope.dashboard.tileList[key].value = data[key].value;
							// $scope.dashboard2.tileList[key].value = data[key].value;
							$scope.dashboard.tileList[key].active = data[key].active;
							// $scope.dashboard2.tileList[key].active = data[key].active;
							$scope.dashboard.tileList[key].bindHTML(key);
					}
				});
				$scope.dashboard.runningData = data;
				console.log('$scope.dashboard.runningData', $scope.dashboard.runningData);
				$timeout(function(){$scope.dashboard.loading = false;}, 100);
			});
		// }
	};

	/** Function to reloadUI */
	$scope.reloadUI = function(){
		console.log('reloadUI');
		$timeout(function(){
			$window.location.reload();
		}, 300);
	};

	/** Function to pop down toast */
	$scope.showToast = function(label){
		$mdToast.show($mdToast.simple().textContent(label).position('top right').hideDelay(1500));
	};
	/** Function to pop down error toast */
	$scope.showErrorToast = function(label){
		$mdToast.show($mdToast.simple().textContent(label).position('top right').hideDelay(2000).toastClass('error'));
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
		UIService.updateLogs(function(logs){
			/*logs = logs.replace(/\[([0-9]{1,3}\.){3}([0-9]{1,3})\]/g, function(match, capture){
				var ip = match.substr(1,match.length-2);
				if(ip.search(/(^192\.168\.)/g)){
					return '[<a href="'+ CONSTANTS.URL_IP_LOCALIZATOR + ip + '" title="Localize this IP" target="_blank">' + ip + '</a>]';
				}else{
					return '[' + ip + ']';
				}
			});
			logs = logs.replace(new RegExp('[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}', 'g'), function(match){
				return '<span class="timeLog">' + match + '</span>';
			});*/
			$scope.logData = logs.split('\n');
		});
	};

	/** Function to send action **/
	$scope.action = function(button){
		if(button.url.indexOf('http://') > -1){
			//$window.open(button.url);
			UIService.getRequest(button.url, function(data){
				//console.log('data', data);
				$scope.showDialog({label: button.label, data: data});
			});
		}else{
			UIService.sendCommand(button, function(data){
				$scope.showToast(button.label);
			});
			// TODO test pour showErrorToast
		}
	};

	/** Function on click on Tile **/
	$scope.tileAction = function(tile){
		//console.log('tile', tile);
		if($scope.irda){
			if(tile.actionList.length>1){
				$scope.openBottomSheet(tile.actionList);
			}else if(tile.actionList.length==1){
				$scope.action(tile.actionList[0]);
			}else{
				console.log('No action affected.');
			}
		}
	}

	/** Function to open bottom sheet **/
	$scope.openBottomSheet = function(bottomSheetList){
		if($scope.irda){
			$rootScope.bottomSheetButtonList = bottomSheetList;
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'templates/bottom-sheet.html',
				controller: 'UIController',
				clickOutsideToClose: true
			}).then(function(action){
				// $scope.showToast(action.label);
			});
		}
	};

	/** Function on click on bottom sheet **/
	$scope.bottomSheetAction = function(button){
		$scope.action(button);
		$mdBottomSheet.hide(button);
	};

	/** Function to show time picker **/
	/*function showTimePicker(ev){
		$mdDialog.show({
			//templateUrl: 'temp.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: false
		});
	};*/

	/** Start auto update Dashboard (10s) **/
	$scope.refreshDashboard();
	$interval(function(){
		if($scope.dashboard.autoRefresh) $scope.dashboard.loopInterval++;
		if($scope.dashboard.loopInterval > 100){
			$scope.refreshDashboard();
			$scope.dashboard.loopInterval = 0;
		}
	}, 100);

	/** Stop auto refresh after 1 min */
	$timeout(function(){
		$scope.dashboard.autoRefresh = 'warn';
	}, 50*1000);
	$timeout(function(){
		$scope.dashboard.autoRefresh = false;
	}, 1*60*1000);

	$scope.grant = function(param){
		UIService.sendCommand({url:'/grant', data:param}, function(data){
			$scope.irda = data;
		});
	}

	/** Function to inject HTML code */
	$scope.toHtml = function(html){
		return $sce.trustAsHtml(html);
	};

	/** Function to expand Tile */
	$scope.expandTile = function(obj){
		if(obj.hasOwnProperty('rowspan')) obj.rowspan = 2;
	};

	/** Function to reduce Tile */
	$scope.reduceTile = function(obj){
		console.log(obj);
		obj.rowspan = 1;
		console.log(obj);
	};

	var param = $location.$$absUrl.split('?')[1];
	if(param) $scope.grant(param);

	$scope.showDialog = function(modal){ // TODO COMPONENT !!
		$mdDialog.show({
			controller: DialogController,
			templateUrl: 'templates/dialog.html',
			locals: {
				modal: modal
			},
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			fullscreen: false // Only for -xs, -sm breakpoints
		});
	};

	$scope.showAdminDialog = function(ev){ // TODO COMPONENT !!
		$mdDialog.show({
			controller: AdminDialogController,
			templateUrl: 'templates/dialog-admin.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints
		}).then(function(answer){
			$scope.grant(answer);
		});
	};

});
