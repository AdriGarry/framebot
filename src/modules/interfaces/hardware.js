#!/usr/bin/env node

'use strict';

const { exec, spawn } = require('child_process');
const fs = require('fs'),
	os = require('os'),
	Gpio = require('onoff').Gpio;

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(_PATH + 'src/core/Utils.js');

const PATHS = [Core._SRC],
	BYTE_TO_MO = 1048576;

module.exports = {
	api: {
		base: { POST: [{ url: 'archiveLog', flux: { id: 'interface|hardware|archiveLog' } }] },
		full: {
			POST: [
				{ url: 'reboot', flux: { id: 'interface|hardware|reboot', conf: { delay: 0.1 } } },
				{ url: 'shutdown', flux: { id: 'interface|hardware|shutdown', conf: { delay: 0.1 } } },
				{ url: 'light', flux: { id: 'interface|hardware|light', data: 120, conf: { delay: 0.1 } } },
				{ url: 'cpuTTS', flux: { id: 'interface|hardware|cpuTTS' } },
				{ url: 'soulTTS', flux: { id: 'interface|hardware|soulTTS' } },
				{ url: 'diskSpaceTTS', flux: { id: 'interface|hardware|diskSpaceTTS' } },
				{ url: 'totalLinesTTS', flux: { id: 'interface|hardware|totalLinesTTS' } }
			]
		}
	},
	cron: {
		base: [
			{ cron: '*/30 * * * * *', flux: { id: 'interface|hardware|runtime', conf: { log: 'trace' } } },
			{ cron: '0 2 0 * * 1', flux: { id: 'interface|hardware|archiveLog' } }
		],
		full: [{ cron: '30 13 13 * * 0', flux: { id: 'interface|hardware|reboot', conf: { delay: 3 } } }]
	}
};

