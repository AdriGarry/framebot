#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

Flux.service.mood.subscribe({
	next: flux => {
		if (flux.id == '') {
			//
		}else Odi.error('unmapped flux in Mood service', flux, false);
		
	},
	error: err => {
		Odi.error(flux);
	}
});

// Test pour lancer les anniversaires d'ici ? (ou alors dans un calendar.js ?)

/** Function to start bad boy mode */
function badBoy(interval){
	if(typeof interval === 'number'){
		log.info('Bad Boy mode !! [' + interval + ']');
		// ODI.tts.speak({lg: 'fr', msg: 'A partir de maintenant, je suis un enfoirer !'});
		Flux.next('module', 'tts', 'speak', {lg: 'en', msg: 'Baad boy !'});

		var loop = 0;
		setInterval(function(){
			loop++;
			// console.log('loop:', loop);
			if(loop >= interval){
				badBoyTTS();
				loop = 0;
			}
			// if(loop>30) loop = 0; // 1000
		}, 1000);
	}else{
		badBoyTTS();
	}
};

function badBoyTTS(){
	// console.log('badBoyTTS()');
	Flux.next('module', 'tts', 'speak', getNewRdmBadBoyTTS());
	setTimeout(function(){
		Flux.next('module', 'tts', 'speak', getNewRdmBadBoyTTS());
	}, 1000);
};