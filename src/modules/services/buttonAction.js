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
      Flux.do('interface|rfxcom|send', { device: 'plug1', value: true });
    } else {
      Flux.do('service|powerPlug|timeout', { plug: 'plug3', mode: true, timeout: 30 });
      return;
      if (Core.run('voicemail')) {
        Flux.do('service|voicemail|check');
      } else if (Core.run('audioRecord')) {
        Flux.do('service|audioRecord|check');
      } else if (Core.run('music')) {
        Flux.do('service|music|playlist', Core.run('music'));
      } else if (Core.run('mood') === 5) {
        if (Utils.rdm()) {
          Flux.do('service|party|tts');
        } else {
          Flux.do('service|party|badBoy');
        }
      } else {
        Flux.do('service|interaction|random');
      }
    }
  } else {
    Flux.do('service|context|restart');
  }
}
function cancelButtonAction(duration) {
  Flux.do('interface|sound|mute');
  if (duration >= 1 && duration < 3) {
    Flux.do('service|context|restart', Core.conf('mode'));
  } else if (duration >= 3 && duration < 6) {
    Flux.do('service|context|restart', 'sleep');
  } else if (duration > 6) {
    Flux.do('interface|hardware|reboot', null, { delay: 3 });
  }
}

function whiteButtonAction(duration) {
  if (Core.isAwake()) {
    Flux.do('service|timer|increase', Math.round(duration));
  } else {
    Flux.do('service|light|on', duration * 60);
  }
}

function blueButtonAction(duration) {
  if (Core.isAwake()) {
    if (Core.run('etat')) {
      Flux.do('service|music|radio', 'fip');
    } else {
      Flux.do('service|music|playlist', 'jukebox');
    }
  } else {
    Flux.do('service|task|goToSleep');
  }
}

function etatButtonAction(value) {
  Core.run('etat', value ? 'high' : 'low');
  log.info('Etat button:', Core.run('etat'));
  Flux.do('interface|led|toggle', { leds: ['satellite'], value: value }, { log: 'trace' });

  if (value) Flux.do('service|mood|set', 3);
  else Flux.do('service|mood|set', 1);

  if (value) Flux.do('interface|nmap|continuous');
  else Flux.do('interface|nmap|stop');
}
