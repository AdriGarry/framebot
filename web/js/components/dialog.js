/** mode component */

function DialogController($scope, $mdDialog, modal){

	$scope.modal = modal;
	//console.log('$scope.modal.data', $scope.modal.data);
	if(typeof $scope.modal.data == 'string'){
		$scope.modal.data = $scope.modal.data.split('\n');
	}

	$scope.close = function(){
		$mdDialog.cancel();
	};
}

function AdminDialogController($scope, $mdDialog){
	$scope.hide = function(){
		$mdDialog.hide();
	};
	$scope.cancel = function(){
		$mdDialog.cancel();
	};
	$scope.answer = function(answer){
		$mdDialog.hide(answer);
	};
}
