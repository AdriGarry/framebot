#!/usr/bin/env node

'use strict';

const { exec, spawn } = require('child_process');
const fs = require('fs'),
  os = require('os');

const { Core, Files, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const PATHS = [Core._SRC, Core._DATA],
  BYTE_TO_MO = 1048576,
  DELAY_BEFORE_HALT = 3000;

module.exports = {
  cron: {
    base: [
      { cron: '*/30 * * * * *', flux: { id: 'interface|hardware|runtime', conf: { log: 'trace' } } },
      { cron: '0 2 0 * * 1', flux: { id: 'interface|hardware|archiveLogs' } }
    ]
  }
};

const FLUX_PARSE_OPTIONS = [
  { id: 'reboot', fn: reboot },
  { id: 'shutdown', fn: shutdown },
  { id: 'runtime', fn: runtime },
  { id: 'cpuTTS', fn: cpuStatsTTS },
  { id: 'soulTTS', fn: soulTTS },
  { id: 'diskSpaceTTS', fn: diskSpaceTTS },
  { id: 'totalLinesTTS', fn: totalLinesTTS },
  { id: 'archiveLogs', fn: archiveLogs }
];

Observers.attachFluxParseOptions('interface', 'hardware', FLUX_PARSE_OPTIONS);

setImmediate(() => {
  Promise.all([retreiveLastModifiedDate(PATHS), countSoftwareLines(), getDiskSpace()])
    .then(() => {
      runtime(true);
    })
    .catch(err => {
      Core.error('runtime immediate error', err);
    });
});

function runtime(shouldLogRuntime) {
  let execTime = new Date();
  Promise.all([retreiveCpuTemperature(), retreiveCpuUsage(), retreiveMemoryUsage(), loadAverage()])
    .then(() => {
      if (shouldLogRuntime) {
        log.table(Core.run(), 'RUNTIME' + ' '.repeat(5) + Utils.executionTime(execTime) + 'ms');
      }
    })
    .catch(err => {
      Core.error('runtime refresh error', err);
    });
}

/** Function to reboot RPI */
function reboot() {
  if (Core.isAwake()) {
    new Flux('interface|sound|mute');
    new Flux('interface|tts|speak', { msg: 'Je redaimarre' });
    new Flux('interface|arduino|write', 'playHornOff', { delay: 2 });
  }
  console.log('\n\n_/!\\__REBOOTING RASPBERRY PI !!\n');
  setTimeout(function () {
    spawn('reboot');
  }, DELAY_BEFORE_HALT);
}

/** Function to shutdown RPI */
function shutdown() {
  if (Core.isAwake()) {
    new Flux('interface|sound|mute');
    new Flux('interface|tts|speak', { msg: 'Arret system' });
    new Flux('interface|arduino|write', 'playHornOff', { delay: 2 });
  }
  setTimeout(function () {
    console.log("\n\n /!\\  SHUTING DOWN RASPBERRY PI - DON'T FORGET TO SWITCH OFF POWER SUPPLY !!\n");
    spawn('halt');
  }, DELAY_BEFORE_HALT);
}

/** Function to tts cpu stats */
function cpuStatsTTS() {
  retreiveCpuTemperature()
    .then(retreiveCpuUsage)
    .then(() => {
      new Flux('interface|tts|speak', {
        lg: 'fr',
        msg: 'Mon ' + Utils.randomItem(['processeur', 'CPU']) + ' est a ' + Core.run('cpu.temperature')
      });
      new Flux('interface|tts|speak', { lg: 'fr', msg: 'Et il tourne a ' + Core.run('cpu.usage') });
    });
}

function retreiveCpuTemperature() {
  return new Promise((resolve, reject) => {
    let temperature = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
    temperature = (temperature / 1000).toPrecision(2);
    Core.run('cpu.temperature', temperature + '°');
    resolve(temperature);
  });
}

/** Function to get CPU usage */
function retreiveCpuUsage() {
  return new Promise((resolve, reject) => {
    let endMeasure = cpuAverage(); //Grab second Measure
    //Calculate the difference in idle and total time between the measures
    let idleDifference = endMeasure.idle - startMeasure.idle;
    let totalDifference = endMeasure.total - startMeasure.total;
    let percentageCPU = 100 - ~~((100 * idleDifference) / totalDifference); //Calculate the average percentage CPU usage
    Core.run('cpu.usage', percentageCPU + '%');
    resolve(percentageCPU);
  });
}

//Create function to get CPU information
function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  let totalIdle = 0,
    totalTick = 0,
    cpus = os.cpus();
  //Loop through CPU cores
  for (let i = 0, len = cpus.length; i < len; i++) {
    let cpu = cpus[i]; // Select CPU core
    //Total up the time in the cores tick
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
  //Return the average Idle and Tick times
  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  };
}
//Grab first CPU Measure
let startMeasure = cpuAverage();

/** Function to get memory usage stats (Core + system) */
function soulTTS() {
  let size = Math.round(Core.run('memory.framebot'));
  let ttsMsg = size + ' maiga octet, sait le poids de mon ame ' + (Utils.rdm() ? '' : 'en ce moment');
  new Flux('interface|tts|speak', ttsMsg);
}

