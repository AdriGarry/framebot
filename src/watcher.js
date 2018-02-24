#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;

const watcherTitle = '\n┌────────────────┐\n│  > Watcher...  │\n└────────────────┘';
console.log(watcherTitle);

// fs.watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
fs.watch('./src', { encoding: 'buffer' }, (eventType, filename) => {
	if (eventType) {
		console.log('eventType');
		console.log(eventType);
		relaunch();
	}
});

function relaunch() {
	console.log(watcherTitle);
	spawn('sudo killall node');
	spawn('sh', ['./src/shell/mute.sh']); // Mute
	console.log('relaunching...');
	spawn('sh', ['../odi.sh']); // Mute
}
