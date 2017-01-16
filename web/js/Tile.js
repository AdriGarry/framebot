/** DefaultTile object **/
app.factory('DefaultTile', function($mdSidenav, $mdDialog, $mdBottomSheet, UIService){
	// Tile constructor function
	function Tile(tile){
		//console.log(tile.id, tile.label, tile.color, tile.rowspan, tile.colspan, tile.viewMode, tile.value, tile.actionList);
		// Basic attributes
		this.id = tile.id || '';
		this.label = tile.label || '';
		this.color = tile.color || '';
		this.rowspan = tile.rowspan || 1;
		this.colspan = tile.colspan || 1;

		// Info attributes
		this.value = tile.value || '-';
		this.viewMode = tile.viewMode; // 'icon' || 'value' || 'custom'
		this.html = '';

		// Action attributes
		this.actionList = tile.actionList;
		// Set Tile.value to first Tile.actionList item
		if(this.actionList.length>0 && !this.actionList[0].hasOwnProperty('label')) this.actionList[0].label = this.label;

		tileAction: defaultTileAction
	}

	/** Function on click on Tile **/
	function defaultTileAction(){
		console.log('defaultTileAction');
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

	/** Function to send action **/
	function action(button){
		if(button.url.indexOf('http://') > -1){
			//$window.open(button.url);
			UIService.getRequest(button.url, function(data){
				//console.log('data', data);
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
			});
		}else{
			UIService.sendCommand(button, function(data){
				$scope.showToast(button.label);
			});
			// TODO test pour showErrorToast
		}
	}


	/** Function to open bottom sheet **/
	function openBottomSheet(bottomSheetList){
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
	}

	/** Function on click on bottom sheet **/
	function bottomSheetAction(button){
		$scope.action(button);
		$mdBottomSheet.hide(button);
	}

	// Tile object own properties
	/*Tile.prototype = {
		onHold: function(element){
			console.log('onHold()', element);
		}
	}*/
	// Return constructor
	return(Tile);
});
