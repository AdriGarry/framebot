#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);

const Utils = require(Core._CORE + 'Utils.js');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

Core.flux.interface.sound.subscribe({
	next: flux => {
		if (flux.id == 'mute') {
			mute(flux.value);
		} else if (Core.isAwake()) {
			if (flux.id == 'volume') {
				setVolume(flux.value);
			} else if (flux.id == 'play') {
				playSound(flux.value);
			} else if (flux.id == 'error') {
				playSound({ mp3: 'system/ressort.mp3' }, 'noLog');
			} else if (flux.id == 'UI') {
				spawn('sh', [Core._SHELL + 'sounds.sh', 'UIRequest']);
			} else if (flux.id == 'reset') {
				resetSound();
			} else {
				Core.error('unmapped flux in Sound module', flux, false);
			}
		}
	},
	error: err => {
		Core.error(flux);
	}
});

resetSound();

function setVolume(volume) {
	log.info('setVolume()', volume); // TODO
}

var omxplayerInstances = {};
function setVolume(volume) {
	log.INFO('......');
	log.INFO('setVolume', volume);
	Object.keys(playbackInstances).forEach(key => {
		omxplayerInstances[key].stdin.write('+');
	});
}

function playSound(arg, noLog) {
	log.debug(arg);
	let mp3Title;
	try {
		mp3Title = arg.mp3.match(/\/.+.mp3/gm)[0].substr(1);
	} catch (err) {
		mp3Title = arg.mp3;
	}
	let durationLog = arg.duration
		? 'duration=' + (Math.floor(arg.duration / 60) + 'm' + Math.round(arg.duration % 60))
		: '';
	let volLog = arg.volume ? 'vol=' + arg.volume : '';
	let positionLog = arg.position ? 'pos=' + arg.position : '';
	if (!noLog) log.info('play', mp3Title, volLog, positionLog, durationLog);

	let position = arg.position || 0;
	let volume = arg.volume || Core.run('volume');
	let sound = Core._MP3 + arg.mp3;
	let startPlayTime = new Date();

	const { spawn, exec } = require('child_process');
	const omxProcess = spawn('omxplayer', ['-o', 'local', '--pos', position, '--vol', volume, sound]);

	omxProcess.on('close', err => {
		delete omxplayerInstances[sound];
		console.log(err);
		if (err) {
			log.error(err);
		} else {
			if (!noLog) log.info('play end. time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
		}
	});

	omxplayerInstances[sound] = omxProcess;

	// Utils.execCmd('omxplayer -o local --pos ' + position + ' --vol ' + volume + ' ' + sound, function(callback) {
	// 	// always log callback
	// 	if (callback.toString() == '' || callback.toString().indexOf('have a nice day') >= 0) {
	// 		if (!noLog) log.info('play end. time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
	// 	} else {
	// 		console.log('callback', callback); // TODO mieux gérer l'erreur car elle est déclenchée si on mute un fichier audio
	// 		Core.error('File not found', callback.unQuote(), false);
	// 	}
	// });
}

var muteTimer, delay;
/** Function to mute (delay:min) */
function mute(args) {
	clearTimeout(muteTimer);
	if (!args) args = {};
	if (args.hasOwnProperty('delay') && Number(args.delay)) {
		muteTimer = setTimeout(function() {
			spawn('sh', [Core._SHELL + 'mute.sh', 'auto']);
			setTimeout(function() {
				stopAll(args.message || null);
			}, 1600);
		}, Number(args.delay) * 1000);
	} else {
		stopAll(args.message || null);
	}
}

/** Function to stop all sounds & leds */
function stopAll(message) {
	if (Core.run('max')) {
		Core.do('interface|arduino|disconnect', null, { hidden: true });
		Core.do('interface|arduino|connect', null, { hidden: true });
	}
	Core.do('interface|tts|clearTTSQueue', null, { hidden: true });
	Core.do('service|music|stop', null, { hidden: true });
	spawn('sh', [Core._SHELL + 'mute.sh']);
	log.info('>> MUTE  -.-', message ? '"' + message + '"' : '');
	Core.do('interface|led|clearLeds', null, { hidden: true });
	Core.do('interface|led|toggle', { leds: ['eye', 'belly'], value: 0 }, { hidden: true });
	Core.run('music', false);
}

/** Function to reset sound */
function resetSound() {
	log.info('resetSound [amixer set PCM 100%]');
	Utils.execCmd('amixer set PCM 100%', function(data) {
		log.debug(data);
	});

	// spawn('amixer', [' set PCM 100%'], callback => {
	// 	console.log(callback);
	// });
}
