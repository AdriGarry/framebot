#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename),
	Utils = require(Core._CORE + 'Utils.js');

Core.flux.interface.sound.subscribe({
	next: flux => {
		if (flux.id == 'mute') {
			mute(flux.value);
		} else if (Core.isAwake()) {
			if (flux.id == 'volume') {
				setVolume(flux.value);
			} else if (flux.id == 'play') {
				playSound(flux.value);
			} else if (flux.id == 'playRandom') {
				playSoundRandomPosition(flux.value);
			} else if (flux.id == 'error') {
				playSound({ mp3: 'system/ressort.mp3', noLog: true });
			} else if (flux.id == 'UI') {
				playSound({ mp3: 'system/UIrequestSound.mp3', noLog: true });
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

setImmediate(() => {
	resetSound();
});

const VOLUME_LEVELS = Array.from({ length: 11 }, (v, k) => k * 10); // 0 to 100, step: 10
var mplayerInstances = {},
	muteTimer;

function playSound(arg) {
	log.debug(arg);
	let soundTitle, sound;
	if (arg.mp3) {
		// try {
		// 	soundTitle = arg.mp3.match(/\/.+.mp3/gm)[0].substr(1);
		// } catch (err) {
		// 	soundTitle = arg.mp3;
		// }
		sound = getPath(arg.mp3);
	} else if (arg.url) {
		soundTitle = arg.url;
		sound = arg.url;
	} else {
		Core.error('No source sound arg', arg);
	}
	let durationLog = arg.duration
		? 'duration=' + (Math.floor(arg.duration / 60) + 'm' + Math.round(arg.duration % 60))
		: '';
	let volLog = arg.volume ? 'vol=' + arg.volume : '';
	let positionLog = arg.position ? 'pos=' + arg.position : '';
	if (!arg.noLog) log.info('play', soundTitle, volLog, positionLog, durationLog);

	let position = arg.position || 0;
	let volume = arg.volume || Core.run('volume');
	doPlay(sound, volume, position, soundTitle, arg.noLog);
}

function playSoundRandomPosition(arg) {
	//arg
	Utils.getMp3Duration(Core._MP3 + arg.mp3, function(length) {
		arg.position = Utils.random(1, Math.floor((length / 100) * 60)); // Position up to 60% of sound duration
		playSound(arg);
	});
}

function doPlay(sound, volume, position, soundTitle, noLog) {
	let startPlayTime = new Date();
	let mplayerProcess = spawn('mplayer', ['-volstep', 10, '-volume', volume, '-ss', position || 0, sound]);

	mplayerProcess.ledFlag = ledFlag();

	mplayerProcess.stderr.on('data', err => {
		log.trace(`stderr: ${err}`); // TODO...
	});

	mplayerProcess.on('close', err => {
		// if (err) Core.error('mplayerProcess.on(close', err);
		// else
		if (!noLog) {
			log.info('play_end ' + soundTitle + ' time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
		}
		clearInterval(mplayerInstances[sound].ledFlag);
		delete mplayerInstances[sound];
	});
	mplayerInstances[sound] = mplayerProcess;
}

/** Function to mute (delay:min) */
function mute(args) {
	clearTimeout(muteTimer);
	if (!args) args = {};
	if (args.hasOwnProperty('delay') && Number(args.delay)) {
		muteTimer = setTimeout(function() {
			// spawn('sh', [Core._SHELL + 'mute.sh', 'auto']);
			Core.do('interface/sound/play', { mp3: 'system/autoMute.mp3' });
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
	writeAllMPlayerInstances('q');
	Core.do('interface|tts|clearTTSQueue', null, { hidden: true });
	Core.do('service|music|stop', null, { hidden: true });
	spawn('sh', [Core._SHELL + 'mute.sh']);
	log.info('>> MUTE  -.-', message ? '"' + message + '"' : '');
	Core.do('interface|led|clearLeds', null, { hidden: true });
	Core.do('interface|led|toggle', { leds: ['eye', 'belly'], value: 0 }, { hidden: true });
	Core.run('music', false);
}

function setVolume(volume) {
	let volumeUpdate = getVolumeInstructions(parseInt(volume));
	if (!volumeUpdate) {
		return;
	}
	let sign = volumeUpdate.increase ? '*' : '/';
	while (volumeUpdate.gap) {
		writeAllMPlayerInstances(sign);
		volumeUpdate.gap--;
	}
	Core.run('volume', volume);
	log.info('Volume level =', volume + '%');
	additionalVolumeSetup();
}

function writeAllMPlayerInstances(sign) {
	log.debug('mplayerInstances.write:', sign);
	Object.keys(mplayerInstances).forEach(key => {
		mplayerInstances[key].stdin.write(sign);
	});
}
function getVolumeInstructions(newVolume) {
	let actualVolume = parseInt(Core.run('volume'));
	let indexNewVolume = VOLUME_LEVELS.indexOf(newVolume);
	if (actualVolume === newVolume) {
		log.info('no volume action (=)');
		return;
	}
	if (indexNewVolume < 0 || indexNewVolume > 100) {
		Core.error('Invalid volume value', 'volume value=' + newVolume, false);
	}
	let increase = newVolume > actualVolume;
	let indexActualVolume = VOLUME_LEVELS.indexOf(actualVolume);

	let gap = Math.abs(indexNewVolume - indexActualVolume);
	log.debug({ increase: increase, gap: gap });
	return { increase: increase, gap: gap };
}

function additionalVolumeSetup() {
	if (Core.run('volume') > 50) {
		Core.do('interface|arduino|connect');
	} else {
		if (Core.run('max')) {
			Core.do('interface|arduino|disconnect');
		}
	}
}

function ledFlag() {
	Core.do('interface|led|altLeds', { speed: 100, duration: 1.3 });
	return setInterval(function() {
		Core.do('interface|led|altLeds', { speed: 100, duration: 1.3 }, { hidden: true });
	}, 10 * 1000);
}

function getPath(path) {
	if (path.indexOf('/home') === -1) {
		return Core._MP3 + path;
	}
	return path;
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
