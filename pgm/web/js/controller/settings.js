/** Declaration du controller de la vue Settings */
odiUI.controller('SettingsController', [ '$scope', '$location', 'Settings',
	function($scope, $location, Settings) {
		
		$scope.logView = false;
		$scope.openMenu();

		// $scope.viewTitle = 'Settings';

		Settings.getSettings(function(data){
			if(data.hasOwnProperty('switch')){
				var tmp = data.switch.value == 1 ? 'checked' : '';
				data.switch.value = '<div class="material-switch"><input id="switch" type="checkbox"';
				data.switch.value += tmp + ' /><label for="switch" class="label-primary switch"></label></div>';
			}
			if(data.hasOwnProperty('volume')){
				tmp = data.volume.value;
				data.volume.value = '<i class="fa fa-4x fa-' + (tmp == 'Normal' ? 'volume-down' : tmp == 'Mute' ? 'bell-slash' : 'volume-up')  + '"></i>';
			}
			if(data.hasOwnProperty('voiceMail')){
				tmp = data.voiceMail.value;
				data.voiceMail.value = '<span class="value fa-4x">' + tmp + '</span><i class="fa fa-2x fa-envelope'
					+ (tmp == 0 ? '-o' :'') + '"></i>';
			}
			if(data.hasOwnProperty('cpuTemp')){
				tmp = data.cpuTemp.value;
				data.cpuTemp.value = '<span class="value fa-3x">' + tmp + '</span><span class="fa-2x">°C</span>';
			}
			if(data.hasOwnProperty('cpuUsage')){
				/*tmp = data.cpuUsage.value;
				data.cpuUsage.value = '<md-progress-circular md-mode="determinate" value="';
				data.cpuUsage.value += tmp + '" md-diameter="96">' + tmp +'%</md-progress-circular>';*/
				tmp = data.cpuUsage.value;
				data.cpuUsage.value = '<span class="value fa-3x">' + tmp + '</span><span class="fa-2x">%</span>';
			}
			if(data.hasOwnProperty('about')){
				tmp = data.about.value;
				data.about.value = '<span class="about">' + tmp + '</span>';
			}
			$scope.settings = data;
		});
	}
 ]);


/* Sercice Settings */
odiUI.service('Settings', ['$http', function($http){

	/** Fonction de recuperationd de la configuration Odi */
	this.getSettings = function(callback){
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

}]);
