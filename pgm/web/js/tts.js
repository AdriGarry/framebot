/*
 * Déclaration du controller de la page Home
 *
 * @param $scope : variable Angular pour faire le lien entre le controller et le HTML
 * @param $location : variable Angular permettant de modifier l'URL
  */
odiUI.controller('TTSController', [ '$scope', '$location', 'TTSService',
	function($scope, $location, TTSService) {

		$scope.logView = false;
		$scope.openMenu();

		/** Fonction init TTS object */
		$scope.resetTTS = function(){
			console.log('resetTTS');
			$scope.tts = {
				voice: ':3',
				lg: 'fr',
				msg: '',
				cleanText: function(){
					var message = $scope.tts.msg || '';
					message = message.replace(/[àâ]/g,'a');
					message = message.replace(/[ç]/g,'c');
					message = message.replace(/[èéêë]/g,'e');
					message = message.replace(/[îï]/g,'i');
					message = message.replace(/[ôóö]/g,'o');
					message = message.replace(/[ù]/g,'u');
					$scope.tts.msg = message;
				},
				submit: function(){
					console.log('sendTTS 1');
					console.log($scope.tts);
					TTSService.sendTTS($scope.tts);
					$scope.resetTTS();
				}
			};
			console.log($scope.tts);
		};

		$scope.resetTTS();

	}
]);


/* Déclaration du service de constante pour stocker toutes les chaînes de caractères */
odiUI.factory('TTSService',function() {
	var TTSService = {};
	
	/** Fonction envoi message TTS */
	TTSService.sendTTS = function(tts){
		console.log('TTSService.sendTTS 2');
		console.log(tts);
	};

	return TTSService;
});
