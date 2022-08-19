# Framebot

[![Version](https://img.shields.io/github/package-json/v/adrigarry/framebot)](https://github.com/AdriGarry/framebot/tags)
![Languages](https://img.shields.io/github/languages/count/adrigarry/framebot)
![Top language](https://img.shields.io/github/languages/top/adrigarry/framebot)
![Total lines](https://img.shields.io/tokei/lines/github/adrigarry/framebot)
![Code size](https://img.shields.io/github/languages/code-size/adrigarry/framebot)

[![Pull request](https://img.shields.io/github/issues-pr/adrigarry/framebot)](https://github.com/AdriGarry/framebot/pulls)
[![Commit](https://img.shields.io/github/commit-activity/w/adrigarry/framebot)](https://github.com/AdriGarry/framebot/commits/master)
[![Last commit](https://img.shields.io/github/last-commit/adrigarry/framebot)](https://github.com/AdriGarry/framebot/commits/master)
[![Build status](https://img.shields.io/github/workflow/status/adrigarry/framebot/CI)](https://github.com/AdriGarry/framebot/actions)

**Framebot** is a NodeJS framework for home automation & interaction.

Based on a rolling release development approach, this is a homemade Raspberry Pi program, to run JavaScript modules, with an API (scheduler, logger, tools...).

Available modes: ready (active), sleep.

## Functionalities

### Main

- Voice synthesizer (TTS), with voicemail
- Audio record (from web user interface)
- Alarm (weekday and weekend)
- Time/Calendar
- Timer
- Hardware and network monitoring
- Radiator and power plugs management
- Playlist (jukebox, low...)
- Web radio (FIP)
- Weather report
- Exclamations, sounds and expressive functionalities: child and birthday song, crazy...
- Interactions with an Arduino (another robot: Max...)
- Ambiance sounds (cicadas)

#### Mood

Mood level, from 0 to 5 is an indice to set expressive level of the bot.

- 0: muted [volume = 0]
- 1: system TTS: clock, and others human triggered functions (timer...) [volume = 30]
- 2: [volume = 50]
- 3: max + interactions [volume = 60]
- 4: screen (diapo) [volume = 80]
- 5: party mode + pirate [volume = 90]

## Interfaces

### Input

- Buttons (GPIO)
- User interface / web API
- Rfxcom

### Output

- Leds (GPIO)
- Speaker (audio)
- Arduino (USB)
- Screen (HDMI)
- Rfxcom

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

### Shared space

Contains shared properties between modules. Accessible threw the 'Core' object, this object is isolated, with an accessors pattern :

- One argument, like `Core.conf(propertyName)`: to get the property named _propertyName_
- Two arguments, like `Core.conf(propertyName, value)`: to set the _value_ to property _propertyName_

#### Core.conf

The Core.conf holds cycle informations: _mode, log level_...

This object is file persisted.

This object has a default version to reset.

#### Core.run

The Core.run holds runtime informations: _etat, volume, mood, music, timer, cpu, memory, stats_...

#### Core.const

The Core.const holds non-modifiable informations: _name, version, startDateTime, uptdateTime, totalLines_...

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
