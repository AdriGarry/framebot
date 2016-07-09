/*
 * Déclaration du controller de la page Projet
 *
 * @param $scope : variable Angular pour faire le lien entre le controller et le HTML
 * @param $location : variable Angular permettant de modifier l'URL
 * @param $timeout : variable Angular pour créer des timers
 * @param constantService : déclaration du service pour récupérer les constantes de l'application
 */
odiUI.controller('RemoteController', ['$scope', '$location', '$timeout',
        'constantService',
		function($scope, $location, $timeout, constantService) {
        
            // Déclaration des variables globales de la page
			$scope.showProjetInfo = false;
			$scope.minLength = 3;
			$scope.pause = 100;
			$scope.rowIndexEditable = -1;

			
			/*
             * Fonction d'initialisation des informations du projet
             * 
             * @param projet : objet contenant les informations du projet
             */
			var initProjectInfo = function(projet) {
				if (!projet || projet == null) {
                    $scope.showProjetInfo = false;
                    // TODO : Créer un message d'erreur dans les constantes
                    $scope.throwMessage(constantService.errMsgClass, "Aucune informations disponibles");
                }else{
                    // TODO : Mettre en phase les champs avec le contrat d'interface
                    $scope.projetName = projet.name;
                    $scope.projetClient = projet.client;
                    $scope.showProjetInfo = true;
                }
            }	

            
            /*
             * Fonction d'ajout d'une nouvelle ligne dans la matrice de compétence
             */
            $scope.addRow = function() {
                // On créé un tableau auquel on ajoute un champ par colonne de la matrice
                var row = [];
                $scope.matrix.columnNames
                        .forEach(function(col) {
                            row.push("");
                        });
                
                // On ajoute la ligne à la matrice
                $scope.matrix.rows.push(row);
                
                // On rend la nouvelle ligne éditable
                $scope.rowIndexEditable = $scope.matrix.rows.length - 1;
            }

            /*
             * Fonction de suppresion d'une ligne de la matrice
             *
             * @param index : index de la ligne à supprimer
             */
            $scope.deleteRow = function(index) {
                $scope.matrix.rows.splice(index, 1);
                if (index < $scope.rowIndexEditable) {
                    $scope.rowIndexEditable--;
                }
            }

            // On affiche le menu et le sous-menu
            $scope.openMenu();
            $scope.showLog();

} ]);

/*
 * Déclaration du service de la page Projet qui va permettre de faire appel
 * aux web services de l'application
 *
 * @param constantService : déclaration du service pour récupérer les constantes de l'application
 * @return projetService : contient l'objet JS du service pour pouvoir l'utiliser dans les controllers et autres services
 */
odiUI.factory('projetService', ['constantService', function(constantService) {

    // Création du service projet
	var projetService = {};

    // TODO : Supprimer les données de tests une fois les web services en place
	var projets = [
		{
			id : '01',
			label : 'RefOG',
			client : 'BNP'
		}];
	
	var listClients = [];
	var clients = function(){
		projets.forEach(function(b){
			if(clients.findIndex(b.client) < 0){
				listClients.push(b.client);
			}
		});
		return listClients;
	};
    
    var matrixs = [
			{
				title : 'Technologie',
				columnNames : [ 'Compétences', 'Pondération',
						'Niveau 1', 'Niveau 2',
						'Niveau 3', 'Niveau 4' ],
				rows : [['JAVA 5', '2', '2', '3', '2', '0'],
						['ANGULAR', '2', '1', '3', '1', '1'],
						['ORACLE', '2', '1', '1', '0', '2'],
						['SHELL', '1', '3', '2', '3', '1']]
			}
		];

	/*
     * Fonction permettant de lister les projets en fonction
     * de la valeur du champ de recherche
     *
     * @param str : string du champ de recherche
     * @param callback : fonction de retour de service pour envoyer le résultat au controller
     */
	projetService.listProjetsByName = function(str, callback) {
		// TODO : Faire appel au web service pour lister les projets
        callback(projets);
	};

	/*
     * Fonction permettant de lister les clients en fonction
     * de la valeur du champ de recherche
     *
     * @param str : string du champ de recherche
     * @param callback : fonction de retour de service pour envoyer le résultat au controller
     */
	projetService.listClientsByName = function(str, callback) {
        // TODO : Faire appel au web service pour lister les clients
		callback(clients);
	};

	/*
     * Fonction permettant récupérer les informations d'un projet
     *
     * @param id : identifiant du projet
     * @param callback : fonction de retour de service pour envoyer le résultat au controller
     */ 
	projetService.getProjetById = function(id, callback) {
        var projet = null;
								
        // TODO : Remplacer le bloc suivant par un appel au web service
		projets.forEach(function(c) {
			if (c.id == id) {
				projet = c;
			}
		});
        
		callback(projet);
	};

	/*
     * Fonction permettant récupérer les compétences d'un projet
     *
     * @param id : identifiant du projet
     * @param type : type de compétences souhaitées
     * @param callback : fonction de retour de service pour envoyer le résultat au controller
     */ 
	projetService.getProjetInformations = function(id, type, callback) {
		var matrix = null;
        
		// TODO : Remplacer le bloc suivant par un appel au web service
        matrixs
                .forEach(function(m) {
                    if (m.title == constantService.tabs["Projets"][type].name) {
                        matrix = m;
                    }
                });
                
		callback(matrix);
	};

	return projetService;
}]);