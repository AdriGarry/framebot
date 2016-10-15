#!/usr/bin/env node

// Module de gestion des boutons

var fs = require('fs');
var Player = require('player');

var jukeboxPath = MEDIA_PATH + 'mp3/jukebox/';
var exclamationPath = MEDIA_PATH + 'mp3/exclamation';

var jukeboxList = [];
fs.readdir(MEDIA_PATH + 'mp3/exclamation', function(err, files){
	if(err) return;
	files.forEach(function(songName) {
		jukeboxList.push(songName);
	});
});

// create player instance 
//var player = new Player('./xxx.mp3');

// create a player instance from playlist 
var player = Player([songName]);
	

// play now and callback when playend 
player.play(function(err, player){
	console.log('playend!');
});
// play again 
//player.play();

// play the next song, if any 
//player.next();

// add another song to playlist 
//player.add('http://someurl.com/anothersong.mp3');

// list songs in playlist 
console.log(player.list)

// event: on playing 
// player.on('playing',function(item){ console.log('im playing... src:' + item);
// });

// event: on playend 
// player.on('playend',function(item){
// 	// return a playend item
// 	console.log('src:' + item + ' play done, switching to next one ...');
// });

// event: on error 
player.on('error', function(err){
	// when error occurs 
	console.log(err);
});
 
// stop playing 
// player.stop();