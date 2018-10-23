#!/usr/bin/env node
'use strict';

var Core = require(_PATH + 'src/core/Core.js').Core;
const log = new (require(Core._CORE + 'Logger.js'))(__filename);

const Utils = require(Core._CORE + 'Utils.js');
const spawn = require('child_process').spawn;

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

const VOLUME_LEVELS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
var mplayerInstances = {};

function setVolume(volume) {
	log.info('setting volume:', volume);
	let volumeUpdate = getVolumeInstructions(parseInt(volume));
	if (!volumeUpdate) {
		return;
	}
	let sign = volumeUpdate.increase ? '*' : '/';
	// console.log(volumeUpdate, sign);
	while (volumeUpdate.gap) {
		Object.keys(mplayerInstances).forEach(key => {
			console.log(key, 'stdin.write', sign);
			// for (var i = 0; i < 7; i++) {
			mplayerInstances[key].stdin.write(sign);
			// }
		});
		volumeUpdate.gap--;
	}
	Core.run('volume', volume);
	// console.log('__');
	log.info('Volume level =', volume + '%');
}

function getVolumeInstructions(newVolume) {
	// log.info(typeof newVolume, newVolume);
	let actualVolume = parseInt(Core.run('volume'));
	let indexNewVolume = VOLUME_LEVELS.indexOf(newVolume);
	if (actualVolume === newVolume) {
		log.info('no volume action (=)');
		return;
	}
	if (indexNewVolume < 0 || indexNewVolume > 100) {
		Core.error('Invalid volume value', 'volume value=' + newVolume);
	}
	// console.log(newVolume, actualVolume);
	// console.log(typeof newVolume, typeof actualVolume);
	let increase = newVolume > actualVolume;
	let indexActualVolume = VOLUME_LEVELS.indexOf(actualVolume);

	let gap = Math.abs(indexNewVolume - indexActualVolume);
	log.debug({ increase: increase, gap: gap });
	return { increase: increase, gap: gap };
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
	volume = 60;
	let sound = Core._MP3 + arg.mp3;
	let startPlayTime = new Date();

	const { spawn, exec } = require('child_process'); // TODO... replace anywhere ?
	const omxProcess = spawn('mplayer', ['-volstep', 10, '-volume', volume, '-ss', position, sound]);

	omxProcess.on('close', err => {
		delete mplayerInstances[sound];
		// if (err) Core.error('omxProcess.on(close', err);
		// else
		if (!noLog) log.info('play end. time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
	});

	mplayerInstances[sound] = omxProcess;
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

	Core.run('volume', Core.run('etat') === 'high' ? 100 : 50);
	log.info('Volume level =', Core.run('volume') + '%');
}
