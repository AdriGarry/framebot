#!/usr/bin/env node
'use strict';

const { spawn, exec } = require('child_process');

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {
  cron: {
    full: [
      { cron: '0 30 8 * * *', flux: { id: 'interface|sound|volume', data: 40 } },
      { cron: '0 45 18 * * *', flux: { id: 'interface|sound|volume', data: 60 } }
    ]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'mute', fn: mute },
  { id: 'volume', fn: setVolume, condition: { isAwake: true } },
  { id: 'play', fn: playSound, condition: { isAwake: true } },
  { id: 'playRandom', fn: playSoundRandomPosition, condition: { isAwake: true } },
  { id: 'error', fn: playErrorSound, condition: { isAwake: true } },
  { id: 'UI', fn: playUISound, condition: { isAwake: true } },
  { id: 'motionDetect', fn: playMotionDetectSound, condition: { isAwake: true } },
  { id: 'reset', fn: resetSoundOutput, condition: { isAwake: true } }
];

Observers.attachFluxParseOptions('interface', 'sound', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  resetSoundOutput();
});

const VOLUME_LEVELS = Array.from({ length: 11 }, (v, k) => k * 10); // 0 to 100, step: 10
let playerInstances = {},
  muteTimer;

function playSound(arg) {
  log.debug('playSound(arg)', arg);
  let soundTitle, sound;
  if (arg.file) {
    try {
      soundTitle = Files.getFilename(arg.file);
    } catch (err) {
      soundTitle = arg.file;
    }
    sound = Files.getAbsolutePath(arg.file, Core._MP3);
    if (!sound) return;
  } else if (arg.url) {
    soundTitle = arg.url;
    sound = arg.url;
  } else {
    Core.error('No source sound arg', arg);
  }

  let position = arg.position || 0;
  let volume = arg.volume || Core.run('volume');

  let isWavFile = sound.endsWith('.wav');
  if (isWavFile) {
    soundTitle = Files.getFilename(arg.file);
    let convertedSoundPath = Core._TMP + soundTitle + '.mp3';
    exec(`/usr/bin/ffmpeg -y -i ${sound} ${convertedSoundPath}`, (err, stdout, stderr) => {
      doPlay(convertedSoundPath, volume, position, soundTitle, arg.noLog, arg.noLed);
    });
  } else doPlay(sound, volume, position, soundTitle, arg.noLog, arg.noLed);
}

function playSoundRandomPosition(arg) {
  let sound = Files.getAbsolutePath(arg.file, Core._MP3);
  if (!sound) return;
  Files.getDuration(sound)
    .then(data => {
      arg.position = Utils.random(1, Math.floor((data / 100) * 50)); // Position up to 50% of sound duration
      playSound(arg);
    })
    .catch(err => {
      Core.error('playSoundRandomPosition error', err);
    });
}

function doPlay(sound, volume, position, soundTitle, noLog, noLed) {
  let startPlayTime = new Date();

  let volLog = volume ? 'vol=' + volume : '';
  let positionLog = position ? 'pos=' + Utils.formatDuration(position) : '';
  if (!noLog) log.info('play', soundTitle, volLog, positionLog);

  position = position || 0; // TODO Skipping frames instead of seconds...

  let playerProcess = spawn('/usr/bin/mpg321', ['-g', volume, '-k', position, '-K', '-q', sound]);

  if (!noLed) playerProcess.ledFlag = ledFlag();

  playerProcess.stderr.on('data', err => {
    if (err && !err.indexOf('Inappropriate ioctl for device')) log.error('player error for ' + soundTitle || sound, Buffer.from(err).toString());
  });

  playerProcess.on('close', err => {
    if (err) log.error('player.onClose ' + soundTitle + ' error', err);
    if (!noLog) {
      let playTime = Utils.formatDuration(Math.round(Utils.executionTime(startPlayTime) / 100) / 10);
      log.info('play_end ' + soundTitle + ' [duration:', playTime + ']');
    }
    clearInterval(playerProcess.ledFlag);
    delete playerInstances[sound];
  });
  playerInstances[sound] = playerProcess;
}

