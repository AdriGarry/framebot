/* service */

// //service style, probably the simplest one
// myApp.service('helloWorldFromService', function() {
//     this.sayHello = function() {
//         return "Hello, World!"
//     };
// });

/** Tuile object constructor **/
function Tuile(id, title, color, row, col, value){
	// Basic attributes
	this.id = id;
	this.title = title;
	this.color = color;
	this.row = row;
	this.col = col;

	// Info attributes
	this.value = value;

	// Action attributes
	this.onclick = function(){
		//self.sendCommand(this);
	};
	this.onHold = function(){
		this.paramKey = 'hymn';
		// self.sendCommand(this);
	}
	this.onDBclick = function(){
		//self.sendCommand(this);
	};

	// Bottom Sheet attributes
	this.bottomSheet = [{
		button: '',
		label: ''
	},{
		button: '',
		label: ''
	}];

}
