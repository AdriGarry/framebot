#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');

Flux.service.mood.subscribe({
	next: flux => {
		if (flux.id == 'expressive') {
			expressive(flux.value);
		}else if (flux.id == 'badBoy') {
			badBoy(flux.value);
		}else Odi.error('unmapped flux in Mood service', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

function expressive(args){
}	

/** Function to start bad boy mode */
function badBoy(interval){
	if(typeof interval === 'number'){
		log.info('Bad Boy mode !! [' + interval + ']');
		Flux.next('module', 'tts', 'speak', {lg: 'en', msg: 'Baad boy !'});
		var loop = 0;
		setInterval(function(){
			loop++;
			if(loop >= interval){
				badBoyTTS();
				loop = 0;
			}
		}, 1000);
	}else{
		badBoyTTS();
	}
};

function badBoyTTS(){
	Flux.next('module', 'tts', 'speak', getNewRdmBadBoyTTS());
	setTimeout(function(){
		Flux.next('module', 'tts', 'speak', getNewRdmBadBoyTTS());
	}, 1000);
};

/** Function to select a different TTS each time */
const BAD_BOY_TTS_LENGTH = Odi.ttsMessages.badBoy.length;
var rdmNb, lastRdmNb = [], rdmTTS = '';
function getNewRdmBadBoyTTS(){
	do{
		rdmNb = Utils.random(BAD_BOY_TTS_LENGTH);
		rdmTTS = Odi.ttsMessages.badBoy[rdmNb];
		if(lastRdmNb.length >= BAD_BOY_TTS_LENGTH) lastRdmNb.shift();
	}while(lastRdmNb.indexOf(rdmNb) != -1);
	lastRdmNb.push(rdmNb);
	return rdmTTS;
};
