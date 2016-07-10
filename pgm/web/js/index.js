/*
 * Déclaration du controller global de l'application
 *
 * @param $scope : variable Angular pour faire le lien entre le controller et le HTML
 * @param $location : variable Angular permettant de modifier l'URL
 * @param constantService : déclaration du service pour récupérer les constantes de l'application
 */
odiUI.controller('UIController', [ '$scope', '$location', '$http', 'utilService', 'constantService',
	function($scope, $location, $http, utilService, constantService) {
        
        $scope.view = $location.path() || '/TTS'; // Attribution page par defaut
        
        /* Fonction pour changer de page */
		$scope.goTo = function(tabName){
	        $scope.logActive = false;
			$location.path(tabName);
			$scope.view = '/' + tabName;
			console.log('goTo : ' + $scope.view);
		}

        /* Fonction pour ouvrir le menu principal */
        $scope.cpuInfo = false;
		$scope.openMenu = function(){
			$scope.leftMenuShown = true;
			setTimeout(function(){$scope.updateCpuTemp();}, 1500);
			//setInterval(function(){updateCpuTemp();}, 10000);
		}
        
		/** Fonction show/hide Logs */
		$scope.logData;
        $scope.logActive = false;
		$scope.toggleLog = function(){
			$scope.logActive = !$scope.logActive;
			if($scope.logActive){
				$scope.refreshLog();
			}
		}

		/** Fonction de maj de la CPU Temp */
		$scope.updateCpuTemp = function(){
			console.log('updateCpuTemp()');
			$scope.cpuInfo = false;
			utilService.getCPUTemp(function(temp){
				$scope.cpuTemp = temp.data + ' ° C';
				$scope.cpuInfo = true;
			});
		}

		/** Fonction hide Logs */
		$scope.hideLog = function(){
			$scope.logActive = false;
		}

		$scope.refreshLog = function(){
			utilService.getLogs(function(logs){
				$scope.logData = logs.data.split('\n');
				/*$('#logActive').animate({
				scrollTop: $("#bottomLogs").prop("scrollHeight")}, 0
				);*/
			});
		}

} ]);

/* Declaration du service util */
odiUI.factory('utilService', ['$http', function($http){

	var utilService = {};

	/** Fonction de mise a jour des logs */
	utilService.lib = "";
	utilService.getLogs = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/log'
		}).then(function successCallback(res){
			callback(res);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
	};

	/** Fonction de recuperation de la temperature du processeur */
	utilService.getCPUTemp = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/cpuTemp'
		}).then(function successCallback(res){
			callback(res);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
	};
	
	return utilService;
}]);

/* Déclaration du service de constante pour stocker toutes les chaînes de caractères */
odiUI.factory('constantService',function() { // A METTRE DANS UN OBJET JSON
	var constantService = {};
	constantService.wrongDtFormMessage = "";
	return constantService;
});
