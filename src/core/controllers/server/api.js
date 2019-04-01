#!/usr/bin/env node

// Api sub-module (server)

const { spawn, exec } = require('child_process');
const fs = require('fs'),
	multer = require('multer');

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js'),
	admin = require(Core._SECURITY + 'admin.js').init(Core._SECURITY);

const FILE_REQUEST_HISTORY = Core._LOG + Core.name + '_requestHistory.log';
const FILE_ERROR_HISTORY = Core._LOG + Core.name + '_errorHistory.json';
const FILE_TTS_UI_HISTORY = Core._LOG + Core.name + '_ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = Core._LOG + Core.name + '_voicemailHistory.json';

var uiHttp;
module.exports = {
	attachRoutes: attachRoutes
};

function attachRoutes(ui, modulesApi) {
	uiHttp = ui;

	if (!Array.isArray(modulesApi)) modulesApi = [modulesApi];
	modulesApi.forEach(item => {
		log.trace('POST /' + item.url);
		uiHttp.post('/' + item.url, (req, res) => {
			// add to url: /api/... ?
			if (!Array.isArray(item.flux)) item.flux = [item.flux];
			item.flux.forEach(flux => {
				Core.do(flux.id, flux.data, flux.conf);
				// TODO req.body => flux.value
			});
			res.end();
		});
	});

	attachDefaultRoutes(uiHttp);

	if (Core.isAwake()) {
		attachAwakeRoutes(uiHttp);
	} else {
		attachSleepRoutes(uiHttp);
	}
	return uiHttp;
}

function attachDefaultRoutes(ui) {
	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		Core.do('interface|hardware|runtime');
		var etatBtn = Core.run('etat');
		var cpuTemp = Core.run('cpu.temp');
		var cpuUsage = Core.run('cpu.usage');
		var dashboard = {
			config: Core.conf(),
			errors: Core.errors,
			mode: {
				value: {
					mode:
						Core.conf('log') == 'trace'
							? 'Trace'
							: Core.conf('log') == 'debug'
							? 'Debug'
							: Utils.firstLetterUpper(Core.conf('mode')),
					param: Core.conf('startTime'),
					switch: etatBtn == 'high' ? true : false
				}
			},
			switch: {
				value: etatBtn,
				active: etatBtn ? true : false
			},
			volume: {
				value: Core.run('volume'),
				active: etatBtn == 1 ? true : false
			},
			voicemail: {
				value: Core.run('voicemail'),
				active: Core.run('voicemail') > 0 ? true : false
			},
			audioRecord: {
				value: Core.run('audioRecord'),
				active: Core.run('audioRecord') > 0 ? true : false
			},
			music: {
				value: Core.run('music'),
				active: false
			},
			timer: {
				value: Core.run('timer'),
				active: Core.run('timer') > 0 ? true : false
			},
			hardware: {
				value: {
					usage: cpuUsage,
					temp: cpuTemp,
					memory: {
						odi: Core.run('memory.odi'),
						system: Core.run('memory.system')
					}
				},
				active: cpuTemp > 55 || cpuUsage >= 20 ? true : false
			},
			alarms: {
				value: Core.conf('alarms'),
				active: true
			},
			update: {
				value: Core.run('stats.update')
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
	ui.get('/log', function(req, res) {
		let logSize = 100;
		let params = req.query;
		if (params.hasOwnProperty('logSize') && !isNaN(params.logSize)) {
			logSize = parseInt(params.logSize);
		}
		prepareLogs(logSize, function(log) {
			res.end(log);
		});
	});

	ui.get('/config.json', function(req, res) {
		log.table(Core.conf(), 'CONFIG');
		res.end(JSON.stringify(Core.conf()));
	});

	ui.get('/runtime', function(req, res) {
		Core.do('interface|hardware|runtime');
		log.table(Core.run(), 'RUNTIME');
		res.end(JSON.stringify(Core.run()));
	});

	ui.get('/errors', function(req, res) {
		res.end(JSON.stringify(Core.errors));
	});

	ui.get('/errorHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_ERROR_HISTORY, 'utf8').toString());
	});

	ui.get('/requestHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/ttsUIHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_TTS_UI_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	ui.get('/about', function(req, res) {
		res.end(fs.readFileSync(_PATH + 'README.md', 'utf8').toString());
	});

	/** ==> POST SECTION */

	var audioRecordStorage = multer.diskStorage({
		destination: function(req, file, callback) {
			if (!fs.existsSync(Core._UPLOAD)) {
				fs.mkdirSync(Core._UPLOAD);
			}
			callback(null, Core._UPLOAD);
		},
		filename: function(req, file, callback) {
			callback(null, file.fieldname + '_' + new Date().toISOString() + '.wav');
		}
	});
	var audioRecordUpload = multer({ storage: audioRecordStorage }).single('audioRecord');

	ui.post('/audio', audioRecordUpload, function(req, res) {
		log.info('Audio received!');
		log.debug(req.file);
		Core.do('service|audioRecord|new', req.file.path, { delay: 1 });
		res.end();
	});

	ui.post('/toggleDebug', function(req, res) {
		log.info('UI > Toggle debug');
		let newLogLevel = log.level() == 'debug' ? 'info' : 'debug';
		log.level(newLogLevel);
		res.end();
	});

	ui.post('/toggleTrace', function(req, res) {
		log.info('UI > Toggle trace');
		let newLogLevel = log.level() == 'trace' ? 'info' : 'trace';
		log.level(newLogLevel);
		Core.do('service|context|update', {
			log: newLogLevel
		});
		res.end();
	});

	ui.post('/watcher', function(req, res) {
		if (Core.conf('watcher')) {
			Core.do('controller|watcher|stopWatch');
		} else {
			Core.do('controller|watcher|startWatch');
		}
		res.end();
	});

	ui.post('/volume/:volume', function(req, res) {
		if (Core.isAwake()) {
			Core.do('interface|sound|volume', req.params.volume);
			res.end();
		} else {
			log.error("Can't ajust volume in " + Core.conf('mode') + ' mode');
			res.statusCode = 500;
			res.end();
		}
	});

	ui.post('/alarm', function(req, res) {
		let params = req.body;
		Core.do('service|alarm|setAlarm', params);
		res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res) {
		var pattern = req.headers.pwd;
		if (pattern && admin.checkPassword(pattern)) {
			granted = true;
			log.info('>> Admin granted !');
		} else {
			Core.error('>> User NOT granted /!\\', pattern, false);
			Core.do(
				'interface|tts|speak',
				{
					lg: 'en',
					msg: 'User NOT granted'
				},
				{
					delay: 0.5
				}
			);
		}
		res.send(granted);
		if (granted) granted = false;
	});
	return ui;
}

