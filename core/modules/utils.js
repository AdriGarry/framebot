#!/usr/bin/env node

// Module utils

var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
var leds = require('./leds.js');
var fip = require('./fip.js');
var voiceMail = require('./voiceMail.js');
const self = this;

/*module.exports = {
	mute: function(message){
		return mute(message);
	},
	autoMute: function(message){
		return autoMute(message);
	},
	getStartTime: function(){
		return getStartTime();
	},
	formatedDate: function(){
		return formatedDate();
	},
	prepareLogs: function(lines, callback){
		return prepareLogs(lines, callback);
	},
	getFileContent: function(filePath){
		return getFileContent(filePath);
	},
	testConnexion: function(callback){
		return testConnexion(callback);
	},
	reboot: function(){
		return reboot();
	},
	shutdown: function(){
		return shutdown();
	},
	restartOdi: function(mode){
		return restartOdi(mode);
	},
	cpuAverage: function(){
		return cpuAverage();
	},
	getCPUUsage: function(){
		return getCPUUsage();
	},
	getCPUTemp: function(callback){
		return getCPUTemp(callback);
	},
	getOdiAge: function(){
		return getOdiAge();
	},
	getMsgLastGitCommit: function(callback){
		return getMsgLastGitCommit(callback);
	}
}*/

/** Function to mute Odi */
function mute(message){
	var deploy = spawn('sh', [CORE_PATH + 'sh/mute.sh']);
	console.log(((message === undefined)? '' : message) + 'MUTE  :|');
	leds.clearLeds();
	eye.write(0);
	belly.write(0);
};
exports.mute = mute;

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
exports.autoMute = autoMute;

/** Function to return last Odi's start/restart time */
const startTime = new Date();
exports.getStartTime = function getStartTime(){
	var hour = startTime.getHours();
	var min = startTime.getMinutes();
	return (hour > 12 ? hour-12 : hour) + '.' + (min<10?'0':'') + min + ' ' + (hour > 12  ? 'PM' : 'AM');
};

/** Function to get date & time (jj/mm hh:mm:ss) */
var date, month, day, hour, min, sec, now;
exports.formatedDate = function formatedDate(){
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
	//content = self.getCPUTemp() + '\n' + content;
	callback(content);
	return content;
};
exports.prepareLogs = prepareLogs;

/** Fonction getFileContent */
var getFileContent = function(filePath){ // 
var data = 'KO'; // ou undefined
	try{
		data = fs.readFileSync(filePath, 'UTF-8').toString();
	}catch(e){
		console.error('Error while reading file : ' + filePath);
		console.error(e);
	}
	return data;
};
exports.getFileContent = getFileContent;

/** Function to test internet connexion */
var testConnexion = function(callback){
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
exports.testConnexion = testConnexion;

/** Function to reboot RPI */
var reboot = function(){
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', [CORE_PATH + 'sh/power.sh', 'reboot']);
	}, 1500);
};
exports.reboot = reboot;

/** Function to shut down RPI */
var shutdown = function(){
	voiceMail.clearVoiceMail();
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY !!');
	setTimeout(function(){
		deploy = spawn('sh', [CORE_PATH + 'sh/power.sh']);
	}, 1500);
};
exports.shutdown = shutdown;

/** Function to restart/sleep Odi's core */
var restartOdi = function(mode){
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
exports.restartOdi = restartOdi;


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
exports.getCPUUsage = getCPUUsage;


/** Function to get CPU temperature */
function getCPUTemp(callback){
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(2));
	// console.log('CPU temperature : ' + temperature + ' ° C');
	return(temperature);
};
exports.getCPUTemp = getCPUTemp;

/** Function to return Odi's age
 * @return age in days
 */
var dateOfBirth = new Date('August 9, 2015 00:00:00'), age = 0;
function getOdiAge(){
	age = Math.abs(dateOfBirth.getTime() - new Date());
	// console.log(age);
	age = Math.ceil(age / (1000 * 3600 * 24));
	// console.log(age);
	return age;
};
exports.getOdiAge = getOdiAge;


/** Fonction to get last git commit message */
function getMsgLastGitCommit(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: 'ODI_PATH'}, getMsg);
};
exports.getMsgLastGitCommit = getMsgLastGitCommit;
