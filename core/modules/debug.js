#!/usr/bin/env node

// Module Debug
console.log('\u2022\u2022\u2022 DEBUG MODE \u2022\u2022\u2022');

// TODO à transformer en logger ???

var util = require('util');

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
// var debugTimeout = 30;
console.debug('Timeout to cancel Debug mode:',CONFIG.debug+'min');
setInterval(function(){
	ODI.utils.setConfig({debug: --CONFIG.debug}, false);
	if(!CONFIG.debug){
		console.debug('>> CANCELING DEBUG MODE... & Restart !!');
		ODI.utils.setConfig({debug: false}, true);
	}
}, 60*1000);

// setTimeout(function(){
// 	console.debug('>> CANCELING DEBUG MODE... & Restart !!');
// 	ODI.utils.setConfig({debug: !CONFIG.debug}, true);
// }, debugTimeout*60*1000);
