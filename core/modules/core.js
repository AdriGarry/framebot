#!/usr/bin/env node

// Module Core
// TODO à transformer en logger ???

var util = require('util');

module.exports = {
	enableDebug: enableDebug
};

console.debug = function(o){}; // debug defaultly initialized to false

/** Function to enable debug mode functions */
function enableDebug(){
	console.log('\u2022\u2022\u2022 DEBUG MODE \u2022\u2022\u2022 ' + CONFIG.debug + 'min');
	console.debug = function(){
		var log = '\u2022';
		for(var arg=0;arg<arguments.length;++arg){
			if(typeof arguments[arg] == 'object'){
				log = log + ' ' + util.format(util.inspect(arguments[arg]));
			}else{
				log = log + ' ' + arguments[arg];
			}
		}
		console.log(log);
	}
	//TODO screen on & tail odi.log !
	// console.debug('Timeout to cancel Debug mode:',CONFIG.debug+'min');
	setInterval(function(){
		ODI.config.update({debug: --CONFIG.debug}, false);
		if(!CONFIG.debug){
			console.debug('>> CANCELING DEBUG MODE... & Restart !!');
			ODI.config.update({debug: false}, true);
		}
	}, 60*1000);
};
