/* Déclaration du controller de la page Projet */
odiUI.controller('RemoteController', ['$scope', '$location', '$timeout', 'RemoteService',
	function($scope, $location, $timeout, RemoteService) {

        $scope.logView = false;
        $scope.openMenu();

        $scope.sendCommand =  function(id){
        	console.log('sendCommand(' + id + ')');
        };

    }
]);

/* Sercice Remote */
odiUI.factory('RemoteService',['$http', function($http){
	var RemoteService = {};
	
	/** Fonction envoi commandes */
	RemoteService.sendCommand = function(tts, callback){
		$http({
			method: 'POST',
			url: 'http://odi.adrigarry.com/'
		}).then(function successCallback(res){
			callback(res);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
	};

	RemoteService.buttons = [
		{
			id: 0,
			title: '',
			url: ''
		}
	];

	return RemoteService;
}]);