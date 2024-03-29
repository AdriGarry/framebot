#!/usr/bin/env node
'use strict'; //Octal literals are not allowed in strict mode.

/** Params detection */
console.log('argv', process.argv);
let argv = process.argv.splice(2);
const NAME = argv[0];

const { spawn, spawnSync, exec, execSync } = require('child_process');

const fs = require('fs'),
  path = require('path'),
  Gpio = require('onoff').Gpio;

const sep = path.sep;
const SRC_PATH = __dirname + sep;
const _PATH = __dirname.replace('src', '');
const INTERVALS = [10, 10, 30, 60, 90, 180, 300, 600, 900];
const CORE_DEFAULT = require(_PATH + 'data/framebotDefault.json');
const wrapperTitle = '\n┌──────────────┐\n│  > Wrapper   │\n└──────────────┘';

let descriptor;

wrapper();

let i = 0,
  interval,
  timeout,
  okButton;

function wrapper(code) {
  console.log(wrapperTitle);
  if (!code) {
    startCore();
    return;
  }
  let timeoutDelay = INTERVALS[i];
  i++;
  console.log('Error in Core program!');
  process.stdout.write('Push Ok button or wait for ' + timeoutDelay + ' sec');
  if (i == INTERVALS.length) {
    i = 0;
  }
  interval = setInterval(() => {
    process.stdout.write('.');
  }, 1000);
  timeout = setTimeout(() => {
    console.log('\nrestarting Core');
    restartCoreFromWrapper(code);
  }, timeoutDelay * 1000);

  okButton = new Gpio(20, 'in', 'rising', {
    persistentWatch: true,
    debounceTimeout: 500
  });
  okButton.watch(function (err, value) {
    console.log('\n\nOk Button pushed, restarting Core');
    restartCoreFromWrapper(code);
  });
}

function restartCoreFromWrapper(code) {
  clearInterval(interval);
  clearTimeout(timeout);
  okButton.unwatch();
  startCore(code);
}

/** Function to start up Core */
function startCore(exitCode) {
  console.log(Buffer.from(execSync('/usr/bin/cat /sys/firmware/devicetree/base/model;echo')).toString().trim());
  console.log('nodejs version:', process.version);
  mute();

  checkUp();

  new Gpio(14, 'out').writeSync(1); //let eye =

  let coreProgramWithParams = [SRC_PATH + 'index.js', NAME];
  if (exitCode) {
    coreProgramWithParams.push('sleep');
  }
  for (const element of argv) {
    coreProgramWithParams.push(element);
  }
  let Core = spawn('/usr/bin/node', coreProgramWithParams);

  Core.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  Core.stderr.on('data', function (data) {
    process.stdout.write(data);
  });

  Core.on('exit', function (code) {
    mute();
    console.log('\n>> Core restarting... [code:' + code + ']');
    argv.remove('test'); // Removing test param before relaunching
    argv.remove('reset'); // Removing reset param before relaunching
    wrapper(code);
  });
}

function checkUp() {
  console.log('checkUp...');
  descriptor = JSON.parse(fs.readFileSync(_PATH + 'bots/' + NAME + '/descriptor.json'));
  if (!fs.existsSync(_PATH + 'tmp')) {
    fs.mkdirSync(path.join(_PATH, 'tmp')); //, parseInt('0777', 8)
    fs.chmodSync(path.join(_PATH, 'tmp'), parseInt('0777', 8)); //, parseInt('0777', 8)
    console.log('> TEMP directory created');
  } else {
    checkVoicemailValidity();
  }
  if (!fs.existsSync(_PATH + 'log')) {
    fs.mkdirSync(_PATH + 'log');
    console.log('> LOG directory created');
  }

  if (argv.indexOf('reset') > -1) {
    reInitConf();
  } else {
    checkConfValidity();
  }
}

function checkVoicemailValidity() {
  if (fs.existsSync(_PATH + 'tmp/voicemail.json')) {
    try {
      let conf = fs.readFileSync(_PATH + 'tmp/voicemail.json', 'utf-8');
      JSON.parse(conf);
    } catch (err) {
      console.log(err.message);
      fs.unlinkSync(_PATH + 'tmp/voicemail.json');
      console.log('> Invalid voicemail message, deleted!');
    }
  }
}

function checkConfValidity() {
  try {
    let conf = fs.readFileSync(_PATH + 'tmp/conf.json', 'utf-8');
    JSON.parse(conf);
  } catch (err) {
    console.log(err.message);
    reInitConf();
  }
}

function reInitConf() {
  console.log('> CONF reset');
  fs.writeFileSync(_PATH + 'tmp/conf.json', JSON.stringify(CORE_DEFAULT.conf), 'utf-8');
}

function mute() {
  exec('/usr/bin/sudo /usr/bin/killall mpg321');
  exec('/usr/bin/sudo /usr/bin/killall espeak');
}

Array.prototype.remove = function () {
  let what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};
