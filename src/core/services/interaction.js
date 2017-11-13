#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Utils = require(Odi._CORE + 'Utils.js');
var Flux = require(Odi._CORE + 'Flux.js');
var fs = require('fs');
var request = require('request');
// var spawn = require('child_process').spawn;

Flux.service.interaction.subscribe({
	next: flux => {
		if (flux.id == 'random') {
			randomAction();
		}else if (flux.id == 'exclamation') {
			exclamation();
		} else if (flux.id == 'adriExclamation') {
			adriExclamation();
		} else if (flux.id == 'weather') {
			weatherService();
		} else if (flux.id == 'weatherInteractive') {
			weatherInteractiveService();
		}else Odi.error('unmapped flux in Exclamation module', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

// Test pour lancer les anniversaires d'ici ? (ou alors dans un calendar.js ?)

function exclamation() {
	log.INFO('exclamation');
}

/*var randomActionBase = [
	{label:'ODI.tts.speak', call: ODI.tts.speak, weighting: 7},
	{label:'ODI.tts.randomConversation', call: ODI.tts.randomConversation, weighting: 7},
	{label:'ODI.exclamation.exclamation', call: ODI.exclamation.exclamation, weighting: 4},
	{label:'ODI.time.now', call: ODI.time.now, weighting: 1},
	{label:'ODI.time.today', call: ODI.time.today, weighting: 1},
	{label:'weatherService', call: weatherService, weighting: 1},
	{label:'weatherInteractiveService', call: weatherService, weighting: 3},
	{label:'cpuTemp', call: cpuTemp, weighting: 1},
	{label:'ODI.time.sayOdiAge', call: ODI.time.sayOdiAge, weighting: 1},
	{label:'adriExclamation', call: adriExclamation, weighting: 1}
];*/
var randomActionBase = [
	{label:'ODI.tts.speak', call: {type: 'module', subject: 'tts', id: 'speak'}, weighting: 7},
	{label:'ODI.tts.randomConversation', call: {type: 'module', subject: 'tts', id: 'randomConversation'}, weighting: 7},
	{label:'ODI.exclamation.exclamation', call: {type: 'service', subject: 'exclamation', id: 'exclamation'}, weighting: 4},
	{label:'ODI.time.now', call: {type: 'service', subject: 'time', id: 'now'}, weighting: 1},
	{label:'ODI.time.today', call: {type: 'service', subject: 'time', id: 'today'}, weighting: 1},
	{label:'weatherService', call: {type: 'service', subject: 'interaction', id: 'weather'}, weighting: 1},
	{label:'weatherInteractiveService', call: {type: 'service', subject: 'interaction', id: 'weatherInteractive'}, weighting: 3},
	{label:'cpuTemp', call: {type: 'module', subject: 'hardware', id: 'cpu'}, weighting: 1},
	{label:'ODI.time.sayOdiAge', call: {type: 'service', subject: 'time', id: 'odiAge'}, weighting: 1},
	{label:'adriExclamation', call: {type:'service', subject:'interaction', id: 'adriExclamation'}, weighting: 1}
];
/** Building randomActionList from randomActionBase */
var randomActionList = [];
for(var i=0;i<randomActionBase.length;i++){
	var loop = randomActionBase[i].weighting;
	while(loop){
		randomActionList.push(randomActionBase[i]);
		loop--;
	}
}

/** Function random action (exclamation, random TTS, time, day, weather...) */
function randomAction(){
	var action = randomActionList[Utils.random(randomActionList.length)];
	log.info('randomAction:', action.label, '[' + action.weighting + ']');
	// Flux.next('module', 'led', 'altLeds', {speed: 90, duration: 0.6}); //{speed: 100, duration: 1.3}
	Flux.next(action.type, action.subject, action.id, action.value);
};

/** Function 'Aaaadri' speech */
function adriExclamation(){
	var aadri = 'aa';
	log.info('adriExclamation()');
	aadri += aadri.repeat(Utils.random(6)) + 'dri';
	Flux.next('module', 'tts', 'speak' , {voice: 'espeak', lg:'fr', msg: 'aadri'});
};

var WEATHER_STATUS_LIST;
fs.readFile(Odi._DATA + 'weatherStatus.json', function(err, data){
	if(err && err.code === 'ENOENT'){
		log.debug(Odi.error('No file : ' + filePath));
		callback(null);
	}
	WEATHER_STATUS_LIST = JSON.parse(data);
});

/** Function to retreive weather info */
var weatherReport = {}; //weatherData, weatherStatus, weatherTemp, wind, weatherSpeech;
function getWeatherData(callback){
	log.debug('getWeatherData()');
	request.get({
		url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20%28select%20woeid%20from%20geo.places%281%29%20where%20text%3D%22Marseille%2C%20france%22%29and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
		headers: {'Content-Type': 'json'}
	}, function (error, response, body){
		try{
			if(!error && response.statusCode == 200){
				weatherReport.data = JSON.parse(body);
				weatherReport.status = weatherReport.data.query.results.channel.item.condition.code;
				weatherReport.status = WEATHER_STATUS_LIST[weatherReport.status];
				weatherReport.temperature = weatherReport.data.query.results.channel.item.condition.temp;
				weatherReport.wind = weatherReport.data.query.results.channel.wind.speed;
				callback(weatherReport);
			}else{
				Flux.next('module', 'tts', 'speak', {voice: 'espeak', lg: 'fr', msg: 'Erreur service meteo'});
				Odi.error('Weather request > Can\'t retreive weather informations. response.statusCode', response.statusCode);
				if(error){Odi.error('Error getting weather info  /!\\ \n' + error);}
			}
		}catch(e){
			if(Odi.conf.mode != 'sleep') Flux.next('module', 'tts', 'speak', {lg:'en', msg:'Weather error'});
			Odi.error(e);
		}
	});
};

/** Official weather function */
function weatherService(){
	log.info('Official weather service...');
	getWeatherData(function(weatherReport){
		var weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Meteo Marseille : le temps est ' + weatherReport.status + ', il fait '
			+ weatherReport.temperature + ' degres avec ' + (isNaN(weatherReport.wind)?'0':Math.round(weatherReport.wind))
			+ ' kilometre heure de vent'};
			log.debug('weatherSpeech', weatherSpeech);
		Flux.next('module', 'tts', 'speak', weatherSpeech);
	});
};

/** Official weather function */
function weatherInteractiveService(){
	log.info('Interactive weather service...');
	var weatherSpeech;
	getWeatherData(function(weatherReport){
		log.debug('weatherReport', weatherReport);
		switch(Utils.random(3)){
			case 0:
				weatherSpeech = {voice: 'google', lg: 'fr', msg: 'Aujourd\'hui a Marseille, il fait ' + weatherReport.temperature
					+ ' degrer avec ' + (isNaN(weatherReport.wind)?'0':Math.round(weatherReport.wind)) + ' kilometre heure de vent'};
				break;
			case 1:
				weatherSpeech = [{voice: 'google', lg: 'fr', msg: 'Aujourd\'hui a Marseille, il fait ' + weatherReport.temperature
					+ ' degrer'},
					{voice: 'espeak', lg: 'fr', msg: 'Oui, et ' + (isNaN(weatherReport.wind)?'0':Math.round(weatherReport.wind)) + ' kilometre heure de vent'},
					{voice: 'espeak', lg: 'fr', msg: 'Un temps plutot ' + weatherReport.status}];
				break;
			case 2:
				weatherSpeech = [{voice: 'espeak', lg: 'fr', msg: 'Hey, il fait un temp ' + weatherReport.status},
					{voice: 'google', lg: 'fr', msg: 'Tu parles, il fais ' + weatherReport.temperature + ' degrer'},
					{voice: 'espeak', lg: 'fr', msg: 'Oui, et '+ (isNaN(weatherReport.wind)?'0':Math.round(weatherReport.wind))
						+ ' kilometre heure de vent'}];
				break;
		}
		log.debug('weatherSpeech', weatherSpeech);
		Flux.next('module', 'tts', 'speak', weatherSpeech);
	});
};

/** Function to select a different TTS each time */
const BAD_BOY_TTS_LENGTH = Odi.ttsMessages.badBoy.length;
var rdmNb, lastRdmNb = [], rdmTTS = '';
function getNewRdmBadBoyTTS(){
	do{
		rdmNb = ((Utils.random()* BAD_BOY_TTS_LENGTH));
		rdmTTS = Odi.ttsMessages.badBoy[rdmNb];
		if(lastRdmNb.length >= BAD_BOY_TTS_LENGTH) lastRdmNb.shift();
	}while(lastRdmNb.indexOf(rdmNb) != -1);
	lastRdmNb.push(rdmNb);
	return rdmTTS;
};

