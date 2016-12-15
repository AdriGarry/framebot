#!/usr/bin/env node

// Module Utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
var hardware = require(CORE_PATH + 'modules/hardware.js');
var leds = require(CORE_PATH + 'modules/leds.js');
var exclamation = require(CORE_PATH + 'modules/exclamation.js');

module.exports = {
	// randomAction: randomAction,
	formatedDate: formatedDate,
	logConfigArray: logConfigArray,
	prepareLogs: prepareLogs,
	setConfig: setConfig,
	resetConfig: resetConfig,
	getJsonFileContent: getJsonFileContent,
	appendJsonFile: appendJsonFile,
	testConnexion: testConnexion,
	//getStartTime : getStartTime
};

/** Function to get date & time (jj/mm hh:mm:ss) */
var date, month, day, hour, min, sec, now;
function formatedDate(){
// var formatedDate = function(){
	date = new Date();
	month = date.getMonth()+1;
	day = date.getDate();
	hour = date.getHours();
	min = date.getMinutes();
	sec = date.getSeconds();
	now = (day<10?'0':'') + day + '/' + (month<10?'0':'') + month + ' ';
	now += (hour<10?'0':'') + hour + ':' + (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
	//callback(now);
	return now;
};

/** Function to log CONFIG array */
function logConfigArray(){
	var confArray = '\n|-------------------------------|\n|             CONFIG            |' + '\n|-------------------------------|\n';
	Object.keys(CONFIG).forEach(function(key,index){
		//if(typeof CONFIG[key] == 'Object'){
		if(key == 'alarms'){
			Object.keys(CONFIG[key]).forEach(function(key2,index2){
				if(key2 != 'd'){
					confArray += '| ' + (index2>0 ? ' '.repeat(10) : key + ' '.repeat(10-key.toString().length)) + ' | ' + key2 + ' '
						+ CONFIG[key][key2].h + ':' + (CONFIG[key][key2].m<10?'0':'') + CONFIG[key][key2].m
						+ ' '.repeat(16-(key2.toString().length+CONFIG[key][key2].h.toString().length+CONFIG[key][key2].m.toString().length+(CONFIG[key][key2].m<10?3:2))) + ' |\n';
				}
			});
		}else{
			confArray += '| ' + key + ' '.repeat(10-key.length) + ' | ' + CONFIG[key] + ' '.repeat(16-CONFIG[key].toString().length) + ' |\n';
		}
	});
	console.log(confArray + '|-------------------------------|');
};

/** Function to format logs */
function prepareLogs(lines, callback){
	var content = fs.readFileSync(LOG_PATH + 'odi.log', 'UTF-8').toString().split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
};

/** Function to set/edit Odi's config */
function setConfig(newConf, restart){
	console.log('setConfig(newConf)', newConf);
	getJsonFileContent(CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		Object.keys(newConf).forEach(function(key,index){//key: the name of the object key && index: the ordinal position of the key within the object 
			// console.log('key', key, 'index', index);
			// console.log('newConf[key]', newConf[key]);
			config[key] = newConf[key];
		});
		global.CONFIG = config;
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
		logConfigArray();
		if(restart) hardware.restartOdi();
	});
};

// /** Function to set/edit Odi's config */
// function setConfig(key, value, restart){
// 	console.debug('setConfig()', key, value);
// 	getJsonFileContent(CONFIG_FILE, function(data){
// 		var config = JSON.parse(data);
// 		for(var item in config){
// 			if(key == item){
// 				if(!value) config[item] = !config[item];
// 				else config[item] = value;
// 				console.log('CONFIG updated:', item, config[item], restart ? 'AND RESTART !' : '');
// 			}
// 		}
// 		global.CONFIG = config;
// 		//console.debug(CONFIG);
// 		logConfigArray();
// 		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
// 		if(restart) hardware.restartOdi();
// 	});
// };

/** Function to reset Odi's config */
function resetConfig(restart){
	console.log('resetConfig()', restart ? 'and restart' : '');
	fs.createReadStream(DATA_PATH + 'defaultConf.json').pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	if(restart){
		// setTimeout(function(){
			hardware.restartOdi();
		// }, 2000);
	}
};

/** Function getJsonFileContent */
function getJsonFileContent(filePath, callback){
	console.debug('getJsonFileContent() ', filePath);
	fs.readFile(filePath, function(err, data){
		if(err && err.code === 'ENOENT'){
			console.error('No file : ' + filePath);
			callback(null);
		}else{
			callback(data);
		}
	});
};

/** Function to append object in JSON file */
var fileData;
function appendJsonFile(filePath, obj, callback){
	console.debug('appendJsonFile() ', filePath, obj);
	fs.exists(filePath, function(exists){
		if(exists){
			console.debug("Yes file exists");
			fs.readFile(filePath, function(err, data){
				if(err) console.log(err);
				else{
					fileData = JSON.parse(data);
					console.debug('obj', obj);
					console.debug('fileData', fileData);
					fileData.push(obj);
					fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
					console.debug(fileData);
					fs.writeFile(filePath, fileData);
				}
			});
		}else{
			console.debug("File not exists")
			fileData = [];
			console.debug('obj', obj);
			console.debug('fileData', fileData);
			fileData.push(obj);
			fileData = JSON.stringify(fileData, null, 2).replace(/\\/g, "").replace(/\"{/g, "{").replace(/\}"/g, "}");
			console.debug(fileData);
			fs.writeFile(filePath, fileData);
		}
	});
};

/** Function to test internet connexion */
function testConnexion(callback){
	//console.debug('testConnexion()...');
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			// console.debug('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.debug('Odi is online   :');
			callback(true);
		}
	});
};

/** Function to return last Odi's start/restart time */
const startHour = new Date().getHours();
const startMin = new Date().getMinutes();
const startTime = (startHour > 12 ? startHour-12 : startHour) + '.' + (startMin<10?'0':'') + startMin + ' ' + (startHour > 12  ? 'PM' : 'AM');
function getStartTime(){
	return startTime;
};

/** Function to repeat/concat a string */
String.prototype.repeat = function(num){
	return new Array(Math.abs(num) + 1).join(this);
};

/** Function to test if an array contains an element */
/*Array.prototype.contains = function(element){
	return this.indexOf(element) > -1;
};*/