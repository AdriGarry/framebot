'use strict';

const { spawn } = require('child_process');

const { Core, Flux, Logger, Observers, Files, Utils } = require('./../../api');

const log = new Logger(__filename);

module.exports = {};

const FLUX_PARSE_OPTIONS = [
  { id: 'loop', fn: loop },
  { id: 'stopLoop', fn: stopLoop },
  { id: 'photo', fn: displayOnePhoto },
  { id: 'video', fn: playOneVideo }
];

Observers.attachFluxParseOptions('service', 'video', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  if (Core.run('etat') == 'high') {
    loop();
  }
});

const LOOP_TIMEOUT = 30 * 60;
let loopStart;

function loop() {
  log.info('starting diapo loop...');
  if (!Core.run('hdmi')) {
    new Flux('interface|hdmi|on');
  }
  Core.run('screen', true);
  loopStart = new Date();
  setTimeout(() => {
    looper();
  }, 1000);
}

function stopLoop() {
  loopStart = null;
  Core.run('screen', false);
}

function shouldContinueVideoLoop() {
  if (!loopStart) {
    return false;
  }
  let now = new Date();
  let timeDiff = Math.ceil(Math.abs(now.getTime() - loopStart.getTime()) / 1000);
  return timeDiff <= LOOP_TIMEOUT;
}

function looper() {
  if (shouldContinueVideoLoop()) {
    if (Utils.rdm()) {
      displayOnePhoto().then(looper);
    } else {
      playOneVideo().then(looper);
    }
  } else log.info('stop video loop (' + LOOP_TIMEOUT + ')');
}

function displayOnePhoto() {
  log.debug('displayOnePhoto');
  return new Promise((resolve, reject) => {
    Files.directoryContent(Core._PHOTO)
      .then(files => {
        let randomTimeout = Utils.rdm(5, 10);
        let photoName = Utils.randomItem(files);
        log.info('displayOnePhoto:', photoName);
        spawn('fbi', ['-a', '-T', 2, Core._PHOTO + photoName]);
        setTimeout(() => {
          spawn('killall', ['fbi']); // fbi running in background
          resolve();
        }, randomTimeout * 1000);
      })
      .catch(err => {
        Core.error('displayOnePhoto error', err);
        reject();
      });
  });
}

function playOneVideo() {
  return new Promise((resolve, reject) => {
    Files.directoryContent(Core._VIDEO + 'rdm/')
      .then(files => {
        let videoName = Utils.randomItem(files);
        log.info('playOneVideo:', videoName);
        let videoInstance = spawn('omxplayer', [
          '-o',
          'hdmi',
          '--vol',
          0,
          '--blank',
          '--win',
          "'0 420 1050 1260'",
          '--layer',
          0,
          Core._VIDEO + 'rdm/' + videoName
        ]);
        videoInstance.stdout.on('data', data => {
          log.debug(`stdout: ${data}`);
        });

        videoInstance.stderr.on('data', data => {
          log.error(`stderr: ${data}`);
        });

        videoInstance.on('close', code => {
          resolve();
        });
      })
      .catch(err => {
        Core.error('playOneVideo error', err);
        reject();
      });
  });
}
