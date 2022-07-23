#!/usr/bin/env node

// Module log tail

const { spawn } = require('child_process');
const fs = require('fs'),
  tty = require('tty');

module.exports = {};

setImmediate(() => {
  spawnVim(LOG_PATH + 'odi.log', function (code) {
    if (code == 0) {
      fs.readFile(LOG_PATH + 'odi.log', function (err, data) {
        if (!err) {
          console.log(data.toString());
        }
      });
    }
  });
});

function spawnVim(file, cb) {
  let vim = spawn('vim', [file]);

  function indata(c) {
    vim.stdin.write(c);
  }
  function outdata(c) {
    process.stdout.write(c);
  }

  process.stdin.resume();
  process.stdin.on('data', indata);
  vim.stdout.on('data', outdata);
  tty.setRawMode(true);

  vim.on('exit', function (code) {
    tty.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener('data', indata);
    vim.stdout.removeListener('data', outdata);

    cb(code);
  });
}
