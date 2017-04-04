'use strict'
app.controller('UIController', function($rootScope, $scope, $location, $http, $filter, $timeout, $interval, $sce, $window, $mdSidenav,
		$mdDialog, $mdBottomSheet, $mdToast, CONSTANTS, UIService/*, smDateTimePicker*/){
	$scope.loading = false;/*true*/
	$scope.pauseUI = false;
	$scope.irda = false;
	$scope.menuOpen = false;

	$scope.logData;

	$scope.master = Math.floor(Math.random() * 100);

	$scope.dashboard = {
		odiState: setOdiState(),
		autoRefresh: true,
		//loopInterval: 0,
		loading: false,
		/*ttsTile: {
			label: 'TTS - Voice synthesizing',
			color: 'grey',
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
				voiceList: [{code: 'google', label: 'Nice voice'}, {code: 'espeak', label: 'Robot voice'}]
			},
			cleanText: function(){ // TODO create an UtilsService... OR A FILTER ???
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
						if(callback.status == 200){
							$scope.dashboard.ttsTile.msg = ''; $scope.dashboard.ttsTile.error = ''; // Reinit TTS
						}
					});
				}
			}
		},*/
		//tileList: UIService.initDashboardTiles,
		runningData: null
	};

	/** Function to refresh Dashboard **/
	$scope.readyToRefresh = true; var failedRefreshs = 0; $scope.connexionLost = false;
	$scope.refreshDashboard = function(){
		if($scope.dashboard.autoRefresh && $scope.readyToRefresh){
			$scope.dashboard.refreshing = true;
			UIService.refreshDashboard(function(data){
				if(data){
					$scope.dashboard.odiState = setOdiState(data);
					$scope.dashboard.runningData = data;
					$scope.connexionLost = false;
					failedRefreshs = 0;
					$timeout(function(){$scope.dashboard.refreshing = false;}, 100);
				}else{
					failedRefreshs++
					if(failedRefreshs >= 2) $scope.connexionLost = true;
					$scope.connexionLost = true;
				}
				});
			$scope.readyToRefresh = false;
			$timeout(function(){
				$scope.readyToRefresh = true;
				if($scope.dashboard.refreshing) $scope.refreshDashboard();
			}, 2000);
		}
	};
	$scope.refreshDashboard();

	function setOdiState(data){
		var odiState = {};
		if(data){
			odiState = {
				value: data.mode.value.mode || 'unavailable',
				ready: data.mode.value.mode == 'Ready',
				sleep: data.mode.value.mode == 'Sleep',
				debug: data.debug.value
			};
		}else{
			odiState = {
				value: 'unavailable',
				ready: false,
				sleep: false
			};
		}
		console.log('setOdiState()', odiState);
		return odiState;
	}

	/** Function to reloadUI */
	$scope.reloadUI = function(){
		console.log('reloadUI');
		$timeout(function(){
			$window.location.reload();
		}, 300);
	};

	/** Function to pop down toast */
	$scope.showToast = function(label){ // TODO to delete
		$mdToast.show($mdToast.simple().textContent(label).position('top right').hideDelay(1500));
	};
	/** Function to pop down error toast */
	$scope.showErrorToast = function(label){ // TODO to delete
		$mdToast.show($mdToast.simple().textContent(label).position('top right').hideDelay(2000).toastClass('error'));
	};


	/** Function to show/hide menu */
	$scope.toggleMenu = function(){
		if(!$scope.menuOpen){
			$scope.menuOpen = true;
			$mdSidenav('logs').close();
			$mdDialog.cancel();
			$timeout(function(){
				$mdSidenav('menu').toggle().then(function(){
				});
				$mdSidenav('menu').onClose(function () {
					$scope.menuOpen = false;
				});
			}, 200)
		}else{
			$scope.menuOpen = false;
			$mdSidenav('menu').close().then(function(){
			});
		}
	};

	/** Function to show logs */
	$scope.showLogs = function(){
		$mdSidenav('menu').close();
		$scope.logData = undefined;
		$timeout(function(){
			$mdSidenav('logs').toggle().then(function(){
				$scope.refreshLog();
			});
		}, 200);
	}

	/** Function to hide logs */
	$scope.hideLogs = function(){
		$mdSidenav('logs').close().then(function(){});
	};

	/** Function to refresh logs */
	$scope.refreshLog = function(){
		UIService.updateLogs(function(logs){
			$scope.logData = logs.split('\n');
		});
	};

	/** Function to action for header & fab buttons */
	$scope.action = function(action){
		UIService.sendCommand(action, function(data){
			$scope.refreshDashboard();
		});
	};

	/** Function on click on Tile **/
	/*$scope.tileAction = function(tile){
		//console.log('tile', tile);
		if($scope.irda){
			if(tile.actionList.length>1){
				$scope.openBottomSheet(tile.actionList);
			}else if(tile.actionList.length==1){
				$scope.action(tile.actionList[0]);
			}else{
				console.log('No action affected. OLD');
			}
		}
	}*/

	/** Function to send action **/
	/*$scope.action = function(button){
		//$scope.dashboard.autoRefresh = true; //TODO reactivate autoRefresh on Tile action
		if(button.url.indexOf('http://') > -1){
			//$window.open(button.url);
			UIService.getRequest(button.url, function(data){
				//console.log('data', data);
				$scope.showDialog({label: button.label, data: data});
			});
		}else{
			UIService.sendCommand(button, function(data){
				// $scope.showToast(button.label);
				$scope.refreshDashboard();
			});
		}
	};*/

	/** Function to open bottom sheet **/
	/*$scope.openBottomSheet = function(bottomSheetList){
		if($scope.irda){
			$rootScope.bottomSheetButtonList = bottomSheetList;
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'templates/bottom-sheet.html',
				// controller: 'UIController',
				controller: 'BottomSheetController',
				clickOutsideToClose: true
			}).then(function(action){
				// $scope.showToast(action.label);
			});
		}
	};*/
	/** Function on click on bottom sheet **/
	/*$scope.bottomSheetAction = function(button){
		$scope.action(button);
		$mdBottomSheet.hide(button);
	};*/

	/** Function to show fab buttons for 5 seconds */
	var timeout;
	$scope.showFabButtons = function(){
		if(timeout){
			$timeout.cancel(timeout);
		}
		$scope.fabButtonsVisible = true;
		timeout = $timeout(function(){
			$scope.fabButtonsVisible = false;
		},4000);
	};
	$timeout(function(){
		$scope.showFabButtons();
	},2000);

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

	$scope.toggleDebugMode = function(){
		var cmd = {
			label: '!Debug',
			url: '/toggleDebug'
		};
		console.log('toggleDebugMode()');
		UIService.sendCommand(cmd, function(data){
			//$scope.showToast(cmd.label);
		});
	};

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

	/** Function to toggle grant access */
	$scope.toggleGrant = function(ev){ // TODO COMPONENT !!
		$scope.toggleMenu();
		if(!$scope.irda){
			$timeout(function(){
				$mdDialog.show({
					controller: AdminDialogController,
					templateUrl: 'templates/dialog-admin.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints
				}).then(function(answer){
					$scope.requireGrantAccess(answer);
				});
			}, 100);
		}else{
			$scope.irda = false;
			// $scope.showToast('Not granted anymore');
		}
	};

	$scope.requireGrantAccess = function(param){
		UIService.sendCommand({url:'/grant', data:param}, function(data){
			$scope.irda = data;
			if($scope.irda){
				// $scope.showToast('Access granted !');
			}else{
				// $scope.showErrorToast('Not granted !');
			}
		});
	};
	var param = $location.$$absUrl.split('?')[1];
	if(param) $scope.requireGrantAccess(param);

	/** Loading until app bootstrapped */
	angular.element(document).ready(function(){
		angular.element(document.querySelector('.loading')).removeClass('loading');
	});

});

