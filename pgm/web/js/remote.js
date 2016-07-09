/* Déclaration du controller de la page Projet */
odiUI.controller('RemoteController', ['$scope', '$location', '$timeout', 'constantService',
	function($scope, $location, $timeout, constantService) {

        //$scope.hideLog();
        $scope.logView = false;
        $scope.openMenu();

    }
]);

/* Déclaration du service de la page Projet qui va permettre de faire appel aux web services de l'application */
odiUI.factory('projetService', ['constantService', function(constantService) {

    // Création du service projet
	var projetService = {};

	/* Fonction permettant récupérer les informations d'un projet */ 
	projetService.getProjetById = function(id, callback) {
        var projet = null;

		callback(projet);
	};

	return projetService;
}]);