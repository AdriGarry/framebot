#!/usr/bin/env node

// Module utils

var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
var leds = require('./leds.js');
var fip = require('./fip.js');
// var voiceMail = require('./voiceMail.js');
const self = this;

module.exports = {
	mute: mute,
	autoMute: autoMute,
	getStartTime : getStartTime,
	formatedDate: formatedDate,
	prepareLogs: prepareLogs,
	setConfig: setConfig,
	resetConfig: resetConfig,
	getFileContent: getFileContent,
	getJsonFileContent: getJsonFileContent,
	appendJsonFile: appendJsonFile,
	testConnexion: testConnexion,
	restartOdi: restartOdi,
	reboot: reboot,
	shutdown: shutdown,
	getCPUUsage: getCPUUsage,
	getCPUTemp: getCPUTemp,
	getOdiAge: getOdiAge,
	getMsgLastGitCommit: getMsgLastGitCommit
};

/** Function to mute Odi */
function mute(message){
	var deploy = spawn('sh', [CORE_PATH + 'sh/mute.sh']);
	console.log(((message === undefined)? '' : message) + 'MUTE  :|');
	leds.clearLeds();
	eye.write(0);
	belly.write(0);
};
// exports.mute = mute;

/** Function to auto mute Odi in 60 minutes */
var muteTimer;
function autoMute(message){
	clearTimeout(muteTimer);
	muteTimer = setTimeout(function(){
		var deploy = spawn('sh', [CORE_PATH + 'sh/mute.sh', 'auto']);
		setTimeout(function(){
			message = ((message === undefined)? '' : message) + 'AUTO MUTE  :|';
			fip.stopFip(message);
			deploy = spawn('sh', [CORE_PATH + 'sh/mute.sh']);
			leds.clearLeds();
			eye.write(0);
			belly.write(0);
		}, 1600);
		console.log(message);
	// }, 13*1000);
	}, 60*60*1000);
};
// exports.autoMute = autoMute;

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
// exports.prepareLogs = prepareLogs;

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
		if(restart) restartOdi();
	});
};
// exports.setConfig = setConfig;

/** Function to reset Odi's config */
function resetConfig(restart){
	console.debug('resetConfig()');
	fs.createReadStream(DATA_PATH + 'conf.json').pipe(fs.createWriteStream(ODI_PATH + 'conf.json'));
	if(restart) restartOdi();
};
// exports.resetConfig = resetConfig;

/** Fonction getFileContent */ // NOT USED !!
function getFileContent(filePath){ // 
var data = 'KO'; // ou undefined
	try{
		data = fs.readFileSync(filePath, 'UTF-8').toString();
	}catch(e){
		console.error('Error while reading file : ' + filePath);
		console.error(e);
	}
	return data;
};
// exports.getFileContent = getFileContent;

/** Fonction getJsonFileContent */
function getJsonFileContent(filePath, callback){
	// console.debug('getJsonFileContent() ', filePath);
	// try{
		fs.readFile(filePath, function(err, data){
			if(err && err.code === 'ENOENT'){
				// console.debug(console.error('No file : ' + filePath));
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
// exports.getJsonFileContent = getJsonFileContent;


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
// exports.appendJsonFile = appendJsonFile;

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
// exports.testConnexion = testConnexion;

/** Function to restart/sleep Odi's core */
function restartOdi(mode){
	// if(typeof mode === 'number' && mode > 0){
	if(mode > 0){
		mode = parseInt(mode, 10);
		setTimeout(function(){
			console.log('Odi is going to sleep [' + mode + ']');
			process.exit(mode);
		}, 300); // Pause pour operations et clean msg
	}else{
		setTimeout(function(){
			console.log('Restarting Odi !!');
			process.exit();
			// process.exit(-1);
		}, 300); // Pause pour operations et clean msg
	}
};
// exports.restartOdi = restartOdi;

/** Function to reboot RPI */
function reboot(){
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', [CORE_PATH + 'sh/power.sh', 'reboot']);
	}, 1500);
};
// exports.reboot = reboot;

/** Function to shut down RPI */
function shutdown(){
	// voiceMail.clearVoiceMail();
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY !!');
	setTimeout(function(){
		deploy = spawn('sh', [CORE_PATH + 'sh/power.sh']);
	}, 1500);
};
// exports.shutdown = shutdown;

//Create function to get CPU information
function cpuAverage() {
	//Initialise sum of idle and time of cores and fetch CPU info
	var totalIdle = 0, totalTick = 0;
	var cpus = os.cpus();

	//Loop through CPU cores
	for(var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i]; // Select CPU core
		//Total up the time in the cores tick
		for(type in cpu.times) {
			totalTick += cpu.times[type];
		}

		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}

	//Return the average Idle and Tick times
	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

//Grab first CPU Measure
var startMeasure = cpuAverage();

/** Function to get CPU usage */
function getCPUUsage(){
	//Grab second Measure
	var endMeasure = cpuAverage();
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	/*console.log(idleDifference);
	console.log(endMeasure.idle);
	console.log(startMeasure.idle);*/
	var totalDifference = endMeasure.total - startMeasure.total;
	/*console.log(totalDifference);
	console.log(endMeasure.total);
	console.log(startMeasure.total);*/
	//Calculate the average percentage CPU usage
	var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
	// console.log('CPU usage : ' + percentageCPU + ' %');
	return(percentageCPU);
};
// exports.getCPUUsage = getCPUUsage;


/** Function to get CPU temperature */
function getCPUTemp(callback){
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(2));
	return(temperature);
};
// exports.getCPUTemp = getCPUTemp;

/** Function to return Odi's age => To service.js
 * @return age in days
 */
const DATE_BIRTH = new Date('August 9, 2015 00:00:00'), age = 0;
function getOdiAge(){
	age = Math.abs(DATE_BIRTH.getTime() - new Date());
	age = Math.ceil(age / (1000 * 3600 * 24));
	return age;
};
// exports.getOdiAge = getOdiAge;


/** Fonction to get last git commit message */
function getMsgLastGitCommit(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: 'ODI_PATH'}, getMsg);
};
// exports.getMsgLastGitCommit = getMsgLastGitCommit;