/** Function to mute */
function mute(args) {
  clearTimeout(muteTimer);
  if (!args) args = {};
  if (args.hasOwnProperty('delay') && Number(args.delay)) {
    muteTimer = setTimeout(function () {
      new Flux('interface|sound|play', { file: 'system/autoMute.mp3' });
      setTimeout(function () {
        muteAll(args.message || null);
      }, 1600);
    }, Number(args.delay) * 1000);
  } else {
    muteAll(args.message || null);
  }
}

/** Function to stop all sounds & leds */
function muteAll(message) {
  if (Core.run('max')) {
    new Flux('interface|arduino|disconnect', null, { log: 'trace' });
    new Flux('interface|arduino|connect', null, { log: 'trace' });
  }
  new Flux('service|music|stop', null, { log: 'trace' });
  new Flux('interface|tts|clearTTSQueue', null, { log: 'trace' });
  exec('/usr/bin/sudo /usr/bin/killall mpg321');
  exec('/usr/bin/sudo /usr/bin/killall espeak');
  log.info('>> MUTE', message ? '"' + message + '"' : '');
  new Flux('interface|led|clearLeds', null, { log: 'trace' });
  new Flux('interface|led|toggle', { leds: ['eye', 'belly'], value: 0 }, { log: 'trace' });
  Core.run('music', false);
}

function setVolume(volume) {
  if (typeof volume === 'object' && volume.hasOwnProperty('value')) volume = volume.value;
  if (!isNaN(volume)) {
    let volumeUpdate = getVolumeInstructions(parseInt(volume));
    if (!volumeUpdate) return;

    let sign = volumeUpdate.increase ? '*' : '/';
    while (volumeUpdate.gap) {
      writeAllPlayerInstances(sign);
      volumeUpdate.gap--;
    }
    Core.run('volume', volume);
    log.info('Volume level =', volume + '%');
  } else {
    Core.error('volume argument not a numeric value', volume);
  }
}

function writeAllPlayerInstances(sign) {
  log.trace('playerInstances.write:', sign);
  Object.keys(playerInstances).forEach(key => {
    playerInstances[key].stdin.write(sign);
  });
}

function getVolumeInstructions(newVolume) {
  let actualVolume = parseInt(Core.run('volume'));
  let indexNewVolume = VOLUME_LEVELS.indexOf(newVolume);
  if (actualVolume === newVolume) {
    log.debug('same volume as configured');
    return;
  }
  if (indexNewVolume < 0 || indexNewVolume > 100) {
    Core.error('Invalid volume value', 'volume value=' + newVolume, false);
  }
  let increase = newVolume > actualVolume;
  let indexActualVolume = VOLUME_LEVELS.indexOf(actualVolume);

  let gap = Math.abs(indexNewVolume - indexActualVolume);
  gap = gap * 3; // Needed because of mpg321 volume step (3)
  return { increase: increase, gap: gap };
}

function ledFlag() {
  new Flux('interface|led|blink', { leds: ['eye'], speed: 100, loop: 3 }, { log: 'trace' });
  return setInterval(function () {
    new Flux('interface|led|altLeds', { speed: 100, duration: 1.3 }, { log: 'trace' });
  }, 10 * 1000);
}

function playErrorSound() {
  playSound({ file: 'system/ressort.mp3', volume: 10, noLog: true, noLed: true });
}

function playUISound() {
  playSound({ file: 'system/UIrequestSound.mp3', noLog: true, noLed: true });
}

function playMotionDetectSound() {
  playSound({ file: 'system/sonar.mp3', noLog: true, noLed: true });
}

/** Function to reset sound output */
function resetSoundOutput() {
  log.info('Reset sound output [amixer set PCM 100%]');
  Utils.execCmd('/usr/bin/amixer cset numid=2 1')
    .then(data => {
      log.debug(data);
    })
    .catch(err => {
      Core.error('Reset sound output error', err);
    });
}
