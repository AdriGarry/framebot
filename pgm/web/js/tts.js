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

		$scope.ttsMessage = '';

		$scope.sendTTS = function(){
			console.log('sendTTS 1');
			TTSService.sendTTS();
		}
	}
]);



/* Déclaration du service de constante pour stocker toutes les chaînes de caractères */
odiUI.factory('TTSService',function() { // A METTRE DANS UN OBJET JSON
	var TTSService = {};
	
	/** Fonction de remplassement des caracteres speciaux */
	TTSService.cleanText = function(){
		var message = document.getElementById('message').value;
		message = message.replace(/[àâ]/g,'a');
		message = message.replace(/[ç]/g,'c');
		message = message.replace(/[èéêë]/g,'e');
		message = message.replace(/[îï]/g,'i');
		message = message.replace(/[ôóö]/g,'o');
		message = message.replace(/[ù]/g,'u');
		document.getElementById("message").value = message;
	};

	/** Fonction envoi message TTS */
	TTSService.sendTTS = function(){
		console.log('TTSService.sendTTS 2');
	};

	return TTSService;
});
