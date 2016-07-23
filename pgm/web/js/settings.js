/** Declaration du controller de la vue Settings */
odiUI.controller('SettingsController', [ '$scope', '$location',
	function($scope, $location) {
		
		$scope.logView = false;
		$scope.openMenu();
	}
 ]);


/* Sercice Settings */
odiUI.factory('Settings', ['$http', function($http){

	var Settings = {};

	/** Fonction de suivi d'activite */
	Settings.monitoringActivity = function(callback){
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
				data : 'Error while retreiving settings data !'
			};
			console.error(activity);
			callback(activity);
		});
	};

	return Settings;
}]);
