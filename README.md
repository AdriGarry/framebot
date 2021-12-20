# Framebot

[![Version](https://img.shields.io/github/package-json/v/adrigarry/framebot)](https://github.com/AdriGarry/framebot/tags)
![Languages](https://img.shields.io/github/languages/count/adrigarry/framebot)
![Total lines](https://img.shields.io/tokei/lines/github/adrigarry/framebot)
![Code size](https://img.shields.io/github/languages/code-size/adrigarry/framebot)
![Repo size](https://img.shields.io/github/repo-size/adrigarry/framebot)
[![Commit](https://img.shields.io/github/commit-activity/w/adrigarry/framebot)](https://github.com/AdriGarry/framebot/commits/master)
[![Last commit](https://img.shields.io/github/last-commit/adrigarry/framebot)](https://github.com/AdriGarry/framebot/commits/master)
[![Build status](https://img.shields.io/github/workflow/status/adrigarry/framebot/CI)](https://github.com/AdriGarry/framebot/actions)

**Framebot** is a NodeJS framework to autorun, automation & interaction.

This is a homemade Raspberry Pi program, to run JS modules, with an API (logger, tools...).

Available modes: ready, sleep, test.

## Functionalities

### Main

- Voice synthesizer (TTS)
- Voicemail
- Audio record from web user interface
- Alarm (weekday & weekend)
- Time/Calendar
- Timer
- Radiator & power plugs management
- Playlist (jukebox, low...)
- Web radio (FIP, Bam radio)
- Weather report
- Exclamations, sounds...
- Interactions with an Arduino (another robot: Max...)

### Additional

- Expressive functionalities: child and birthday song, crazy...
- Ambiance sounds (cicadas)
- Logger & cleaner
- Hardware monitoring (CPU, memory, diskspace, temperature)

### Input

- Buttons (GPIO)
- Cron
- User interface / web API

### Output

- Leds (GPIO)
- Speaker (audio)
- Arduino (USB)
- Screen (HDMI)
- Rfxcom

### Mood

Mood level, from 0 to 5 is an indice to set expressive level of the bot.

- 0: muted [volume = 0]
- 1: system TTS: clock, and others human triggered functions (timer...) [volume = 30]
- 2: [volume = 50]
- 3: max + interaction [volume = 60]
- 4: screen (diapo) [volume = 80]
- 5: party mode + pirate [volume = 100]

## Installation / Usage

- Go to _framebot_ directory
- First time, execute `sh framebot` to add `framebot` as command and launch framebot with _botName_ configuration given as first param
- Then, to launch execute `framebot $botName [params] [&]`
- To stop, execute `framebot stop`

## Framework

### API

- Core API
- CoreError
- CronJobList
- Files
- Flux
- Logger
- Observers
- Scheduler
- Utils

### Core engine

- Core
- Lock
- ModuleLoader

#### Core.conf

The Core.conf holds cycle informations: _mode, alarms, version_...

This object is isolated, with access methods.

This object is file persisted and has a default version to reset.

#### Core.run

The Core.run holds runtime informations: _etat, volume, max, mood, music, alarms, timer, voicemail, cpu, memory, stats_.

This object is isolated, with access methods.

#### Core.const

The Core.const holds non-modifiable informations: _version, startDateTime, uptdateTime, totalLines_...

This object is isolated, with access methods.

This object's entries are not updatable.

#### Flux manager

A flux manager, based on RxJS, can send or schedule (delay, repeat) orders.
_new Flux()_ function accepts flux object (full or detailled), or list of fluxs.

A flux is an Object with 3 properties:

- id: _type|subject|name_

- [data]: any type

- [conf]: `{delay, loop, log}`

  - [delay]: _number_ delay to fire flux in seconds

  - [loop]: _number_ times to loop flux

  - [log]: _string_ log level where the flux will be logged

## User interface

Provided user interface with flux orders and log (log tail with websocket).

:robot:
