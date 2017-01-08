/** mode component */

function DialogController($scope, $mdDialog){

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
