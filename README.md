# Odi

##Hi there !
This is **Odi's** program to autorun and interact !

Available functionalities:

* Voice synthetisis (TTS)
* Voicemail
* Alarm (weekday & weekend)
* Timer
* Jukebox
* Web radio (FIP)
* Exclamations
* Can control an Arduino (Max...)

###Odi.conf
The Odi.conf holds Odi cycle informations: _mode, alarms, version_.
This object is an isolated object, with access methods.
This object is file persisted and has a default version.

###Odi.run
The Odi.run holds Odi runtime informations: _etat, volume, max, mood, music, alarms, timer, voicemail, cpu, memory, stats_.
This object is an isolated object, with access methods.

###Flux manager
A flux manager, based on RxJS, can send order or schedule (delay, repeat) them, through the _next()_ function.

_adrigarry_