Core.flux.interface.hardware.subscribe({
	next: flux => {
		if (flux.id == 'reboot') {
			reboot();
		} else if (flux.id == 'shutdown') {
			shutdown();
		} else if (flux.id == 'light') {
			light(flux.value);
		} else if (flux.id == 'runtime') {
			let execTime = new Date();
			retreiveCpuTemp();
			retreiveCpuUsage();
			retreiveMemoryUsage();
			loadAverage();
			// TODO Promise.all()
			log.trace('runtime exec time:', Utils.executionTime(execTime) + 'ms');
		} else if (flux.id == 'cpuTTS') {
			cpuStatsTTS();
		} else if (flux.id == 'soulTTS') {
			soulTTS();
		} else if (flux.id == 'diskSpaceTTS') {
			diskSpaceTTS();
		} else if (flux.id == 'totalLinesTTS') {
			totalLinesTTS();
		} else if (flux.id == 'archiveLog') {
			archiveLogs();
		} else Core.error('unmapped flux in Hardware interface', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	retreiveLastModifiedDate(PATHS);
	countSoftwareLines();
	getDiskSpace();
	// TODO Promise.all()
});

var etat = new Gpio(13, 'in', 'both', {
	persistentWatch: true,
	debounceTimeout: 500
});

/** Function to reboot RPI */
function reboot() {
	if (Core.isAwake()) {
		Core.do('interface|sound|mute');
		Core.do('interface|tts|speak', { msg: 'Je redaimarre' });
		Core.do('interface|arduino|write', 'playHornOff', { delay: 2 });
	}
	console.log('\n\n_/!\\__REBOOTING RASPBERRY PI !!\n');
	setTimeout(function() {
		spawn('reboot');
	}, 2000);
}

/** Function to shutdown RPI */
function shutdown() {
	if (Core.isAwake()) {
		Core.do('interface|sound|mute');
		Core.do('interface|tts|speak', { msg: 'Arret system' });
		Core.do('interface|arduino|write', 'playHornOff', { delay: 2 });
	}
	setTimeout(function() {
		console.log("\n\n /!\\  SHUTING DOWN RASPBERRY PI - DON'T FORGET TO SWITCH OFF POWER SUPPLY !!\n");
		spawn('halt');
	}, 2000);
}

const LIGTH_LEDS = ['eye', 'belly'];
/** Function to use belly led as light */
function light(duration) {
	log.info('light [duration=' + duration + 's]');
	if (isNaN(duration)) Core.error('light error: duration arg is not a number!', duration, false);
	let loop = (duration - 2) / 2;
	Core.do('interface|led|toggle', { leds: LIGTH_LEDS, value: 1 });
	Core.do('interface|led|toggle', { leds: LIGTH_LEDS, value: 1 }, { log: 'trace', delay: 2, loop: loop });

	Core.do('interface|led|blink', { leds: LIGTH_LEDS, speed: 200, loop: 8 }, { delay: duration - 2 });

	Core.do('interface|led|toggle', { leds: LIGTH_LEDS, value: 0 }, { delay: duration });
}

/** Function to tts cpu stats */
function cpuStatsTTS() {
	Core.do('interface|tts|speak', {
		lg: 'fr',
		msg: 'Mon  ' + (Utils.rdm() ? 'processeur' : 'CPU') + ' est a ' + retreiveCpuTemp() + '  degrai...'
	});
	Core.do('interface|tts|speak', {
		lg: 'fr',
		msg: Utils.rdm()
			? 'Et il tourne a ' + retreiveCpuUsage() + ' pour cent'
			: 'Pour ' + retreiveCpuUsage() + " pour cent d'utilisation"
		// 'pour 34 pour cent d\'utilisation'
	});
}

function retreiveCpuTemp() {
	let temperature = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
	temperature = (temperature / 1000).toPrecision(2);
	Core.run('cpu.temp', temperature + '°');
	return temperature;
}

/** Function to get CPU usage */
function retreiveCpuUsage() {
	let endMeasure = cpuAverage(); //Grab second Measure
	//Calculate the difference in idle and total time between the measures
	let idleDifference = endMeasure.idle - startMeasure.idle;
	let totalDifference = endMeasure.total - startMeasure.total;
	let percentageCPU = 100 - ~~((100 * idleDifference) / totalDifference); //Calculate the average percentage CPU usage
	Core.run('cpu.usage', percentageCPU + '%');
	return percentageCPU;
}

//Create function to get CPU information
function cpuAverage() {
	//Initialise sum of idle and time of cores and fetch CPU info
	let totalIdle = 0,
		totalTick = 0,
		cpus = os.cpus();
	//Loop through CPU cores
	for (var i = 0, len = cpus.length; i < len; i++) {
		let cpu = cpus[i]; // Select CPU core
		//Total up the time in the cores tick
		for (let type in cpu.times) {
			totalTick += cpu.times[type];
		}
		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}
	//Return the average Idle and Tick times
	return {
		idle: totalIdle / cpus.length,
		total: totalTick / cpus.length
	};
}
//Grab first CPU Measure
var startMeasure = cpuAverage();

/** Function to get memory usage stats (Core + system) */
function soulTTS() {
	let size = Math.round(Core.run('memory.odi'));
	let ttsMsg = size + ' maiga octet, sait le poids de mon ame ' + (Utils.rdm() ? '' : 'en ce moment');
	Core.do('interface|tts|speak', ttsMsg);
}

/** Function to get memory usage stats (Core + system) */
function retreiveMemoryUsage() {
	let usedByCore = process.memoryUsage();
	usedByCore = (usedByCore.rss / BYTE_TO_MO).toFixed(1);
	Core.run('memory.odi', usedByCore);

	let totalMem = (os.totalmem() / BYTE_TO_MO).toFixed(0);
	let freeMem = (os.freemem() / BYTE_TO_MO).toFixed(0);
	let usedMem = (totalMem - freeMem).toFixed(0);
	Core.run('memory.system', usedMem + '/' + totalMem);
}

/** Function to get load average (uptime) */
function loadAverage() {
	Utils.execCmd('uptime')
		.then(data => {
			// var loadAverage = data.match(/load average: (.+)/g);
			// log.debug('>uptime', loadAverage);
			// Core.run('memory.loadAverage', loadAverage[0]);
			let regex = /load average: (.+)/g;
			let result = regex.exec(data);
			let loadAverage = result && result[1] ? result[1] : -1;
			log.trace('uptime', loadAverage);
			Core.run('memory.loadAverage', loadAverage);
		})
		.catch(err => {
			Core.error('loadAverage error', err);
		});
}

/** Function to update last modified date & time of Program's files */
function retreiveLastModifiedDate(paths) {
	// typeof paths => Array
	paths = paths.join(' ');
	Utils.execCmd('find ' + paths + ' -exec stat \\{} --printf="%y\\n" \\; | sort -n -r | head -n 1')
		.then(data => {
			let lastDate = data.match(/[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}/g);
			log.debug('getLastModifiedDate()', lastDate[0]);
			Core.run('stats.update', lastDate[0]);
		})
		.catch(err => {
			Core.error('retreiveLastModifiedDate error', err);
		});
}

/** Function to tts disk space */
function diskSpaceTTS() {
	let diskSpace = parseInt(Core.run('stats.diskSpace'));
	let ttsMsg = Utils.rdm()
		? 'Il me reste environ ' + (100 - diskSpace) + " pour cent d'espace disque disponible"
		: "J'utilise " + diskSpace + " pour cent d'espace de stockage";
	Core.do('interface|tts|speak', ttsMsg);
}

/** Function to retreive disk space on /dev/root */
function getDiskSpace(callback) {
	Utils.execCmd('df -h')
		.then(data => {
			let diskSpace = data.match(/\/dev\/root.*[%]/gm);
			diskSpace = diskSpace[0].match(/[\d]*%/g);
			log.debug('Disk space:', diskSpace[0]);
			Core.run('stats.diskSpace', diskSpace[0]);

			if (parseInt(diskSpace) >= 80) {
				// log.warn('Warning: disk space almost full: ' + Core.run('stats.diskSpace') + '%');
				let logMessage = 'Warning: disk space almost full: ' + Core.run('stats.diskSpace') + '%';
				log.warn(logMessage);
				Core.do('service|sms|send', logMessage);
			}
		})
		.catch(err => {
			Core.error('getDiskSpace error', err);
		});
}

/** Function to TTS program's program total lines */
function totalLinesTTS() {
	let ttsMsg = 'Mon programme est composer de ' + Core.run('stats.totalLines') + ' lignes de code';
	Core.do('interface|tts|speak', ttsMsg);
}

/** Function to count lines of program's software */
function countSoftwareLines() {
	const EXTENSIONS = ['js', 'json', 'properties', 'sh', 'py', 'html', 'css'];
	const PATHS = [Core._SRC, Core._DATA, Core._CONF];
	let typesNb = EXTENSIONS.length;
	let lines = {},
		totalLines = 0;
	EXTENSIONS.forEach(function(extension) {
		let command = 'find ' + PATHS.join(' ') + ' -regex ".+.' + extension + '" -print | grep -v lib | xargs wc -l';
		//find /home/pi/core/src/ /home/pi/core/data/ /home/pi/core/conf/ -regex ".+.css" -print | grep -v lib | xargs wc -l
		Utils.execCmd(command, 'noLog')
			.then(data => {
				let regex = /(\d*) total/g;
				let result = regex.exec(data);
				let t = result && result[1] ? result[1] : 0;
				totalLines = parseInt(totalLines) + parseInt(t);
				lines[extension] = parseInt(t);
				typesNb--;
				if (!typesNb) {
					log.debug('countSoftwareLines()', totalLines);
					log.debug('stats.totalLines:', lines);
					Core.run('stats.totalLines', totalLines);
				}
			})
			.catch(err => {
				Core.error('countSoftwareLines error', err);
			});
	});
}

/** Function to clean and archive logs each week */
function archiveLogs() {
	log.info('Clean log files  /!\\');
	let date = new Date();
	let weekNb = date.getWeek();
	if (!fs.existsSync(Core._LOG + 'old')) {
		fs.mkdirSync(Core._LOG + 'old');
	}

	fs.readdir(Core._LOG, { withFileTypes: true }, (err, logFiles) => {
		logFiles.forEach(logFile => {
			if (logFile.isFile()) {
				archiveLogFile(logFile.name, weekNb);
			}
		});
	});
}

function archiveLogFile(logFile, weekNb) {
	let stream = fs.createReadStream(Core._LOG + logFile); /*, {bufferSize: 64 * 1024}*/
	stream.pipe(fs.createWriteStream(Core._LOG + 'old/' + logFile + weekNb));
	stream.on('error', function(e) {
		Core.error('stream error while archiving log file ' + logFile, e);
	});
	stream.on('close', function() {
		fs.truncate(Core._LOG + logFile, 0, function() {
			log.info(logFile + ' successfully archived');
		});
	});
}
