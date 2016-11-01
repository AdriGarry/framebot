#!/usr/bin/env node

// Module Utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
var hardware = require('./hardware.js');
var leds = require('./leds.js');
// var fip = require('./fip.js');
var self = this;

module.exports = {
	mute: mute,
	getStartTime : getStartTime,
	formatedDate: formatedDate,
	prepareLogs: prepareLogs,
	setConfig: setConfig,
	resetConfig: resetConfig,
	getFileContent: getFileContent,
	getJsonFileContent: getJsonFileContent,
	appendJsonFile: appendJsonFile,
	testConnexion: testConnexion
};

var muteTimer, delay;
/** Function to mute Odi */
function mute(delay, message){ // delay: min
	clearTimeout(muteTimer);
	// console.debug('mute()', 'delay:', delay, 'message:', message);
	delay = (delay && !isNaN(delay)) ? delay : 0;
	if(delay < 10){
		stopAll();
	}else{
		muteTimer = setTimeout(function(){
			spawn('sh', [CORE_PATH + 'sh/mute.sh', 'auto']);
			setTimeout(function(){
				stopAll();
			}, 1600);
		}, delay*60*1000);
	}
};

/** Function to stop all sounds & leds */
function stopAll(message){
	spawn('sh', [CORE_PATH + 'sh/mute.sh']);
	console.log('>> MUTE  -.-', message ? '"' + message + '"' : '');
	// leds.clearLeds();
	eye.write(0);
	belly.write(0);
};

/** Function to return last Odi's start/restart time */
const startTime = new Date();
function getStartTime(){
	var hour = startTime.getHours();
	var min = startTime.getMinutes();
	return (hour > 12 ? hour-12 : hour) + '.' + (min<10?'0':'') + min + ' ' + (hour > 12  ? 'PM' : 'AM');
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

/** Fonction de formatage des logs */
function prepareLogs(lines, callback){
	var content = fs.readFileSync(LOG_PATH + 'odi.log', 'UTF-8').toString().split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
};

/** Function to set/edit Odi's config */
function setConfig(key, value, restart){
	console.debug('setConfig()', key, value);
	getJsonFileContent(CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		for(var item in config){
			if(key == item){
				if(!value) config[item] = !config[item];
				else config[item] = value;
				console.log('NEW CONFIG ' + item + ' value: ' + config[item], restart ? 'AND RESTART !' : '');
			}
		}
		global.CONFIG = config;
		console.debug(CONFIG);
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
		if(restart) hardware.restartOdi();
	});
};

/** Function to reset Odi's config */
function resetConfig(restart){
	console.debug('resetConfig()');
	fs.createReadStream(DATA_PATH + 'conf.json').pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	if(restart) hardware.restartOdi();
};

/** Fonction getFileContent */ // NOT USED !!
function getFileContent(filePath){ // 
var data = 'KO'; // ou undefined
	try{
		data = fs.readFileSync(filePath, 'UTF-8').toString();
	}catch(e){
		console.error('getFileContent() ERROR : ' + filePath);
		console.error(e);
	}
	return data;
};

/** Fonction getJsonFileContent */
function getJsonFileContent(filePath, callback){
	// console.debug('getJsonFileContent() ', filePath);
	// try{
		fs.readFile(filePath, function(err, data){
			if(err && err.code === 'ENOENT'){
				console.debug(console.error('No file : ' + filePath));
				callback(null);
			}
			// console.debug(data);
			callback(data);
		});
	// }catch(e){
	// 	console.error('Error while reading file : ' + filePath);
	// 	console.error(e);
	// }
};

/** Function to append object in JSON file */
var fileData;
function appendJsonFile(filePath, obj, callback){
	console.debug('appendJsonFile() ', filePath, obj);
	fs.exists(filePath, function(exists){
		if(exists){
			console.debug("yes file exists");
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
			console.debug("file not exists")
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
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			//console.error('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.log('Odi is online   :');
			callback(true);
		}
	});
};
