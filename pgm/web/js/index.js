/*
 * Déclaration du controller global de l'application
 *
 * @param $scope : variable Angular pour faire le lien entre le controller et le HTML
 * @param $location : variable Angular permettant de modifier l'URL
 * @param constantService : déclaration du service pour récupérer les constantes de l'application
 */
odiUI.controller('UIController', [ '$scope', '$location', '$http', '$sce', 'utilService',
	function($scope, $location, $http, $sce, utilService) {
		$scope.admin = false;
        $scope.logActive = true;

        $scope.view = $location.path() || '/TTS'; // Attribution page par defaut

        $scope.activity = {
        	mode : 'waiting',
        	sleepTime : undefined,
        	cpuTemp : undefined,
        	infos : 'Initializing...'
        };

        /** Monitoring Activite */
		setTimeout(function(){
			$scope.refreshActivity();
		}, 3000);
		setInterval(function(){
			$scope.refreshActivity();
		}, 15000);


		$scope.refreshActivity = function(){
			utilService.monitoringActivity(function(activity){
				$scope.activity = activity;
			});
		}

        /* Fonction pour changer de page */
		$scope.goTo = function(tabName){
	        $scope.logActive = false;
			$location.path(tabName);
			$scope.view = '/' + tabName;
			// console.log('goTo : ' + $scope.view);
		};

        /* Fonction pour ouvrir le menu principal */
        $scope.cpuInfo = false;
		$scope.openMenu = function(){
			$scope.leftMenuShown = true;
		};

		/** Fonction show/hide Logs */
		$scope.logData;
        $scope.logActive = false;
		$scope.toggleLog = function(){
			$scope.logActive = !$scope.logActive;
			if($scope.logActive){
				$scope.refreshLog();
			}
		};

		/** Fonction hide Logs */
		$scope.hideLog = function(){
			$scope.logActive = false;
		}

		/** Fonction de rafraichissement des logs */
		$scope.refreshLog = function(){
			utilService.getLogs(function(logs){
				$scope.logData = logs.data.split('\n');
				/*$('#logActive').animate({
				scrollTop: $("#bottomLogs").prop("scrollHeight")}, 0
				);*/
			});
		};

		/** Fonction pour changer de statut */
		$scope.changeStatus = function(){
			$scope.admin = true;
		}

		$scope.toHtml = function(html){
			return $sce.trustAsHtml(html);
		};

} ]);

/* Sercice Util */
odiUI.factory('utilService', ['$http', function($http){

	var utilService = {};

	/** Fonction de suivi d'activite */
	utilService.monitoringActivity = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/monitoringActivity'
		}).then(function successCallback(res){
			var data = res.data;
			// console.log(data);
			var activity = {
				mode : data.mode,
				sleepTime : data.sleepTime,
				cpuTemp : data.cpuTemp,
				infos : undefined
			};
			// console.log(activity);
			callback(activity);
		}, function errorCallback(res){
			var activity = {
				mode : 'waiting',
				sleepTime : undefined,
				cpuTemp : undefined,
				infos : res
			};
			console.error(activity);
			callback(activity);
		});
	};

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
	
	return utilService;
}]);
