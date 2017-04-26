#!/usr/bin/env node

// Module utils

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require("os");
/*var leds = require(CORE_PATH + 'modules/leds.js');
var tts = require('./tts.js'); // TODO: stop proceedQueue() in mute()*/

module.exports = {
	mute: mute,
	restartOdi: restartOdi,
	reboot: reboot,
	shutdown: shutdown,
	getCPUUsage: getCPUUsage,
	getCPUTemp: getCPUTemp,
	getOdiAge: getOdiAge,
	updateLastModifiedTime: updateLastModifiedTime,
	cleanLog: cleanLog,
	getMsgLastGitCommit: getMsgLastGitCommit
};

var muteTimer, delay;
/** Function to mute Odi (delay:min) */
function mute(delay, message){
	clearTimeout(muteTimer);
	console.debug('mute()', 'delay:', delay, 'message:', message);
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
	ODI.tts.clearTTSQueue();
	ODI.fip.stopFip();
	spawn('sh', [CORE_PATH + 'sh/mute.sh']);
	console.log('>> MUTE  -.-', message ? '"' + message + '"' : '');
	ODI.leds.clearLeds();
	eye.write(0);
	belly.write(0);
};

/** Function to restart/sleep Odi's core */
function restartOdi(mode){
	console.log('restartOdi(mode)', mode);
	if(mode > 0){
		console.log('SLEEP');
		ODI.utils.setConfig({mode: 'sleep'}, true);
	}else{
		console.log('READY');
		ODI.utils.setConfig({mode: 'ready'}, true);
	}
};

/** Function to reboot RPI */
function reboot(){
	if(CONFIG.mode == 'ready'){
		mute();
		ODI.tts.speak({msg:'Je redaimarre'});
	}
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	setTimeout(function(){
		spawn('sh', [CORE_PATH + 'sh/power.sh', 'reboot']);
	}, 2000);// TODO delete this timeout ?
};

/** Function to shutdown RPI */
function shutdown(){
	if(CONFIG.mode == 'ready'){
		mute();
		ODI.tts.speak({msg:'Arret system'});
	}
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI  -- DON\'T FORGET TO SWITCH OFF POWER SUPPLY !!');
	setTimeout(function(){
		spawn('sh', [CORE_PATH + 'sh/power.sh']);
	}, 2000);// TODO delete this timeout ?
};

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
};

//Grab first CPU Measure
var startMeasure = cpuAverage();

/** Function to get CPU usage */
function getCPUUsage(){
	var endMeasure = cpuAverage();//Grab second Measure
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	//console.log(idleDifference);console.log(endMeasure.idle);console.log(startMeasure.idle);
	var totalDifference = endMeasure.total - startMeasure.total;
	//console.log(totalDifference);console.log(endMeasure.total);console.log(startMeasure.total);
	var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);//Calculate the average percentage CPU usage
	console.debug('CPU usage : ' + percentageCPU + ' %');
	return(percentageCPU);
};

/** Function to get CPU temperature */
function getCPUTemp(callback){
	var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(2));
	return(temperature);
};

/** Function to return Odi's age in days */
var age = 0;
const DATE_BIRTH = new Date('August 9, 2015 00:00:00');
function getOdiAge(){
	age = Math.abs(DATE_BIRTH.getTime() - new Date());
	age = Math.ceil(age / (1000 * 3600 * 24));
	return age;
};

/** Function to update last modified date & time of Odi's files */
var coreUpdate, webUpdate, dataUpdate;
function updateLastModifiedTime(){
	ODI.utils.execCmd('find /home/pi/odi/core -printf "%T+\n" | sort -nr | head -n 1', function(data){
		console.debug('updateLastModifiedTime()', data, typeof data);
		data = data.substring(0, data.indexOf(".")-3);
		// Possibilité de comparer les dates de cette façon: console.log(new Date('2017-04-26 01:06')) OU voir: http://stackoverflow.com/questions/7559555/last-modified-file-date-in-node-js
		// console.log('data2', data);
		ODI.utils.setDefaultConfig({update: data});
		if(CONFIG.update != data){// TODO A VERIFIER !!!
			ODI.utils.setConfig({update: data}, false);
		}
	});
};
updateLastModifiedTime(); // TODO à mettre dans master.js (ou odi.js + odiSlep.js)

/** Function to clean and archive logs */
function cleanLog(){
	spawn('sh', ['/home/pi/odi/core/sh/log.sh', 'clean']);
};

/** Function to get last git commit message */
function getMsgLastGitCommit(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: 'ODI_PATH'}, getMsg);
};
