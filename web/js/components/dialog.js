/** mode component */

function DialogController($scope, $mdDialog){
	// console.log('$scope', $scope);
	$scope.close = function(){
		$mdDialog.cancel();
	};
}
// items) {
//         $scope.items = items;

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
