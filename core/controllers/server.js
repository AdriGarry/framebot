#!/usr/bin/env node

// Module server
/** Liste codes http
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (autres requetes POST)
 *		424 : Method failure (erreur)
  */

var express = require('express');
var compression = require('compression');
var path = require("path");
var spawn = require('child_process').spawn;
var fs = require('fs');
/*var utils = require(CORE_PATH + 'modules/utils.js');
var leds = require(CORE_PATH + 'modules/leds.js');
var buttons = require(CORE_PATH + 'controllers/buttons.js');
var hardware = require(CORE_PATH + 'modules/hardware.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var service = require(CORE_PATH + 'modules/service.js');
var time = require(CORE_PATH + 'modules/time.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
var fip = require(CORE_PATH + 'modules/fip.js');
var jukebox = require(CORE_PATH + 'modules/jukebox.js');
var exclamation = require(CORE_PATH + 'modules/exclamation.js');
var video = require(CORE_PATH + 'modules/video.js');
var party = require(CORE_PATH + 'modules/party.js');
var admin = require(CORE_PATH + 'modules/admin.js');*/

const FILE_REQUEST_HISTORY = LOG_PATH + 'requestHistory.log';
const FILE_GRANT = DATA_PATH + 'pwd.properties';
const FILE_VOICEMAIL_HISTORY = LOG_PATH + 'voicemailHistory.json';

var deploy;

module.exports = {
	startUI: startUI
};