/*// app.controller('BottomSheetController', function($scope, $mdDialog){
// });
function BottomSheetController($scope, $mdDialog, modal){
	$scope.modal = modal;
	//console.log('$scope.modal.data', $scope.modal.data);
	if(typeof $scope.modal.data == 'string'){
		$scope.modal.data = $scope.modal.data.split('\n');
	}
	/** Function to test if number 
	$scope.isNumber = angular.isNumber;
	/** Function to close modal 
	$scope.close = function(){
		$mdDialog.cancel();
	};
}*/

function DialogController($scope, $mdDialog, modal){

	$scope.modal = modal;
	//console.log('$scope.modal.data', $scope.modal.data);
	if(typeof $scope.modal.data == 'string'){
		$scope.modal.data = $scope.modal.data.split('\n');
	}

	/** Function to test if number */
	$scope.isNumber = angular.isNumber;

	/** Function to close modal */
	$scope.close = function(){
		$mdDialog.cancel();
	};
}

function AdminDialogController($scope, $mdDialog){

	/** Function to close modal */
	$scope.hide = function(){
		$mdDialog.hide();
	};

	/** Function to close modal */
	$scope.cancel = function(){
		$mdDialog.cancel();
	};

	/** Function to submit modal */
	$scope.answer = function(answer){
		$mdDialog.hide(answer);
	};
}
