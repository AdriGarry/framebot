#!/bin/bash

sudo node /home/pi/odi/pgm/lib/allLedsOn.js
volume=300
echo $1
if [ $1 = "sonar" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/sonar.wav"
	volume=300
elif [ $1 = "test" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/testMode.mp3"
	volume=400
elif [ $1 = "carburant" ]
then
	sound="/home/pi/odi/mp3/sounds/carburant.mp3"
	volume=600
elif [ $1 = "r2d2" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/r2d2.2.mp3"
	volume=500
elif [ $1 = "bb8" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/bb8.mp3"
	volume=500
elif [ $1 = "start" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/mac-startup-sound2.mp3"
	volume=600
elif [ $1 = "git" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/launchingcompleted.mp3"
	volume=600
elif [ $1 = "reboot" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/beback.mp3"
	volume=600
elif [ $1 = "shutdown" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/sessionOff.mp3"
	volume=600
else
	sound="/home/pi/odi/mp3/sounds/autres/radio-switch.mp3"
fi

sudo omxplayer -o local --vol $volume $sound
sudo node /home/pi/odi/pgm/lib/allLedsOff.js