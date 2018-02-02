#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');
var Gpio = require('onoff').Gpio;
var fs = require('fs');
var os = require('os');

const PATHS = [Odi._SRC];
const BYTE_TO_MO = 1048576;
retreiveLastModifiedDate(PATHS);
countSoftwareLines();

Flux.module.hardware.subscribe({
	next: flux => {
		if (flux.id == 'runtime') {
			getDiskSpace();
			retreiveCpuTemp();
			retreiveCpuUsage();
			retreiveMemoryUsage();
			getEtatValue();
			// } else if (flux.id == 'stats') {
			// 	retreiveLastModifiedDate(PATHS);
			// 	countSoftwareLines();
		} else if (flux.id == 'cpu') {
			// cpuTempTTS();
			cpuStatsTTS();
		} else if (flux.id == 'cleanLog') {
			cleanLog();
		} else Odi.error('unmapped flux in Hardware module', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

var etat = new Gpio(13, 'in', 'both', { persistentWatch: true, debounceTimeout: 500 });
function getEtatValue() {
	var etatValue = etat.readSync();
	Odi.run('etat', etatValue ? 'high' : 'low');
	Odi.run('volume', Odi.isAwake() ? (etatValue ? 400 : -400) : 'mute');
}

/** Function to tts cpu stats */
function cpuStatsTTS() {
	Flux.next('module', 'tts', 'speak', {
		lg: 'fr',
		msg: 'Mon  ' + (Utils.random() ? 'processeur' : 'CPU') + ' est a ' + retreiveCpuTemp() + '  degrai...'
	});
	Flux.next('module', 'tts', 'speak', {
		lg: 'fr',
		msg: Utils.random()
			? 'Et il tourne a ' + retreiveCpuUsage() + ' pour cent'
			: 'Pour ' + retreiveCpuUsage() + " pour cent d'utilisation"
		// 'pour 34 pour cent d\'utilisation'
	});
}

function retreiveCpuTemp() {
	var temperature = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
	temperature = (temperature / 1000).toPrecision(2);
	Odi.run('cpu.temp', temperature + '°');
	return temperature;
}

/** Function to get CPU usage */
function retreiveCpuUsage() {
	var endMeasure = cpuAverage(); //Grab second Measure
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;
	var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference); //Calculate the average percentage CPU usage
	Odi.run('cpu.usage', percentageCPU + '%');
	return percentageCPU;
}

//Create function to get CPU information
function cpuAverage() {
	//Initialise sum of idle and time of cores and fetch CPU info
	var totalIdle = 0,
		totalTick = 0;
	var cpus = os.cpus();
	//Loop through CPU cores
	for (var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i]; // Select CPU core
		//Total up the time in the cores tick
		for (var type in cpu.times) {
			totalTick += cpu.times[type];
		}
		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}
	//Return the average Idle and Tick times
	return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}
//Grab first CPU Measure
var startMeasure = cpuAverage();

/** Function to get memory usage stats (Odi + system) */
function retreiveMemoryUsage() {
	let usedByOdi = process.memoryUsage();
	usedByOdi = (usedByOdi.rss / BYTE_TO_MO).toFixed(1);
	Odi.run('memory.odi', usedByOdi + 'Mo');

	let totalMem = (os.totalmem() / BYTE_TO_MO).toFixed(0);
	let freeMem = (os.freemem() / BYTE_TO_MO).toFixed(0);
	let usedMem = (totalMem - freeMem).toFixed(0);
	Odi.run('memory.system', usedMem + '/' + totalMem + 'Mo');
}

/** Function to update last modified date & time of Odi's files */
function retreiveLastModifiedDate(paths, callback) {
	// typeof paths => Array
	paths = paths.join(' ');
	Utils.execCmd('find ' + paths + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1', function(data) {
		var lastDate = data.match(/[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}/g);
		log.debug('getLastModifiedDate()', lastDate[0]);
		Odi.run('stats.update', lastDate[0]);
		// if (callback) callback(lastDate[0]);
	});
}

/** Function to count lines of Odi's software */
function countSoftwareLines(callback) {
	var extensions = ['js', 'json', 'properties', 'sh', 'py', 'html', 'css']; //, 'properties'
	var typesNb = extensions.length;
	var totalLines = 0;
	extensions.forEach(function(item, index) {
		var temp = item;
		Utils.execCmd('find /home/pi/odi/src -name "*.' + temp + '" -print | xargs wc -l', function(data) {
			var regex = /(\d*) total/g;
			var result = regex.exec(data);
			var t = result && result[1] ? result[1] : -1;
			totalLines = parseInt(totalLines) + parseInt(t);
			typesNb--;
			if (!typesNb) {
				log.debug('countSoftwareLines()', totalLines);
				Odi.run('stats.totalLines', totalLines);
				// if (callback) callback(totalLines);
			}
		});
	});
}

/** Function to retreive disk space on /dev/root */
function getDiskSpace(callback) {
	Utils.execCmd('df -h', function(data) {
		var diskSpace = data.match(/\/dev\/root.*[%]/gm);
		diskSpace = diskSpace[0].match(/[\d]*%/g);
		log.debug('Disk space:', diskSpace[0]);
		Odi.run('stats.diskSpace', diskSpace[0]);
		if (callback) callback(diskSpace);
	});
}

/** Function to clean and archive logs each week */
function cleanLog() {
	// TODO also clean and archive errors, tts, voicemail and request log files !!
	log.info('cleaning logs...');
	var date = new Date();
	var weekNb = date.getWeek();
	if (!fs.existsSync(Odi._LOG + 'old')) {
		fs.mkdirSync(Odi._LOG + 'old');
	}
	var stream = fs.createReadStream(Odi._LOG + 'odi.log'); /*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(Odi._LOG + 'old/odi' + weekNb + '.log'));
	stream.on('error', function(e) {
		// log.error('config.resetCfg() stream error', e);
		Odi.error('config.resetCfg() stream error', e);
	});
	stream.on('close', function() {
		fs.truncate(Odi._LOG + 'odi.log', 0, function() {
			log.INFO('logs successfully cleaned.');
		});
	});
}