/** Function to get memory usage stats (Core + system) */
function retreiveMemoryUsage() {
  return new Promise((resolve, reject) => {
    let usedByCore = process.memoryUsage();
    usedByCore = (usedByCore.rss / BYTE_TO_MO).toFixed(1);
    Core.run('memory.framebot', usedByCore);
    let totalMem = (os.totalmem() / BYTE_TO_MO).toFixed(0);
    let freeMem = (os.freemem() / BYTE_TO_MO).toFixed(0);
    let usedMem = (totalMem - freeMem).toFixed(0);
    Core.run('memory.system', usedMem + '/' + totalMem);
    resolve(usedMem + '/' + totalMem);
  });
}

let LOAD_AVERAGE_REGEX = new RegExp(/load average: (?<loadAverage>.+)/);
/** Function to get load average (uptime) */
function loadAverage() {
  return new Promise((resolve, reject) => {
    Utils.execCmd('/usr/bin/uptime')
      .then(data => {
        let matchObj = LOAD_AVERAGE_REGEX.exec(data);
        let loadAverageValue = matchObj && matchObj.groups.loadAverage ? matchObj.groups.loadAverage : -1;
        log.trace('uptime:', loadAverageValue);
        Core.run('cpu.loadAverage', loadAverageValue);
        resolve(loadAverageValue);
      })
      .catch(err => {
        Core.error('loadAverage error', err);
        reject(err);
      });
  });
}

/** Function to update last modified date & time of Program's files */
function retreiveLastModifiedDate(paths) {
  return new Promise((resolve, reject) => {
    Files.getLastModifiedDate(paths)
      .then(lastModifiedDate => {
        Core.const('updateDateTime', lastModifiedDate);
        resolve();
      })
      .catch(err => {
        Core.error('retreiveLastModifiedDate error', err);
        reject(err);
      });
  });
}

/** Function to tts disk space */
function diskSpaceTTS() {
  getDiskSpace().then(() => {
    let diskSpace = parseInt(Core.run('stats.diskSpace'));
    let ttsMsg = Utils.rdm() ? "J'utilise " + diskSpace + '% de mon espace de stockage' : 'Mon disque est utiliser a ' + diskSpace + '%';
    new Flux('interface|tts|speak', ttsMsg);
  });
}

/** Function to retreive disk space on /dev/root */
function getDiskSpace() {
  return new Promise((resolve, reject) => {
    Utils.execCmd('/usr/bin/df -h')
      .then(data => {
        let diskSpace = data.match(/\/dev\/root.*%/gm);
        diskSpace = diskSpace[0].match(/\d*%/g);
        log.debug('Disk space:', diskSpace[0]);
        Core.run('stats.diskSpace', diskSpace[0]);

        if (parseInt(diskSpace) >= 80) {
          let logMessage = 'Warning: disk space almost full: ' + Core.run('stats.diskSpace') + '%';
          log.warn(logMessage);
          new Flux('service|sms|send', logMessage);
        }
        resolve(diskSpace[0]);
      })
      .catch(err => {
        Core.error('getDiskSpace error', err);
        reject(err);
      });
  });
}

/** Function to TTS program's program total lines */
function totalLinesTTS() {
  let ttsMsg = 'Mon programme est composer de ' + Core.const('totalLines') + ' lignes de code';
  new Flux('interface|tts|speak', ttsMsg);
}

const TOTAL_LINES_REGEX = new RegExp(/(?<totalLines>\d*) total/);
/** Function to count lines of program's software */
function countSoftwareLines() {
  return new Promise((resolve, reject) => {
    const EXTENSIONS = ['js', 'json', 'properties', 'sh', 'py', 'html', 'css'];
    let typesNb = EXTENSIONS.length;
    let lines = {},
      totalLines = 0;
    EXTENSIONS.forEach(function (extension) {
      let command = 'find ' + PATHS.join(' ') + ' -regex ".+.' + extension + '" -print | grep -v lib | xargs wc -l';
      //find /home/odi/framebot/src/ /home/odi/framebot/data/ /home/odi/framebot/conf/ -regex ".+.css" -print | grep -v lib | xargs wc -l
      Utils.execCmd(command, 'noLog')
        .then(data => {
          let matchObj = TOTAL_LINES_REGEX.exec(data);
          let t = matchObj && matchObj.groups.totalLines ? matchObj.groups.totalLines : 0;
          totalLines = parseInt(totalLines) + parseInt(t);
          lines[extension] = parseInt(t);
          typesNb--;
          if (!typesNb) {
            log.debug('countSoftwareLines:', totalLines);
            Core.const('totalLines', totalLines);
            resolve(totalLines);
          }
        })
        .catch(err => {
          Core.error('countSoftwareLines error', err);
          reject(err);
        });
    });
  });
}

/** Function to clean and archive logs each week */
function archiveLogs() {
  log.info('Cleaning log files');
  let today = new Date();
  let weekNb = Utils.getWeek(today);
  if (!fs.existsSync(Core._LOG + 'old')) {
    fs.mkdirSync(Core._LOG + 'old');
  }

  fs.readdir(Core._LOG, { withFileTypes: true }, (err, logFiles) => {
    logFiles.forEach(logFile => {
      if (logFile.isFile()) {
        archiveLogFile(logFile.name, weekNb);
      }
    });
  });
}

function archiveLogFile(logFile, weekNb) {
  let stream = fs.createReadStream(Core._LOG + logFile); /*, {bufferSize: 64 * 1024}*/
  stream.pipe(fs.createWriteStream(Core._LOG + 'old/' + logFile + weekNb));
  stream.on('error', function (err) {
    Core.error('stream error while archiving log file ' + logFile, err);
  });
  stream.on('close', function () {
    fs.truncate(Core._LOG + logFile, 0, function () {
      log.info(logFile + ' successfully archived');
    });
  });
}
