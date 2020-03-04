#!/usr/bin/env node

// Api sub-module (server)

const fs = require('fs'),
	multer = require('multer');

const Core = require('./../../../core/Core').Core;

const Logger = require('./../../../api/Logger'),
	Flux = require('./../../../api/Flux'),
	Utils = require('./../../../api/Utils');

const log = new Logger(__filename);

const admin = require(Core._SECURITY + 'admin.js').init(Core._SECURITY);

const FILE_REQUEST_HISTORY = Core._LOG + Core.name + '_requestHistory.log';
const FILE_ERROR_HISTORY = Core._LOG + Core.name + '_errorHistory.json';
const FILE_TTS_UI_HISTORY = Core._LOG + Core.name + '_ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = Core._LOG + Core.name + '_voicemailHistory.json';

var uiHttp;
module.exports = {
	attachRoutes: attachRoutes
};

let IP = { local: null, public: null };
setImmediate(() => {
	Utils.testConnection()
		.then(() => {
			IP.local = Utils.getLocalIp();
			Utils.getPublicIp().then(data => (IP.public = data));
		})
		.catch(() => {
			log.warn("No internet connection, can't retreive ip addresses!");
		});
});

function attachRoutes(ui, modulesApi) {
	uiHttp = ui;

	// TODO attachUiRoute(uiHttp);
	attachDefaultRoutes(uiHttp);
	attachFluxRoutes(uiHttp);
	attachUnmappedRouteHandler(uiHttp);
	return uiHttp;
}

function attachFluxRoutes(ui) {
	ui.post('/flux/:type/:subject/:id', function(req, res) {
		let value = req.body;
		if (typeof value === 'object' && value.hasOwnProperty('_wrapper')) value = value._wrapper;
		new Flux(req.params.type + '|' + req.params.subject + '|' + req.params.id, value);
		res.end();
	});
	return ui;
}

function attachUnmappedRouteHandler(ui, mode) {
	let errorMsg = Core.isAwake() ? 'Error UI > not mapped:' : 'Sleep mode, not allowed to interact';
	ui.post('/*', function(req, res) {
		Core.error(errorMsg, req.url, false);
		res.writeHead(401);
		res.end();
	});
	return ui;
}

function attachDefaultRoutes(ui) {
	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		new Flux('interface|hardware|runtime');
		let etatBtn = Core.run('etat');
		let cpuTemp = Core.run('cpu.temp');
		let cpuUsage = Core.run('cpu.usage');
		let dashboard = {
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
				value: Core.run('music')
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
						framebot: Core.run('memory.framebot'),
						system: Core.run('memory.system')
					}
				},
				active: cpuTemp > 55 || cpuUsage >= 20 ? true : false
			},
			alarms: {
				value: Core.conf('alarms'),
				active: true
			},
			network: { value: Core.run('network') },
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
		prepareLogs(logSize)
			.then(logs => res.end(logs))
			.catch(err => Core.error("Can't retrieve logs", err));
	});

	// '/file/:filename'
	ui.get('/config.json', function(req, res) {
		log.table(Core.conf(), 'CONFIG');
		res.end(JSON.stringify(Core.conf()));
	});

	ui.get('/runtime', function(req, res) {
		new Flux('interface|hardware|runtime', true);
		setTimeout(() => {
			res.end(JSON.stringify(Core.run()));
		}, 500);
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

	let audioRecordStorage = multer.diskStorage({
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
	let audioRecordUpload = multer({ storage: audioRecordStorage }).single('audioRecord');

	ui.post('/audio', audioRecordUpload, function(req, res) {
		log.info('Audio received!');
		log.debug(req.file);
		new Flux('service|audioRecord|new', req.file.path, { delay: 1 });
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
		new Flux('service|context|update', {
			log: newLogLevel
		});
		res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res) {
		let pattern = req.headers.pwd;
		if (pattern && admin.checkPassword(pattern)) {
			granted = true;
			log.info('>> Admin granted !');
			log.info('ip:', IP.local, typeof IP.public === 'string' ? '/ ' + IP.public.trim() : '');
		} else {
			Core.error('>> User NOT granted /!\\', pattern, false);
			new Flux('interface|tts|speak', { lg: 'en', msg: 'User NOT granted' }, { delay: 0.5 });
		}
		res.send(granted);
		if (granted) granted = false;
	});

	ui.post('/tts', function(req, res) {
		let params = req.query;
		if (params.voice && params.lg && params.msg) {
			if (!Core.isAwake() || params.hasOwnProperty('voicemail')) {
				new Flux('service|voicemail|new', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			} else {
				new Flux('interface|tts|speak', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			}
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
		} else {
			new Flux('interface|tts|random');
		}
		res.end();
	});

	return ui;
}

function prepareLogs(lines) {
	return new Promise((resolve, reject) => {
		fs.readFile(Core._LOG + Core.name + '.log', 'UTF-8', (err, logs) => {
			if (err) reject(err);
			logs = logs
				.toString()
				.split('\n')
				.slice(-lines)
				.join('\n');
			resolve(logs);
		});
	});
}
