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
			} else if (flux.id == 'error') {
				playSound({ mp3: 'system/ressort.mp3' }, 'noLog');
			} else if (flux.id == 'UI') {
				playSound({ mp3: 'system/UIrequestSound.mp3' }, 'noLog');
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

function playSound(arg, noLog) {
	log.debug(arg);
	let soundTitle, sound;
	if (arg.mp3) {
		try {
			soundTitle = arg.mp3.match(/\/.+.mp3/gm)[0].substr(1);
		} catch (err) {
			soundTitle = arg.mp3;
		}
		sound = Core._MP3 + arg.mp3;
	} else if (arg.url) {
		soundTitle = arg.url; // or url?
		sound = arg.url;
	} else {
		Core.error('No source sound arg', arg);
	}
	let durationLog = arg.duration
		? 'duration=' + (Math.floor(arg.duration / 60) + 'm' + Math.round(arg.duration % 60))
		: '';
	let volLog = arg.volume ? 'vol=' + arg.volume : '';
	let positionLog = arg.position ? 'pos=' + arg.position : '';
	if (!noLog) log.info('play', soundTitle, volLog, positionLog, durationLog);

	let position = arg.position || 0;
	let volume = arg.volume || Core.run('volume');
	play(sound, volume, position, soundTitle, noLog);
}

function play(sound, volume, position, soundTitle, noLog) {
	let startPlayTime = new Date();
	let mplayerProcess = spawn('mplayer', ['-volstep', 10, '-volume', volume, '-ss', position || 0, sound]);

	mplayerProcess.stderr.on('data', err => {
		log.debug(`stderr: ${err}`); // TODO...
	});

	mplayerProcess.on('close', err => {
		delete mplayerInstances[sound];
		// if (err) Core.error('mplayerProcess.on(close', err);
		// else
		if (!noLog)
			log.info('play_end ' + soundTitle + ' time=' + Math.round(Utils.executionTime(startPlayTime) / 100) / 10 + 'sec');
	});

	mplayerInstances[sound] = mplayerProcess;
}

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
	setVolumeInstances('q');
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
		setVolumeInstances(sign);
		volumeUpdate.gap--;
	}
	Core.run('volume', volume);
	log.info('Volume level =', volume + '%');
	additionalVolumeSetup();
}

function setVolumeInstances(sign) {
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
