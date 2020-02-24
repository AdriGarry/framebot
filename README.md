# Core

Based on NodeJS, running on a Raspberry Pi, this is **Core** program, to autorun, manage stuff and interact.

It's a kind of framework, to run js modules, with a flux manager, logger, tools...

Available modes: ready, sleep, test

## Main functionalities:

- Voice synthesizer (TTS)
- Voicemail
- Audio record from UI
- Alarm (weekday & weekend)
- Time/Timer
- Radiator & power plugs management
- Playlist (jukebox, low...)
- Web radio (FIP, radio Bam)
- Exclamations
- Interactions with an Arduino (Max...)
- Weather report

### Additional functionalities:

- Expressive functionalities: child and birthday song, crazy (bad boy mode)...
- Ambiance sounds (cicadas)
- Logger & cleaner
- Hardware monitoring (CPU, diskspace, temperature)

## Usage

- Go to _core_ directory
- First time, execute `sh core.sh $botName` to add `core` as command and launch core with _botName_ configuration given as first param
- Then, to launch execute `core $botName [params]`
- To stop, execute `core stop`

## Internal

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

### Core engine

#### Core.conf

The Core.conf holds cycle informations: _mode, alarms, version_...

This object is isolated, with access methods.

This object is file persisted and has a default version to reset.

#### Core.run

The Core.run holds runtime informations: _etat, volume, max, mood, music, alarms, timer, voicemail, cpu, memory, stats_.

This object is isolated, with access methods.

#### Flux manager

A flux manager, based on RxJS, can send or schedule (delay, repeat) orders.
The _Core.do() (Flux.next())_ function accepts flux object (full or detailled), or list of fluxs.

A flux is an Object with 3 properties:

- id: _type|subject|name_

- [data]: any type

- [conf]: `{delay, loop, log}`

  - [delay]: _number_ delay to fire flux in seconds

  - [loop]: _number_ times to loop flux

  - [log]: _string_ log level where the flux will be logged

.
