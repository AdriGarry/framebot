#!/usr/bin/env node

// Api sub-module (server)

const fs = require('fs'),
  multer = require('multer');

const { Core, Flux, Logger, Files, Utils } = require('./../../../api');

const log = new Logger(__filename);

const admin = require(Core._SECURITY + 'admin.js').init(Core._SECURITY);

const FILE_REQUEST_HISTORY = Core._LOG + Core.const('name') + '_requestHistory.log';
const FILE_ERROR_HISTORY = Core._LOG + Core.const('name') + '_errorHistory.json';
const UNKNOWN_HOST_HISTORY = Core._LOG + Core.const('name') + '_unknownHostHistory.json';
const FILE_TTS_UI_HISTORY = Core._LOG + Core.const('name') + '_ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = Core._LOG + Core.const('name') + '_voicemailHistory.json';

let uiHttp;
module.exports = {
  attachRoutes: attachRoutes
};

function attachRoutes(ui) {
  uiHttp = ui;

  attachDefaultRoutes(uiHttp);
  attachFluxRoutes(uiHttp);
  attachUnmappedRouteHandler(uiHttp);
  return uiHttp;
}

function attachFluxRoutes(ui) {
  ui.post('/flux/:type/:subject/:id', function (req, res) {
    let value = req.body;
    if (typeof value === 'object' && value.hasOwnProperty('_wrapper')) value = value._wrapper;
    Flux.do(req.params.type + '|' + req.params.subject + '|' + req.params.id, value);
    res.end();
  });
  return ui;
}

function attachUnmappedRouteHandler(ui) {
  let errorMsg = Core.isAwake() ? 'Error UI > not mapped:' : 'Sleep mode, not allowed to interact';
  ui.post('/*', function (req, res) {
    Core.error(errorMsg, req.url, false);
    res.writeHead(401);
    res.end();
  });
  return ui;
}

