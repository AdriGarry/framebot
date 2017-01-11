/** mode component */

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
