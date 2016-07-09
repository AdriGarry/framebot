/*
 * Déclaration du controller global de l'application
 *
 * @param $scope : variable Angular pour faire le lien entre le controller et le HTML
 * @param $location : variable Angular permettant de modifier l'URL
 * @param constantService : déclaration du service pour récupérer les constantes de l'application
 */
odiUI.controller('UIController', [ '$scope', '$location', 'constantService',
	function($scope, $location, sessionService, constantService) {
            
            /*
             * Fonction permettant de générer des messages
             * 
             * @param type : type de messages (erreur, warning, info)
             * @param label : contenu du message
             */
             
			// $scope.throwMessage = function(type, label) {
			// 	$scope.msgType = type;
			// 	$scope.msgLabel = label;
			// 	$scope.showMsg = true;
			// }

            /*
             * Fonction utilisé pour changer de page
             * 
             * @param tabName : nom de la page à afficher
             */
             
			$scope.goTo = function(tabName){
				$scope.showMsg = false;
				$location.path(tabName);
			}

            /*
             * Fonction permettant d'ouvrir le menu principal
             */
			$scope.openMenu = function(){
				$scope.leftMenuShown = true;
				$scope.leftSubMenuShown = false;
				$scope.leftSubMenuMinimized = false;
			}
            
            /*
             * Fonction permettant de fermer le menu principal
             */
			/*$scope.closeMenu = function() {
				$scope.leftMenuShown = false;
				$scope.leftSubMenuShown = false;
				$scope.leftSubMenuMinimized = false;
			}*/
            

            /*
             * Fonction permettant d'ouvrir le sous-menu
             */
			$scope.leftSubMenuShown = true;
			$scope.leftSubMenuMinimized = false;
			$scope.toggleLog = function(){
				$scope.leftSubMenuShown = !$scope.leftSubMenuShown;
				$scope.leftSubMenuMinimized = !$scope.leftSubMenuMinimized;
			}

            /*
             * Fonction permettant d'ouvrir le sous-menu
             */
			$scope.showLog = function(){
				console.log('show');
				$scope.leftSubMenuShown = true;
				$scope.leftSubMenuMinimized = false;
			}
            
            /*
             * Fonction permettant de fermer le sous-menu
             */
			$scope.hideLog = function(){
				console.log('hide');
				$scope.leftSubMenuShown = false;
				$scope.leftSubMenuMinimized = true;
			}
            
            /*
             * Fonction permettant de minimiser/dé-minimiser le sous-menu
             */

			$scope.changeMinimizedState = function() {
				$scope.leftSubMenuMinimized = !$scope.leftSubMenuMinimized;
			}

            /*
             * Fonction de remplissage des onglets
             * 
             * @param items : liste des onglets
             */
             
			$scope.populateSubMenuTabs = function(items) {
				$scope.showSubTabs = false;
				if (items && items.length > 0) {
                    $scope.tabsItem = {tabs : items, selectedTabsIndex : 0};
				}
			}
            
            /*
             * Fonction de sélection d'un onglet
             * 
             * @param index : index de l'onglet
             */
             
            $scope.selectTabsIndex = function(index){
                $scope.tabsItem.selectedTabsIndex = index;
            }
            
            /*
             * Fonction d'affichage des onglets
             */
             
            $scope.showSubMenuTabs = function(){
                $scope.showSubTabs = true;
            }
            
            /*
             * Fonction de remplissage des champs de recherches
             * 
             * @param inputs : liste des champs de recherches
             */
             
			$scope.populateSubMenuInputs = function(inputs) {
                $scope.showSubInputs = false;
                if (inputs && inputs.length > 0) {
                    $scope.inputsItem = inputs;
                }
			}
            
            /*
             * Fonction d'affichage des champs de recherches
             */
            
            $scope.showSubMenuInputs = function(){
                $scope.showSubInputs = true;
            }
} ]);

/*
 * Déclaration du service de constante pour stocker toutes les chaînes de caractères
 *
 * @return constantService : contient l'objet JS du service pour pouvoir l'utiliser dans les controllers et autres services
 */
odiUI.factory('constantService',function() { // A METTRE DANS UN OBJET JSON

                    // Création du service consultant
					var constantService = {};

                    // Déclaration du tableau pour les onglets de chaque page
					constantService.tabs = [];
                    
                    // Onglets de la page consultant
					constantService.tabs["Consultants"] = [ {
						name : "Technologie"
					}, {
						name : "Fonctionnel"
					}, {
						name : "Métier"
					}, {
						name : "Outil"
					}, {
						name : "Diplôme"
					}, {
						name : "Certification"
					}, {
						name : "Formation"
					}, {
						name : "Intervention"
					} ];
                    
                    // Onglets de la page projet
					constantService.tabs["Projets"] = [ {
						name : "Technologie"
					}, {
						name : "Fonctionnel"
					}, {
						name : "Outil"
					} ];
                    
                    // Onglets de la page reporting
					constantService.tabs["Reporting"] = [ {
						name : "Bilan"
					}, {
						name : "Copil"
					}, {
						name : "Synthèse"
					} ];

                    // Déclaration du tableau pour les champs de recherche de chaque page
					constantService.inputs = [];
                    
                    // Champs de recherche de la page consultant
					constantService.inputs["Consultants"] = [ {
						label : "Nom"
					} ];
					
                    // Champs de recherche de la page projet
                    constantService.inputs["Projets"] = [ {
						label : "Client"
					}, {
						label : "Projet"
					} ];
                    
                    // Champs de recherche de la page reporting
					constantService.inputs["Bilan"] = [ {
						label : "Techno"
					} ];
					constantService.inputs["Copil"] = [ {
						label : "Projet"
					} ];

                    
					// Déclaration des constantes pour les messages
                    // Constantes pour le type de message
					constantService.errMsgClass = "msg-error";
					constantService.warnMsgClass = "msg-warning";
                    constantService.infoMsgClass = "msg-info";

					// Constantes de message
					constantService.missLogMessage = "Identifiant obligatoire.";
					constantService.missPwdMessage = "Mot de passe obligatoire.";
					constantService.wrongLogMessage = "Identifiant ou mot de passe incorrect.";
					constantService.wrongDtFormMessage = "Format de date incorrect, dd/mm/yyyy attendu.";

					return constantService;
				});
