#!/usr/bin/env node

// Module log tail

var tty = require('tty');
var child_process = require('child_process');
var fs = require('fs');

module.exports = {
};

//var filename = '/tmp/somefile.txt';

function spawnVim(file, cb){
	var vim = child_process.spawn( 'vim', [file])

	function indata(c){
		vim.stdin.write(c);
	}
	function outdata(c){
		process.stdout.write(c);
	}

	process.stdin.resume();
	process.stdin.on('data', indata);
	vim.stdout.on('data', outdata);
	tty.setRawMode(true);

	vim.on('exit', function(code){
		tty.setRawMode(false);
		process.stdin.pause();
		process.stdin.removeListener('data', indata);
		vim.stdout.removeListener('data', outdata);

		cb(code);
	});
}

spawnVim(LOG_PATH + 'odi.log', function(code){
	if(code == 0){
		fs.readFile(LOG_PATH + 'odi.log', function(err, data){
			if(!err){
				console.log(data.toString());
			}
		});
	}
});