function attachDefaultRoutes(ui) {
  /** DASHBOARD SECTION */
  ui.get('/dashboard', function (req, res) {
    Flux.do('interface|hardware|runtime', false, { log: 'debug' });
    let etatBtn = Core.run('etat');
    let cpuTemperature = Core.run('cpu.temperature');
    let cpuUsage = Core.run('cpu.usage');
    let dashboard = {
      config: Core.conf(),
      run: Core.run(),
      errors: Core.errors,
      mode: {
        value: {
          mode: Core.conf('log') == 'trace' ? 'Trace' : Utils.firstLetterUpper(Core.conf('mode')),
          param: Utils.logTime('h:m (D/M)', Core.const('startDateTime')),
          switch: etatBtn === 'high',
          mood: Core.run('mood')
        }
      },
      switch: {
        value: etatBtn,
        active: etatBtn
      },
      volume: {
        value: Core.run('volume'),
        active: etatBtn === 1
      },
      voicemail: {
        value: Core.run('voicemail'),
        active: Core.run('voicemail') > 0
      },
      audioRecord: {
        value: Core.run('audioRecord'),
        active: Core.run('audioRecord') > 0
      },
      music: {
        value: Core.run('music')
      },
      timer: {
        value: Core.run('timer'),
        active: Core.run('timer') > 0
      },
      hardware: {
        value: {
          usage: cpuUsage,
          temperature: cpuTemperature,
          memory: {
            framebot: Core.run('memory.framebot'),
            system: Core.run('memory.system')
          },
          diskSpace: Core.run('stats.diskSpace')
        },
        active: cpuTemperature > 55 || cpuUsage >= 20
      },
      alarms: {
        value: Core.conf('alarms'),
        active: true
      },
      weather: { value: Core.run('weather') },
      powerPlug: { value: Core.conf('rfxcomDevices') },
      rfxcom: { value: Core.run('rfxcom') },
      arduino: { value: Core.run('max') },
      video: { value: Core.run('hdmi') },
      network: { value: Core.run('network') },
      update: {
        value: Core.const('updateDateTime')
      },
      debug: {
        value: Core.conf('log') == 'debug' ? 'debug' : ''
      },
      trace: {
        value: Core.conf('log') == 'trace' ? 'trace' : ''
      },
      watcher: {
        value: Core.conf('watcher')
      }
    };
    res.end(JSON.stringify(dashboard));
  });

  /** ==> GET SECTION */
  ui.get('/log', function (req, res) {
    let logSize = 100;
    let params = req.query;
    if (params.hasOwnProperty('logSize') && !isNaN(params.logSize)) {
      logSize = parseInt(params.logSize);
    }
    prepareLogs(logSize)
      .then(logs => res.end(logs))
      .catch(err => Core.error("Can't retrieve logs", err));
  });

  // '/file/:filename'
  ui.get('/config.json', function (req, res) {
    log.table(Core.conf(), 'CONFIG');
    res.end(JSON.stringify(Core.conf()));
  });

  ui.get('/runtime', function (req, res) {
    Flux.do('interface|hardware|runtime', true);
    setTimeout(() => {
      res.end(JSON.stringify(Core.run()));
    }, 500);
  });

  ui.get('/const', function (req, res) {
    log.table(Core.const(), 'CONST');
    res.end(JSON.stringify(Core.const()));
  });

  ui.get('/errors', function (req, res) {
    res.end(JSON.stringify(Core.errors));
  });

  ui.get('/errorHistory', function (req, res) {
    res.end(fs.readFileSync(FILE_ERROR_HISTORY, 'utf8').toString());
  });

  ui.get('/unknownHostHistory', function (req, res) {
    res.end(fs.readFileSync(UNKNOWN_HOST_HISTORY, 'utf8').toString());
  });

  ui.get('/requestHistory', function (req, res) {
    res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
  });

  ui.get('/ttsUIHistory', function (req, res) {
    res.end(fs.readFileSync(FILE_TTS_UI_HISTORY, 'utf8').toString());
  });

  ui.get('/voicemailHistory', function (req, res) {
    res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
  });

  ui.get('/about', function (req, res) {
    res.end(fs.readFileSync(_PATH + 'README.md', 'utf8').toString());
  });

  /** ==> POST SECTION */

  let audioRecordStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(Core._UPLOAD)) {
        fs.mkdirSync(Core._UPLOAD);
      }
      callback(null, Core._UPLOAD);
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '_' + new Date().toISOString() + '.wav');
    },
    limits: {
      fileSize: 8000000
    }
  });
  let audioRecordUpload = multer({ storage: audioRecordStorage, limits: { fileSize: 8000000 } }).single('audioRecord');

  ui.post('/audio', audioRecordUpload, function (req, res) {
    log.info('Audio received!');
    log.debug(req.file);
    Flux.do('service|audioRecord|new', req.file.path, { delay: 1 });
    res.end();
  });

  ui.post('/toggleDebug', function (req, res) {
    log.info('UI > Toggle debug');
    let newLogLevel = log.level() == 'debug' ? 'info' : 'debug';
    log.level(newLogLevel);
    res.end();
  });

  ui.post('/toggleTrace', function (req, res) {
    log.info('UI > Toggle trace');
    let newLogLevel = log.level() == 'trace' ? 'info' : 'trace';
    log.level(newLogLevel);
    Flux.do('service|context|update', {
      log: newLogLevel
    });
    res.end();
  });

  let granted = false;
  ui.post('/grant', function (req, res) {
    let pattern = req.headers.pwd.split('#')[0]; // get security pattern without anchor character
    if (pattern && admin.checkPassword(pattern)) {
      granted = true;
      log.info('>> Admin granted !');
      let ip = Core.run('network');
      log.info('ip:', ip.local, typeof ip.public === 'string' ? '/ ' + ip.public.trim() : '');
    } else {
      Core.error('>> User NOT granted /!\\', pattern, false);
      Flux.do('interface|tts|speak', { lg: 'en', msg: 'User NOT granted' }, { delay: 0.5 });
    }
    res.send(granted);
    if (granted) granted = false;
  });

  ui.post('/tts', function (req, res) {
    let params = req.query;
    if (params.voice && params.lg && params.msg) {
      if (!Core.isAwake() || params.hasOwnProperty('voicemail')) {
        Flux.do('service|voicemail|new', {
          voice: params.voice,
          lg: params.lg,
          msg: params.msg
        });
      } else {
        Flux.do('interface|tts|speak', {
          voice: params.voice,
          lg: params.lg,
          msg: params.msg
        });
      }
      params.timestamp = Utils.logTime('D/M h:m:s', new Date());
      Files.appendJsonFile(FILE_TTS_UI_HISTORY, params);
    } else {
      Flux.do('interface|tts|random');
    }
    res.end();
  });

  return ui;
}

const LOG_FILE_PATH = Core._LOG + Core.const('name') + '.log';
function prepareLogs(lines) {
  return new Promise((resolve, reject) => {
    fs.readFile(LOG_FILE_PATH, 'UTF-8', (err, logs) => {
      if (err) reject(err);
      logs = logs.toString().split('\n').slice(-lines).join('\n');
      resolve(logs);
    });
  });
}
