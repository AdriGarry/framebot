
app.controller('UIController', function($scope, $timeout, $mdSidenav){
	$scope.message = 'Hello from UIController 2';


	$scope.showLogs = showLogs();
	function showLogs(){
		return function(){
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('logs').toggle().then(function(){
				console.log('showLogs()');
			});
		}
	};
	$scope.hideLogs = function(){
		// Component lookup should always be available since we are not using `ng-if`
		$mdSidenav('logs').close().then(function(){
			console.log('hideLogs()');
		});
	};


});