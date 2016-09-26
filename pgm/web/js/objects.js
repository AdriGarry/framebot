app.factory('Tile', ['$q', function ($q){
	function Tile(){}
	Tile.prototype = {
		constructor: Tile,
		function1: function(){
			return $q(function(resolve, reject){
				// ...
			});
		},
		// ...
	};
	return Tile;
}]);