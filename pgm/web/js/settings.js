/** Declaration du controller de la vue Settings */
odiUI.controller('SettingsController', [ '$scope', '$location', 'Settings',
	function($scope, $location, Settings) {
		
		$scope.logView = false;
		$scope.openMenu();

		Settings.getSettings(function(data){
			if(data.hasOwnProperty('switch')){
				var tmp = data.switch.value == 1 ? 'checked' : '';
				data.switch.value = '<div class="material-switch"><input id="switch" type="checkbox"';
				data.switch.value += tmp + ' /><label for="switch" class="label-primary"></label></div>';
			}
			$scope.settings = data;
		});
	}
 ]);


/* Sercice Settings */
odiUI.factory('Settings', ['$http', function($http){

	var Settings = {};

	/** Fonction de recuperationd de la configuration Odi */
	Settings.getSettings = function(callback){
		$http({
			method: 'GET',
			url: 'http://odi.adrigarry.com/settings'
		}).then(function successCallback(res){
			var data = res.data;
			// console.log(data);
			callback(data);
		}, function errorCallback(res){
			var settings = {
				mode : {
					lib : 'mode',
					value : 'Error while retreiving Odi\'s settings data !'
				},
				data : {
					lib : 'data',
					value : res
				}
			};

			console.error(settings);
			callback(settings);
		});
	};

	return Settings;
}]);
