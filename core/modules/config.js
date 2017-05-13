#!/usr/bin/env node

// Module Utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var util = require('util');

module.exports = {
	logArray: logArray,
	update: update,
	updateSync: updateSync,
	updateDefault: updateDefault,
	getLastModifiedDate: getLastModifiedDate,
	countSoftwareLines: countSoftwareLines,
	resetCfg: resetCfg
};

if(typeof ODI === 'undefined'){
	// hasOwnProperty()...
	console.log('--> ODI global context object is not defined !', typeof ODI);
	// var ODI = {};
	// ODI.utils = require(CORE_PATH + 'modules/utils.js');
}else{
	console.log('--> ODI global context OK', typeof ODI);
}

/** Function to log CONFIG array */
function logArray(updatedEntries){
	var col1 = 11, col2 = 16;
	var confArray = '\n|--------------------------------|\n|             CONFIG             |' + '\n|--------------------------------|\n';
	Object.keys(CONFIG).forEach(function(key,index){
		if(key == 'alarms'){
			Object.keys(CONFIG[key]).forEach(function(key2,index2){
				if(key2 != 'd'){
					var c1 = (index2>0 ? ' '.repeat(col1) : key + ' '.repeat(col1-key.toString().length));
					var c2 = key2 + ' ' + (CONFIG[key][key2].h<10?' ':'') + CONFIG[key][key2].h + ':';
					c2 += (CONFIG[key][key2].m<10?'0':'') + CONFIG[key][key2].m;
					if(typeof CONFIG[key][key2].mode === 'string') c2 += ' ' + CONFIG[key][key2].mode.charAt(0);//String(CONFIG[key][key2].mode).charAt(0)
					confArray += '| ' + c1 + ' | ' + c2 + ' '.repeat(col2-c2.length) + ' |\n';
				}
			});
		}else{
			var updated = (updatedEntries && ODI.utils.searchStringInArray(key, updatedEntries)) ? true : false;
			confArray += '| ' + (!updated ? '' : '*') + key + ' '.repeat(col1-key.length-updated) /*(updatedEntries.indexOf(key) == -1 ? ' ' : '*')*/
				+ ' | ' + CONFIG[key] + ' '.repeat(col2-CONFIG[key].toString().length) + ' |\n';
		}
	});
	console.log(confArray + '|--------------------------------|');
};

/** Function to set/edit Odi's config */
function update(newConf, restart, callback){
	console.debug('config.update(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	ODI.utils.getJsonFileContent(CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key,index){
			updatedEntries.push(key);
			config[key] = newConf[key];
		});
		global.CONFIG = config;
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2), function(){
			logArray(updatedEntries);
			if(restart){
				console.debug('process.exit()');
				process.exit();
			}
			if(callback) callback();
		});
	});
};

/** Function to set/edit Odi's config ASYNCHRONOUSLY */
function updateSync(newConf, restart){
	console.debug('config.updateSync(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	var fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
	var updatedEntries = [];
	Object.keys(newConf).forEach(function(key,index){
		updatedEntries.push(key);
		fileConfig[key] = newConf[key];
	});
	global.CONFIG = fileConfig;
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
	logArray(updatedEntries);
	if(restart){
		console.debug('process.exit()');
		process.exit();
	}
};

/** Function to set/edit Odi's default config file */
const DEFAULT_CONFIG_FILE = '/home/pi/odi/data/defaultConf.json';
function updateDefault(newConf, restart, callback){
	console.debug('setDefaultConfig(newConf)', util.inspect(newConf, false, null)); // TODO revoir pk l'objet n'est plus loggué
	//logArray();
	ODI.utils.getJsonFileContent(DEFAULT_CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		var updatedEntries = [];
		Object.keys(newConf).forEach(function(key,index){
			updatedEntries.push(key);
			config[key] = newConf[key];
		});
		global.CONFIG = config;
		fs.writeFile(DEFAULT_CONFIG_FILE, JSON.stringify(CONFIG, null, 2), function(){
			// logArray(updatedEntries);
			if(restart){
				console.debug('process.exit()');
				process.exit();
			}
			if(callback) callback();
		});
	});
};

/** Function to update last modified date & time of Odi's files */
function getLastModifiedDate(paths, callback){ // typeof paths => Array
	var dates = [];
	for(var i=0;i<paths.length;i++){
		fs.stat(paths[i], function(err, stats){
			dates.push(stats.mtime);
			console.debug('getLastModifiedDate()', paths, dates);
			if(dates.length == paths.length){
				var d = new Date(Math.max.apply(null, dates.map(function(e){
					return new Date(e);
				})));
				var lastDate = ODI.utils.logTime('Y-M-D h:m');
				callback(lastDate);
			}
		});
	}(i);
};

/** Function to count lines of Odi's software */
function countSoftwareLines(callback){
	console.debug('countSoftwareLines()');
	var extensions = ['js', 'json', 'sh', 'py', 'html', 'css'];//, 'properties'
	var typesNb = extensions.length;
	var totalLines = 0;
	extensions.forEach(function(item, index){
		var temp = item;
		// console.log(temp);
		ODI.utils.execCmd('find /home/pi/odi/ -name "*.' + temp + '" -print | xargs wc -l', function(data){
			var regex = /(\d*) total/g;
			var result = regex.exec(data);
			// console.log(result);
			var t = result && result[1] ? result[1] : -1;
			// console.log(temp, t);
			// lines[key] = result[1];
			totalLines = parseInt(totalLines)+parseInt(t);
			typesNb--;
			if(!typesNb){
				// console.log(totalLines);
				callback(totalLines);
			}
		});
	});
};

/** Function to reset Odi's config */
function resetCfg(restart){
	console.log('resetCfg()', restart ? 'and restart' : '');
	logArray();
//	config.update = now('dt');

	var stream = fs.createReadStream(DATA_PATH + 'defaultConf.json');/*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	var had_error = false;
	stream.on('error', function(e){
		had_error = true;
		console.error('config.resetCfg() stream error', e);
	});
	stream.on('close', function(){
		if(!had_error && restart) {
			process.exit();
		}
	});
};

