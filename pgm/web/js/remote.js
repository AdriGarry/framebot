/* Déclaration du controller de la page Projet */
odiUI.controller('RemoteController', ['$scope', '$location', '$timeout', 'RemoteService',
	function($scope, $location, $timeout, RemoteService) {

        $scope.logView = false;
        $scope.openMenu();


		$scope.functionnalCommands = RemoteService.functionnalCommands;
		$scope.systemCommands = RemoteService.systemCommands;

    }
]);

/* Sercice Remote */
odiUI.factory('RemoteService',['$http', '$window', function($http, $window){
	var RemoteService = {};
	
	/** Fonction envoi commandes */
	RemoteService.sendCommand = function(cmd, callback){
		// console.log(cmd);
		var params = '';
		if(cmd.paramKey != '' && cmd.paramValue != ''){
			params = '?' + cmd.paramKey + '=' + cmd.paramValue;
		}
		$http({
			method: 'POST',
			url: 'http://odi.adrigarry.com' + cmd.url + params
		}).then(function successCallback(res){
			// console.log(res);
			// callback(res);
		}, function errorCallback(res){
			console.error(res);
			// callback(res);
		});
	};

		RemoteService.functionnalCommands = [
		{
			id: 1,
			title : 'Request History',
			icon : 'fa fa-file-text-o',
			url : '/requestHistory',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				// RemoteService.sendCommand(this);
				// alert('Request History to config !!')
				$window.open('http://odi.adrigarry.com/requestHistory');
			}
		}, {
			id: 11,
			title : 'Set Party Mode',
			icon : 'fa fa-glass',
			url : '/setParty',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 12,
			title : 'Cigales',
			icon : 'fa fa-bug',
			url : '/cigales',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 13,
			title : 'Test',
			icon : 'fa fa-flag-checkered',
			url : '/test',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 21,
			title : 'Jukebox',
			icon : 'fa fa-music',
			url : '/jukebox',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 22,
			title : 'FIP Radio',
			icon : 'fa fa-globe',
			url : '/fip',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 23,
			title : 'CPU Temp',
			icon : 'fa fa-codepen',
			url : '/cpuTemp',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 31,
			title : 'Weather',
			icon : 'fa fa-cloud',
			url : '/meteo',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 32,
			title : 'Timer',
			icon : 'fa fa-hourglass-half',
			url : '/timer',
			paramKey : 'm',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			},
			onHold : function(){
				prompt('Duree de la veille', this.paramValue);
			}
		}, {
			id: 33,
			title : 'Clock',
			icon : 'fa fa-clock-o',
			url : '/time',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 34,
			title : 'Date',
			icon : 'fa fa-calendar',
			url : '/date',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 50,
			title : 'Exclamation',
			icon : 'fa fa-quote-right',
			url : '/exclamation',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 51,
			title : 'Conversation',
			icon : 'fa fa-comments-o',
			url : '/conversation',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 52,
			title : 'TTS',
			icon : 'fa fa-comment-o',
			url : '/tts',
			paramKey : 'msg',
			paramValue : 'RANDOM',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 53,
			title : 'Replay last TTS',
			icon : 'fa fa-undo',
			url : '/lastTTS',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}, {
			id: 54,
			title : 'Mute',
			icon : 'fa fa-volume-off',
			url : '/mute',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}
	];

	RemoteService.systemCommands = [
		{
			id: 1,
			title : 'Shutdown',
			icon : 'fa fa-power-off',
			url : '/shutdown',
			paramKey : 'h',
			paramValue : '',
			onClick : function(){
				if(confirm('Shutdown Odi ?')){
					RemoteService.sendCommand(this);
				}
			}
		}, {
			id: 2,
			title : 'Reboot',
			icon : 'fa fa-refresh',
			url : '/reboot',
			paramKey : 'h',
			paramValue : '',
			onClick : function(){
				if(confirm('Reboot Odi ?')){
					RemoteService.sendCommand(this);
				}
			}
		}, {
			id: 3,
			title : 'Sleep Odi',
			icon : 'fa fa-moon-o',
			url : '/sleep',
			paramKey : 'h',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			},
			onHold : function(){
				prompt('Durée de la veille', '');
			}
		}, {
			id: 4,
			title : 'Restart Odi',
			icon : 'fa fa-flash',
			url : '/odi',
			paramKey : '',
			paramValue : '',
			onClick : function(){
				RemoteService.sendCommand(this);
			}
		}
	];

	return RemoteService;
}]);

