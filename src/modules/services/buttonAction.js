#!/usr/bin/env node
'use strict';

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

// const BTN_PUSH_MIN = 0.4;

Observers.attachFluxParser('service', 'buttonAction', buttonHandler);

function buttonHandler(flux) {
  if (flux.id == 'ok') {
    okButtonAction(flux.value);
  } else if (flux.id == 'cancel') {
    cancelButtonAction(flux.value);
  } else if (flux.id == 'white') {
    whiteButtonAction(flux.value);
  } else if (flux.id == 'blue') {
    blueButtonAction(flux.value);
  } else if (flux.id == 'etat') {
    etatButtonAction(flux.value);
  } else {
    log.error('Unkown button', flux);
    return;
  }
  let buttonStats = Core.run('stats.buttons');
  buttonStats[flux.id] = buttonStats[flux.id] + 1;
  Core.run('stats.buttons', buttonStats);
}

function okButtonAction(duration) {
  if (Core.isAwake()) {
    if (duration > 3) {
      new Flux('interface|rfxcom|send', { device: 'plug1', value: true });
    } else {
      new Flux('service|powerPlug|timeout', { plug: 'plug3', mode: true, timeout: 30 });
      return;
      if (Core.run('voicemail')) {
        new Flux('service|voicemail|check');
      } else if (Core.run('audioRecord')) {
        new Flux('service|audioRecord|check');
      } else if (Core.run('music')) {
        new Flux('service|music|playlist', Core.run('music'));
      } else if (Core.run('mood') === 5) {
        if (Utils.rdm()) {
          new Flux('service|party|tts');
        } else {
          new Flux('service|party|badBoy');
        }
      } else {
        new Flux('service|interaction|random');
      }
    }
  } else {
    new Flux('service|context|restart');
  }
}
function cancelButtonAction(duration) {
  new Flux('interface|sound|mute');
  if (duration >= 1 && duration < 3) {
    new Flux('service|context|restart', Core.conf('mode'));
  } else if (duration >= 3 && duration < 6) {
    new Flux('service|context|restart', 'sleep');
  } else if (duration > 6) {
    new Flux('interface|hardware|reboot', null, { delay: 3 });
  }
}

function whiteButtonAction(duration) {
  if (Core.isAwake()) {
    new Flux('service|timer|increase', Math.round(duration));
  } else {
    new Flux('service|light|on', duration * 60);
  }
}

function blueButtonAction(duration) {
  if (Core.isAwake()) {
    if (Core.run('etat')) {
      new Flux('service|music|radio', 'fip');
    } else {
      new Flux('service|music|playlist', 'jukebox');
    }
  } else {
    new Flux('service|task|goToSleep');
  }
}

function etatButtonAction(value) {
  Core.run('etat', value ? 'high' : 'low');
  log.info('Etat button:', Core.run('etat'));
  new Flux('interface|led|toggle', { leds: ['satellite'], value: value }, { log: 'trace' });

  if (value) new Flux('service|mood|set', 4);
  else new Flux('service|mood|set', 1);

  if (value) new Flux('interface|nmap|continuous');
  else new Flux('interface|nmap|stop');
}
