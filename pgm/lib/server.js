#!/usr/bin/env node
// Module server
/** Liste codes http
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (autres requetes POST)
 *		424 : Method failure (erreur)
  */

var _express = require('express');
var _compression = require('compression');
var _path = require("path");
var _spawn = require('child_process').spawn;
var _fs = require('fs');
var _utils = require('./utils.js');
var _leds = require('./leds.js');
var _buttons = require('./buttons.js');
var _tts = require('./tts.js');
var _voiceMail = require('./voiceMail.js');
var _service = require('./service.js');
var _timer = require('./timer.js');
var _fip = require('./fip.js');
var _jukebox = require('./jukebox.js');
var _exclamation = require('./exclamation.js');
var _party = require('./party.js');
var self = this;

var DIR_NAME = '/home/pi/odi/pgm/';
var DIR_NAME_WEB = '/home/pi/odi/pgm/web/';
var FILE_REQUEST_HISTORY = '/home/pi/odi/log/requestHistory.log';

var _deploy;

exports.startUI = function startUI(mode){
	var ui = _express();
	var request, method, params, ipClient;

	ui.use(_compression()); // Compression web
	ui.use(_express.static(DIR_NAME_WEB)); // Pour fichiers statiques

	ui.get('/', function (req, res) { // Init UI
		res.sendFile(_path.join(DIR_NAME_WEB + '/index.html'));
		ipClient = req.connection.remoteAddress;
		console.log('UI initialized [' + ipClient + ']');
		_leds.blink({leds : ['satellite'], speed : 100, loop : 3});
		if(mode < 1){
			deploy = _spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'UI']);
		}
	});

	// Middleware LOGGER
	var logger = function(req, res, next){
		res.header("Access-Control-Allow-Origin", "http://adrigarry.com");
		_leds.blink({leds : ['satellite'], speed : 180, loop : 1});
		method = req.method;
		/*if(method == 'GET') method = '< ';
		else method = '> ';
		request = ' Odi' + (method == 'GET' ? ' > ' : ' < ');*/
		request = 'UI ' + req.url.replace('%20',' ') + ' [' + req.connection.remoteAddress + ']';
		console.log(request);
		_fs.appendFile(FILE_REQUEST_HISTORY, _utils.formatedDate() + request + '\r\n', function(err){
			if(err){
				return console.error(err);
			}
		});
		/*if(mode > 0){
			console.log('Odi not allowed to interact  -.-');
			res.end();
		}*/
		next();
	};

	ui.use(logger);

	/** MONITORING ACTIVITY */
	ui.get('/monitoring', function (req, res){
		//console.log(/\d/.test(mode));
		var activity = {
			mode: /\d/.test(mode) ? 'sleep' : 'awake',
			pauseUI: false,
			info: 'Refresh status'
		};
		//console.log(activity);
		res.writeHead(200);
		res.end(JSON.stringify(activity));
	});

	/** SETTINGS SECTION */
	ui.get('/settings', function (req, res){
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if(temp > h){
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var settings = {
			mode: {
				lib: 'Mode',
				value: isNaN(parseFloat(mode)) ? 'Normal' : 'Sleeping for ' + parseInt(mode) + 'h'
			}, cpuUsage: {
				lib: 'Utilisation processeur',
				value: _utils.getCPUUsage() + ' %'
			}, cpuTemp: {
				lib: 'Temperature processeur',
				value: _utils.getCPUTemp() + ' ° C'
			}, voiceMail: {
				lib: 'VoiceMail',
				value: 'Not implemented'
			}, volume: {
				lib: 'Volume',
				value: _buttons.getEtat() == 1 ? 'High' : 'Normal'
			}, switch: {
				lib: 'Etat Switch',
				value: _buttons.getEtat()
			}, alarms: {
				lib: 'Alarmes',
				value: '-'
			}
		};
		// console.log(settings);
		res.writeHead(200);
		res.end(JSON.stringify(settings));
	});

	/** GET SECTION */
	ui.get('/log', function (req, res) { // Send Logs to UI
		// console.log('UI < Logs');
		var logSize = 100;
		params = req.query;
		if(params.hasOwnProperty('logSize') && !isNaN(params.logSize)){
			logSize = parseInt(params.logSize);
		}
		//console.log(params);
		_utils.prepareLogs(logSize, function(log){
			res.end(log);
		});
	});

	ui.get('/requestHistory', function (req, res) { // Send Request History
		var temp = _utils.getCPUTemp();
		// console.log('UI < Request History');
		res.writeHead(200);
		res.end(_fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	/** POST SECTION */
	ui.post('/odi', function (req, res) { // Restart Odi
		// console.log('UI > restart Odi');
		_utils.restartOdi();
		res.writeHead(200);res.end();
	});

	ui.post('/sleep', function (req, res) { // Restart Odi
		params = req.query;
		var sleepTime;
		if(params.hasOwnProperty('h')){
			sleepTime = params.h;
		}else{
			sleepTime = 255;
		}
		// console.log('UI > sleep ...' + sleepTime);
		_utils.restartOdi(sleepTime);//255
		res.writeHead(200);res.end();
	});

	ui.post('/reboot', function (req, res) { // Reboot Odi
		// console.log('UI > reboot Odi');
		_utils.reboot();
		res.writeHead(200);res.end();
	});

	ui.post('/shutdown', function (req, res) { // Shutdown Odi
		// console.log('UI > shutdown Odi');
		_utils.shutdown();
		res.writeHead(200);res.end();
	});

	ui.post('/mute', function (req, res) { // Mute Odi
		// console.log('UI > mute');
		_utils.mute();
		res.writeHead(200);res.end();
	});

	// if(mode.indexOf('sleep') == -1){ /////// WHEN ALIVE
	if(mode < 1){ /////// WHEN ALIVE

		ui.post('/tts', function (req, res) { // TTS ou Add Voice Mail Message
			params = req.query;
			// console.log('UI > tts');
			// console.log(params);
			if(params['voice'] && params['lg'] && params['msg']){
				if('voicemail' in params){
					_voiceMail.addVoiceMailMessage(params['lg'], params['msg'] + params['voice']);
				}else{
					_tts.speak(params['lg'], params['msg'] + params['voice']);
				}
			}else{
				_tts.speak('','RANDOM'); // Random TTS
			}
			res.writeHead(200);res.end();
		});

		ui.post('/lastTTS', function (req, res) { // Restart Odi
			// console.log('UI > restartOdi');
			_tts.lastTTS();
			res.writeHead(200);res.end();
		});

		ui.post('/checkVoiceMail', function (req, res) { // Check Voice Mail
			// console.log('UI > Check Voice Mail');
			if(!_voiceMail.checkVoiceMail()){
				_tts.speak('en', 'No voicemail message:1');			
			}
			res.writeHead(200);res.end();
		});

		ui.post('/clearVoiceMail', function (req, res) { // Clear Voice Mail
			// console.log('UI > Clear Voice Mail');
			_voiceMail.clearVoiceMail();
			res.writeHead(200);res.end();
		});

		ui.post('/conversation', function (req, res) { // Conversation
			params = req.query;
			if(/\d/.test(params.m)){
				var rdmNb = txt.replace(/[^\d.]/g, '');
				var rdmNb = parseInt(rdmNb, 10);
				// console.log('UI >  conversation random param : ' + rdmNb);
				_tts.conversation(rdmNb);
			}else{
				// console.log('UI >  conversation random ');
				_tts.conversation('random');
			}
			res.writeHead(200);res.end();
		});

		ui.post('/idea', function (req, res) { // Idea...
			// params = req.query;
			_tts.speak('en', 'I\'ve got an idea !');
			res.writeHead(200);res.end();
		});

		ui.post('/russia', function (req, res) { // Russia
			// console.log('UI > Russia');
			_exclamation.russia();
			// _exclamation.russiaLoop();
			res.writeHead(200);res.end();
		});

		ui.post('/exclamation', function (req, res) { // Exclamation
			// console.log('UI > Exclamation');
			_exclamation.exclamation();
			res.writeHead(200);res.end();
		});

		ui.post('/exclamationLoop', function (req, res) { // Exclamation Loop
			// console.log('UI > Exclamation Loop');
			_exclamation.exclamationLoop();
			res.writeHead(200);res.end();
		});

		ui.post('/fip', function (req, res) { // FIP Radio
			// console.log('UI > FIP Radio');
			_fip.playFip();
			res.writeHead(200);res.end();
		});

		ui.post('/music/*', function (req, res) { // 
			var song; // RECUPERER LE NOM DE LA CHANSON
			if(!song) song = 'mouthTrick';
			// console.log('UI > Music : ' + song);
			_deploy = _spawn('sh', ['/home/pi/odi/pgm/sh/music.sh', song]);
			res.writeHead(200);res.end();
		});

		ui.post('/jukebox', function (req, res) { // Jukebox
			// console.log('UI > Jukebox');
			_jukebox.loop();
			res.writeHead(200);res.end();
		});

		ui.post('/medley', function (req, res) { // Medley
			// console.log('UI > Medley');
			_jukebox.medley();
			res.writeHead(200);res.end();
		});

		ui.post('/date', function (req, res) { // Date
			// console.log('UI > Date');
			_service.date();
			res.writeHead(200);res.end();
		});

		ui.post('/time', function (req, res) { // Time
			// console.log('UI > Time');
			_service.time();
			res.writeHead(200);res.end();
		});

		ui.post('/timer', function (req, res) { // Timer
			params = req.query;
			if(!isNaN(params.m)){
				console.log('!isNaN(params.m)');
				var min = parseInt(params.m, 10);
				// console.log('UI > Timer for ' + min + ' minutes');
				console.log(min);
				_timer.setTimer(min);
			}else{
				_timer.setTimer();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/meteo', function (req, res) { // Weather
			// console.log('UI > Meteo');
			_service.weather();
			res.writeHead(200);res.end();
		});

		ui.post('/info', function (req, res) { // Info
			// console.log('UI > Info');
			_service.info();
			res.writeHead(200);res.end();
		});

		ui.post('/cpuTemp', function (req, res) { // TTS CPU Temp
			// console.log('UI > FIP');
			_service.cpuTemp();
			res.writeHead(200);res.end();
		});

		ui.post('/cigales', function (req, res) { // Cigales
			// console.log('UI > Cigales');
			_deploy = _spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'cigales']);
			res.writeHead(200);res.end();
		});

		ui.post('/setParty', function (req, res) { // Set Party Mode
			// console.log('UI > Set Party Mode !!');
			_party.setParty();
			res.writeHead(200);res.end();
		});

		ui.post('/test', function (req, res) { // Set Party Mode
			// console.log('UI > TEST !!');
			_deploy = _spawn('sh', ['/home/pi/odi/pgm/sh/music.sh', 'mouthTrick']);
			res.writeHead(200);res.end();
		});
		ui.post('/*', function (req, res) { // Redirect Error
			console.error('UI > I’m a teapot !');
			res.writeHead(418);res.end();
		});
	}else{
		ui.post('/tts', function (req, res) { // Add Voice Mail Message
			params = req.query;
			// console.log('UI > tts');
			// console.log(params);
			if(params['voice'] && params['lg'] && params['msg']){
				_voiceMail.addVoiceMailMessage(params['lg'], params['msg'] + params['voice']);
				res.writeHead(200);res.end();
			}else{
				console.error('Error while saving voiceMail message : ');
				console.error(params);
				res.writeHead(424);res.end();
			}
		});

		ui.post('/*', function (req, res) { // Redirect Error
			//console.error('UI > Odi\'s sleeping   -.-');
			console.log('Odi not allowed to interact  -.-');
			res.writeHead(401);res.end();
		});
	}

	ui.listen(8080, function () { // Listen port 8080
		console.log('Odi\'s UI server started [' + mode + ']');
		_leds.blink({leds: ['satellite'], speed : 120, loop : 3})
	});

}