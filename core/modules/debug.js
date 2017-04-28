#!/usr/bin/env node

// Module Debug
console.log('\u2022\u2022\u2022 DEBUG MODE \u2022\u2022\u2022');

var util = require('util');

// module.exports = {
// };

// if(CONFIG.debug) console.debug = function(o){console.log(o);} else console.debug = function(o){};
// if(CONFIG.debug){
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
// }else console.debug = function(o){};


/** If debug mode, set a timer to cancel in 30 min */
// if(CONFIG.debug){
	//TODO screen on & tail odi.log !
	var debugTimeout = 30*60*1000;
	// TODO launch timeout watcher
	console.debug('Timeout to cancel Debug mode:',debugTimeout);
	setTimeout(function(){
		console.debug('>> CANCELING DEBUG MODE... & Restart !!');
		ODI.utils.setConfig({debug: !CONFIG.debug}, true);
	}, debugTimeout);
// }
