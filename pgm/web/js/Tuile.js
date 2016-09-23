// /* service */
// app.service('TuileService', function(){

// 	this.


// 	var TemplateModel = {};

// 	/** Function to get logs */
// 	var logSize = 100;
// 	TemplateModel.lib = '';
// 	TemplateModel.getLogs = function(){
// 	};
	
// 	return TemplateModel;
// }]);



// //service style, probably the simplest one
// myApp.service('helloWorldFromService', function() {
//     this.sayHello = function() {
//         return "Hello, World!"
//     };
// });


function Tuile(id, lib, color, row, col){
	this.id = id;
	this.lib = lib;
	this.color = color;
	this.row = row;
	this.col = col;
}