function attachAwakeRoutes(ui) {
	ui.post('/tts', function(req, res) {
		let params = req.query;
		if (params.voice && params.lg && params.msg) {
			if (params.hasOwnProperty('voicemail')) {
				Core.do('service|voicemail|new', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			} else {
				Core.do('interface|tts|speak', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			}
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
		} else {
			Core.do('interface|tts|random');
		}
		res.end();
	});

	ui.post('/badBoy', function(req, res) {
		let params = req.body;
		log.debug('/badBoy', params);
		Core.do('service|mood|badBoy', params.value);
		res.end();
	});

	ui.post('/java', function(req, res) {
		let params = req.body;
		log.debug('/java', params);
		Core.do('service|mood|java', params.value);
		res.end();
	});

	ui.post('/russia', function(req, res) {
		let params = req.query;
		log.debug('/russia', params);
		if (params.hasOwnProperty('hymn')) {
			Core.do('interface|sound|play', {
				mp3: 'jukebox/HymneSovietique.mp3'
			});
			Core.do(
				'interface|led|altLeds',
				{
					speed: 70,
					loop: 20
				},
				{
					log: 'trace'
				}
			);
		} else {
			Core.do('service|interaction|russia');
		}
		res.end();
	});

	ui.post('/timer', function(req, res) {
		let params = req.query; // affiner pour récupérer les params
		if (params.hasOwnProperty('stop')) {
			Core.do('service|timer|stop');
		} else {
			var min = parseInt(params.min, 10) || 1;
			Core.do('service|timer|increase', min);
		}
		res.end();
	});

	ui.post('/*', function(req, res) {
		Core.error('Error UI > not mapped: ' + req.url, null, false);
		res.writeHead(401);
		res.end();
	});
	return ui;
}

function attachSleepRoutes(ui) {
	ui.post('/tts', function(req, res) {
		// Add Voice Mail Message
		let params = req.query;
		if (params['voice'] && params['lg'] && params['msg']) {
			Core.do('service|voicemail|new', {
				voice: params.voice,
				lg: params.lg,
				msg: params.msg
			});
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
			res.end();
		} else {
			Core.error('Error while saving voicemail message:', params);
			res.writeHead(500);
			res.end();
		}
	});

	ui.post('/*', function(req, res) {
		Core.error('Sleep mode, not allowed to interact  -.-', null, false);
		res.writeHead(401);
		res.end();
	});
	return ui;
}

function prepareLogs(lines, callback) {
	var content = fs
		.readFileSync(Core._LOG + Core.name + '.log', 'UTF-8')
		.toString()
		.split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
}