function startUI(mode){
	var ui = express();
	var request, ip, params, ipClient;

	ui.use(compression()); // Compression web
	ui.use(express.static(WEB_PATH)); // Pour fichiers statiques

	ui.get('/', function(req, res){ // Init UI
		res.sendFile(path.join(WEB_PATH + 'index.html'));
		ipClient = req.connection.remoteAddress;
		console.log('UI initialized [' + ipClient + ']');
		ODI.leds.blink({leds: ['satellite'], speed: 100, loop: 3});
		console.log('MODE');
		console.log(mode);
		if(mode < 1){
			deploy = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'UI']);
		}
		//res.set('Content-Type', 'text/javascript');
	});

	// Middleware LOGGER
	var logger = function(req, res, next){
		//ODI.leds.toggle({led:'eye', mode: 1});
		res.header("Access-Control-Allow-Origin", "http://adrigarry.com");
		ODI.leds.blink({leds: ['satellite'], speed: 100, loop: 2});
		//method = req.method;

		if(req.connection.remoteAddress.indexOf('192.168') == -1){ // Logging not local requests
			var newRequest = utils.logTime('D/M h:m:s ') + request + ' [' + req.connection.remoteAddress + ']\r\n';
			fs.appendFile(FILE_REQUEST_HISTORY, newRequest, function(err){
				if(err) return console.error(err);
			});
		}

		ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : '[' + req.connection.remoteAddress + ']';

		if(req.headers.ui === 'v4'){ // Allowed requests
			request = req.headers.ui + ' ' + req.url.replace('%20',' ');
			console.log(request, ip);
			next();
		}else{ // Not allowed requests
			request = '401 ' + req.url.replace('%20',' ');
			console.error(request, ip);
			res.status(401); // Unauthorized
			res.end();
		}
	};
	ui.use(logger);

	/** MONITORING ACTIVITY */
	ui.get('/monitoring', function(req, res){
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

	/** TOGGLE DEBUG MODE */
	ui.post('/alarm', function(req, res){ // TODO re-passer en ui.post !!!
		console.debug('UI > Alarm');
		// console.log('req', req);
		params = req.query;
		console.log('/alarm     > params', params);
		//utils.setConfig('alarm', null, true); // NOUVEAU FORMAT OBJET ... /!\
		res.writeHead(200);res.end();
	});

	/** TOGGLE DEBUG MODE */
	ui.post('/toggleDebug', function(req, res){
		console.debug('UI > Toggle debug');
		//utils.setConfig('debug', null, true); // NOUVEAU FORMAT OBJET ... /!\
		ODI.utils.setConfig({debug: !CONFIG.debug}, true);
		res.writeHead(200);res.end();
	});

	/** RESET CONFIG */
	ui.post('/resetConfig', function(req, res){
		console.debug('UI > Reset config');
		ODI.utils.resetConfig(true);
		res.writeHead(200);res.end();
	});

	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res){
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if(temp > h){
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + ODI.now.getMinutes();
		}
		var etatBtn = ODI.buttons.getEtat();
		var cpuTemp = ODI.hardware.getCPUTemp();
		var cpuUsage = ODI.hardware.getCPUUsage();
		var dashboard = {
			mode: {value: {
				mode: isNaN(parseFloat(mode)) ? (CONFIG.debug ? 'Debug' : 'Ready') : 'Sleep',
				param: isNaN(parseFloat(mode)) ? CONFIG.startTime : parseInt(mode),
				switch: etatBtn ? true : false},
				active: CONFIG.debug},
			switch: {value: etatBtn, active: etatBtn ? true : false}, 
			volume: {value: isNaN(temp) ? (etatBtn == 1 ? 'high' : 'normal') : 'mute', active: (isNaN(temp) && etatBtn == 1) ? true : false},
			voicemail: {value: ODI.voiceMail.areThereAnyMessages(), active: ODI.voiceMail.areThereAnyMessages()>0 ? true : false},
			jukebox: {value: '<i>Soon available</i>', active: false},
			timer: {value: ODI.time.timeLeftTimer(), active: ODI.time.timeLeftTimer()>0 ? true : false},
			cpu: {value: {usage: cpuUsage, temp: cpuTemp}, active: (cpuTemp > 55 || cpuUsage >= 20) ? true : false},
			alarms: {value: CONFIG.alarms, active: true},
			//config: {value: CONFIG},
			version: {value: CONFIG.version},
			debug: {value: CONFIG.debug}
		};
		res.writeHead(200);
		res.end(JSON.stringify(dashboard));
	});

	/** GET SECTION */
	ui.get('/log', function(req, res){ // Send Logs to UI
		var logSize = 100;
		params = req.query;
		if(params.hasOwnProperty('logSize') && !isNaN(params.logSize)){
			logSize = parseInt(params.logSize);
		}
		ODI.utils.prepareLogs(logSize, function(log){
			res.end(log);
		});
	});

	ui.get('/config.json', function(req, res) { // Send Config file
		res.writeHead(200);
		//res.end(fs.readFileSync(CONFIG_FILE, 'utf8').toString());
		//console.debug(CONFIG.toString);
		utils.logConfigArray();
		res.end(JSON.stringify(CONFIG));
	});

	ui.get('/requestHistory', function(req, res) { // Send Request History
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) { // Send Voicemail History
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	/** POST SECTION */
	ui.post('/odi', function(req, res){ // Restart Odi
		ODI.hardware.restartOdi();
		res.writeHead(200);res.end();
	});

	ui.post('/sleep', function(req, res){ // Restart Odi
		params = req.query;
		var sleepTime;
		if(params.hasOwnProperty('h')){
			sleepTime = params.h;
		}else{
			sleepTime = 255;
		}
		ODI.hardware.restartOdi(sleepTime);//255
		res.writeHead(200);res.end();
	});

	ui.post('/reboot', function(req, res){ // Reboot Odi
		ODI.hardware.reboot();
		res.writeHead(200);res.end();
	});

	ui.post('/shutdown', function(req, res){ // Shutdown Odi
		ODI.hardware.shutdown();
		res.writeHead(200);res.end();
	});

	ui.post('/mute', function(req, res){ // Mute Odi
		ODI.tts.clearTTSQueue();
		ODI.hardware.mute();
		res.writeHead(200);res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res){ // Get grant status
		var pattern = req.headers.pwd;
		if(pattern && ODI.admin.checkPassword(pattern)){
			granted = true;
			console.log('>> Admin granted !');
		}else{
			console.log('>> User NOT granted /!\\');
		}
		res.send(granted);
		if(granted) granted = false;
	});


	if(mode < 1){ /////// WHEN ALIVE

		ui.post('/tts', function(req, res){ // TTS ou Add Voice Mail Message
			var ttsMsg = req.query;
			// console.log(params);
			if(ttsMsg.voice && ttsMsg.lg && ttsMsg.msg){
				if(ODI.ttsMsg.hasOwnProperty('voicemail')){
					ODI.voiceMail.addVoiceMailMessage({voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg});
				}else{
					// console.log(tts, tts.speak);
					ODI.tts.speak({voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg});
				}
			}else{
				// ODI.tts.speak('','RANDOM'); // Random TTS
				// ODI.tts.speak({msg:'RANDOM'}); // Random TTS
				ODI.tts.speak(); // Random TTS
			}
			res.writeHead(200);res.end();
		});

		ui.post('/lastTTS', function(req, res){ // Restart Odi
			ODI.tts.lastTTS();
			res.writeHead(200);res.end();
		});

		ui.post('/checkVoiceMail', function(req, res){ // Check Voice Mail
			// if(!voiceMail.checkVoiceMail()){
			// 	ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
			// }
			ODI.voiceMail.checkVoiceMail(function(anyMessage){
				console.log(anyMessage);
				if(!anyMessage){
					//ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
					ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
				}
			});
			res.writeHead(200);res.end();
		});

		ui.post('/clearVoiceMail', function(req, res){ // Clear Voice Mail
			ODI.voiceMail.clearVoiceMail();
			res.writeHead(200);res.end();
		});

		ui.post('/conversation', function(req, res){ // Conversation
			ODI.tts.randomConversation();
			res.writeHead(200);res.end();
		});

		ui.post('/idea', function(req, res){ // Idea...
			// params = req.query;
			// ODI.tts.speak('en', 'I\'ve got an idea !');
			ODI.tts.speak({lg: 'en', msg: 'I\'ve got an idea !'});
			res.writeHead(200);res.end();
		});

		ui.post('/adriExclamation', function(req, res){ // Idea...
			ODI.service.adriExclamation();
			res.writeHead(200);res.end();
		});

		/*ui.post('/russia', function(req, res){ // Russia
			// console.log('UI > Russia');
			exclamation.russia();
			// exclamation.russiaLoop();
			res.writeHead(200);res.end();
		});*/

		ui.post('/russia', function(req, res){ // Russia
			params = req.query;
			console.log(params);
			if(params.hasOwnProperty('hymn')){
				//exclamation.russiaLoop();
				deploy = spawn('sh', [CORE_PATH + 'sh/music.sh', 'urss']);
			}else{
				ODI.exclamation.russia();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/exclamation', function(req, res){ // Exclamation
			ODI.exclamation.exclamation();
			res.writeHead(200);res.end();
		});

		ui.post('/exclamationLoop', function(req, res){ // Exclamation Loop
			ODI.exclamation.exclamationLoop();
			res.writeHead(200);res.end();
		});

		ui.post('/fip', function(req, res){ // FIP Radio
			ODI.fip.playFip();
			res.writeHead(200);res.end();
		});

		ui.post('/music/*', function(req, res){ // 
			var song; // RECUPERER LE NOM DE LA CHANSON
			if(!song) song = 'mouthTrick';
			deploy = spawn('sh', [CORE_PATH + 'sh/music.sh', song]);
			res.writeHead(200);res.end();
		});

		ui.post('/jukebox', function(req, res){ // Jukebox
			ODI.jukebox.loop();
			res.writeHead(200);res.end();
		});

		ui.post('/medley', function(req, res){ // Medley
			ODI.jukebox.medley();
			res.writeHead(200);res.end();
		});

		ui.post('/naheulbeuk', function(req, res){ // Nahleubeuk
			deploy = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'Naheulbeuk']);
			res.writeHead(200);res.end();
		});

		ui.post('/survivaure', function(req, res){ // Survivaure
			deploy = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'Survivaure']);
			res.writeHead(200);res.end();
		});

		ui.post('/playVideo', function(req, res){ // Play Video
			ODI.video.startCycle();
			res.writeHead(200);res.end();
		});

		ui.post('/videoOff', function(req, res){ // Sleep Screen
			ODI.video.screenOff();
			res.writeHead(200);res.end();
		});

		ui.post('/date', function(req, res){ // Date
			ODI.time.today();
			res.writeHead(200);res.end();
		});

		ui.post('/age', function(req, res){ // Odi's Age
			ODI.time.sayOdiAge();
			res.writeHead(200);res.end();
		});

		ui.post('/time', function(req, res){ // Time
			// console.log('UI > Time');
			ODI.time.now();
			res.writeHead(200);res.end();
		});

		ui.post('/timer', function(req, res){ // Timer
			params = req.query;
			if(!isNaN(params.m)){
				console.log('!isNaN(params.m)');
				var min = parseInt(params.m, 10);
				console.log(min);
				ODI.time.setTimer(min);
			}else if(params.hasOwnProperty('stop')){
				ODI.time.stopTimer();
			}else{
				ODI.time.setTimer();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/meteo', function(req, res){ // Weather
			ODI.service.weather();
			res.writeHead(200);res.end();
		});

		ui.post('/info', function(req, res){ // Info
			ODI.service.info();
			res.writeHead(200);res.end();
		});

		ui.post('/cpuTemp', function(req, res){ // TTS CPU Temp
			ODI.service.cpuTemp();
			res.writeHead(200);res.end();
		});

		ui.post('/cigales', function(req, res){ // Cigales
			ODI.deploy = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'cigales']);
			res.writeHead(200);res.end();
		});

		ui.post('/setParty', function(req, res){ // Set Party Mode
			ODI.party.setParty();
			res.writeHead(200);res.end();
		});

		ui.post('/test', function(req, res){ // Set Party Mode
			deploy = spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'test']); //mouthTrick
			res.writeHead(200);res.end();
		});
		ui.post('/*', function(req, res){ // Redirect Error
			console.error('UI > I’m a teapot !');
			res.writeHead(418);res.end();
		});
	}else{
		ui.post('/tts', function(req, res){ // Add Voice Mail Message
			params = req.query;
			// console.log(params);
			if(params['voice'] && params['lg'] && params['msg']){
				ODI.voiceMail.addVoiceMailMessage({lg: params['lg'],voice: params['voice'], msg: params['msg']});
				res.writeHead(200);res.end();
			}else{
				console.error('Error while saving voiceMail message : ');
				console.error(params);
				res.writeHead(424);res.end();
			}
		});

		ui.post('/*', function(req, res){ // Redirect Error
			//console.error('UI > Odi\'s sleeping   -.-');
			console.log('Odi not allowed to interact  -.-');
			res.writeHead(401);res.end();
		});
	}

	ui.listen(8080, function() { // Listen port 8080
		console.log('UI server started [' + mode + ']');
		ODI.leds.blink({leds: ['satellite'], speed : 120, loop : 3})
	});
};