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
		$scope.monitoring = true;

		$scope.view = $location.path() || '/TTS'; // Attribution page par defaut

		$scope.activity = {
			mode : 'waiting',
			// awake
			// sleepTime : undefined,
			// cpuTemp : undefined,
			infos : 'Initializing...'
		};

		/** Monitoring Activite */
		setTimeout(function(){
			$scope.refreshActivity();
		}, 3000);
		setInterval(function(){
			$scope.refreshActivity();
		}, 10000);


		$scope.refreshActivity = function(){
			$scope.monitoring = true;
			$scope.activity = {
				mode : 'waiting',
				infos : 'Initializing...'
			};
			utilService.monitoringActivity(function(activity){
				$scope.monitoring = false;
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
			var ipRegex = '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
			utilService.getLogs(function(logs){

				// var ipRegex = new RegExp("\\[([0-9]{1,3}\\.){3}([0-9]{1,3})\\]","g");
				logs = logs.replace(/\[([0-9]{1,3}\.){3}([0-9]{1,3})\]/g, function(match, capture){
					// console.log('match: ' + match);
					var ip = match.substr(1,match.length-2);
					// console.log('ip: ' + ip);
					return '[<a href=http://localiser-ip.com/?ip=' + ip 
						+ ' title="Localize this IP" target="_blank">' + ip + '<a/>]';
				});

				$scope.logData = logs.split('\n');
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
			url: 'http://odi.adrigarry.com/monitoring'
		}).then(function successCallback(res){
			var data = res.data;
			// console.log(data);
			/*var activity = {
				mode : data.mode,
				sleepTime : data.sleepTime,
				cpuTemp : data.cpuTemp,
				infos : undefined
			};*/
			var activity = data;
			console.log(activity);
			callback(activity);
		}, function errorCallback(res){
			var activity = {
				mode : 'waiting',
				// sleepTime : undefined,
				// cpuTemp : undefined,
				infos : res
			};
			console.error(activity);
			callback(activity);
		});
	};

	/** Fonction de mise a jour des logs */
	var logSize = 100;
	utilService.lib = "";
	utilService.getLogs = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/log?logSize=' + logSize
		}).then(function successCallback(res){
			callback(res.data);
		}, function errorCallback(res){
			console.error(res);
			callback(res);
		});
		logSize += 20;
	};
	
	return utilService;
}]);
