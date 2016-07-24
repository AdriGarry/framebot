/** Declaration du controller de la vue Settings */
odiUI.controller('SettingsController', [ '$scope', '$location', 'Settings',
	function($scope, $location, Settings) {
		
		$scope.logView = false;
		$scope.openMenu();

		Settings.getSettings(function(data){
			if(data.hasOwnProperty('switch')){
				data.switch.value = '<div class="material-switch text-center"><input id="switch" type="checkbox" ng-checked="item" /><label for="switch" class="label-primary"></label></div>';
			}
			$scope.settings = data;
		});
	}
 ]);


/* Sercice Settings */
odiUI.factory('Settings', ['$http', function($http){

	var Settings = {};

	/** Fonction de suivi d'activite */
	Settings.getSettings = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/settings'
		}).then(function successCallback(res){
			var data = res.data;
			// console.log(data);
			callback(data);
		}, function errorCallback(res){
			/*var settings = {
				mode : {
					lib : 'mode',
					value : 'Error while retreiving settings data !'
				},
				data : {
					lib : 'data',
					value : res
				}
			};*/

			/*console.error(settings);
			callback(settings);*/
		});
	};

	return Settings;
}]);
