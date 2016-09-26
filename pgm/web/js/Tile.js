'use strict'
/* service */

// //service style, probably the simplest one
// myApp.service('helloWorldFromService', function() {
//     this.sayHello = function() {
//         return "Hello, World!"
//     };
// });

/** Tuile object constructor **/
function Tile(id, title, color, row, col, value, bottomSheetButtonList){
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
	};
	this.onHold = function(){
		// this.paramKey = 'hymn';
	}
	this.onDBclick = function(){
	};

	// Bottom Sheet
	this.bottomSheetButtonList = [];
	for(var bottomSheetButton in List){
		this.bottomSheetButtonList.push(bottomSheetButton);
	}

}
