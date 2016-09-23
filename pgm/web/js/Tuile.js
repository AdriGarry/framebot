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


function Tuile(id, title, color, row, col){
	this.id = id;
	this.title = title;
	this.color = color;
	this.row = row;
	this.col = col;
	this.onclick = function(){
		self.sendCommand(this);
	};
	this.onHold = function(){
		this.paramKey = 'hymn';
		// self.sendCommand(this);
	}

}
