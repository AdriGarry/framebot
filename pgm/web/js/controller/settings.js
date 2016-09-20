/** Declaration du controller de la vue Settings */
odiUI.controller('SettingsController', [ '$scope', '$location', 'Settings',
	function($scope, $location, Settings) {
		
		$scope.logView = false;
		$scope.openMenu();

		// $scope.viewTitle = 'Settings';

		Settings.getSettings(function(data){
			console.log(data);
			console.log(data.mode);
			/*for(var item in data){
				console.log(item);
				console.log(item.value);
				if(item.value && item.value.indexOf('Soon available') > -1){
					delete data.item;
					console.log('delete ' + item);
				}
			}*/
			if(data.hasOwnProperty('mode')){
				tmp = data.mode.value;
				if(data.mode.value == 'Ready'){
					data.mode.value = '<span class="fa-2x" title="I\'m ready !">' + tmp + '</span>';
				}else{
					if(data.mode.value == 255){
						data.mode.value = '<i class="fa fa-4x fa-moon-o" title="Odi\'s sleeping"></i>';
					}else{
						data.mode.value = '<span class="fa-4x">' + tmp + '</span><i class="fa fa-3x fa-moon-o"></i>';
					}
					
				}
			}
			if(data.hasOwnProperty('switch')){
				var tmp = data.switch.value == 1 ? 'checked' : '';
				data.switch.value = '<div class="material-switch"><input id="switch" type="checkbox"';
				data.switch.value += tmp + ' /><label for="switch" class="label-primary switch"></label></div>';
			}
			if(data.hasOwnProperty('volume')){
				tmp = data.volume.value;
				data.volume.value = '<i class="fa fa-4x fa-'
					+ (tmp == 'Normal' ? 'volume-down' : tmp == 'Mute' ? 'bell-slash' : 'volume-up') + '"></i></center>';
			}
			if(data.hasOwnProperty('jukebox')){
				tmp = data.jukebox.value;
				data.jukebox.value = '<i class="fa fa-3x fa-music"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-3x fa-random"></i>';
			}
			if(data.hasOwnProperty('voiceMail')){
				tmp = data.voiceMail.value;
				data.voiceMail.value = '<span class="value fa-4x">' + tmp + '</span><i class="fa fa-2x fa-envelope'
					+ (tmp == 0 ? '-o' :'') + '"></i>';//<br><button class="btn btn-default"><i class="fa fa-2x fa-trash"></i></button>';
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
