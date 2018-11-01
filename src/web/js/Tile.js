/** DefaultTile object **/
app.factory('DefaultTile', function($rootScope, $mdDialog, $mdBottomSheet, UIService, audioService) {
	// Tile constructor function
	function Tile(tile) {
		// Basic attributes
		// this.id = (tile.label.split(' ')[0].toLowerCase()) || ''; // setting tile id from first label word
		this.id = tile.label.split(' ')[0].toLowerCase() == 'text' ? 'tts' : ''; // setting tile id from first label word
		this.label = tile.label || '';
		this.expanded = tile.expanded || false;

		// Action attributes
		this.actionList = tile.actionList;
		// Set Tile.value to first Tile.actionList item
		if (this.actionList.length > 0 && !this.actionList[0].hasOwnProperty('label')) {
			this.actionList[0].label = this.label;
		}
		/*if(this.disableOnSleep){
			this.test = 'testABCD';
		}*/
		this.click = click;
		this.action = action;
		this.cssClass = this.id;
		this.openBottomSheet = openBottomSheet;
		this.openSliderBottomSheet = openSliderBottomSheet;
		this.openCustomBottomSheet = openCustomBottomSheet;
	}

	/** Function on click on Tile **/
	function click() {
		// console.log(this.label, this.label != 'About');
		if ($rootScope.irda || this.label == 'About') {
			if (this.actionList.length > 1) {
				openBottomSheet(this.actionList);
			} else if (this.actionList.length == 1) {
				action(this.actionList[0]);
			} else {
				console.log('No action affected.');
				UIService.showToast('No action affected.');
			}
		} else {
			UIService.showErrorToast('Unauthorized action.');
		}
	}

	/** Function to send action **/
	function action(button) {
		// console.log('action(button)', button);
		if (button.url.indexOf('https://') > -1) {
			//$window.open(button.url);
			UIService.getRequest(button.url, function(data) {
				//console.log('data', data);
				$mdDialog.show({
					controller: DialogController,
					templateUrl: 'templates/dialog.html',
					locals: {
						data: data,
						from: button
					},
					parent: angular.element(document.body),
					clickOutsideToClose: true,
					fullscreen: false // Only for -xs, -sm breakpoints
				});
			});
		} else if (button.label && button.url) {
			UIService.sendCommand(button, function(data) {
				//$scope.showToast(button.label);
			});
		}
	}

	/** Function to open bottom sheet **/
	function openBottomSheet(bottomSheetList, specificAction) {
		$rootScope.bottomSheetButtonList = bottomSheetList;
		//$scope.alert = '';
		$mdBottomSheet
			.show({
				templateUrl: 'templates/bottom-sheet.html',
				controller: 'BottomSheetController',
				clickOutsideToClose: true
			})
			.then(function(button) {
				if (specificAction) {
					specificAction(button);
				} else {
					action(button);
				}
			});
	}

	/** Function to open slider on bottom sheet */
	function openSliderBottomSheet(slider) {
		$rootScope.bottomSheetSlider = slider;
		$mdBottomSheet
			.show({
				templateUrl: 'templates/bottom-sheet-slider.html',
				controller: 'BottomSheetController',
				clickOutsideToClose: true
			})
			.then(function(button) {
				if (!button.params && button.value) {
					button.params = { value: button.value };
				}
				action(button); // à redéfinir ??
			});
	}

	/** Function to open a custom content on bottom sheet */
	function openCustomBottomSheet(bottomSheetController, bottomSheetTemplate, bottomSheetList, catchFunction) {
		$rootScope.bottomSheetButtonList = bottomSheetList;
		$mdBottomSheet
			.show({
				template: bottomSheetTemplate, //templateUrl: 'template/bottom-sheet-audio-recorder.html'
				controller: bottomSheetController,
				clickOutsideToClose: true
			})
			.then(function(button) {
				//
			})
			.catch(function() {
				console.log('You hit escape or clicked the backdrop to close.');
				catchFunction(audioService);
			});
	}

	// Tile object own properties
	/*Tile.prototype = {
		onHold: function(element){
			console.log('onHold()', element);
		}
	}*/
	// Return constructor
	return Tile;
});

app.controller('BottomSheetController', function($scope, $mdBottomSheet) {
	/** Function on click on bottom sheet **/
	$scope.bottomSheetAction = function(button) {
		$mdBottomSheet.hide(button);
	};
});
