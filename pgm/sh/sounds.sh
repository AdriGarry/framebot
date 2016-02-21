#!/bin/sh

sudo node /home/pi/odi/pgm/lib/allLedsOn.js

volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume -eq 0 ]
then
	volume=-450
else
	volume=350
fi

echo $1
if [ $1 = "sonar" ]
then
	sound="/home/pi/odi/mp3/sounds/system/sonar.mp3"
elif [ $1 = "test" ]
then
	sound="/home/pi/odi/mp3/sounds/system/testMode.mp3"

	elif [ $1 = "carburant" ]
then
	sound="/home/pi/odi/mp3/sounds/carburant.mp3"
elif [ $1 = "fullmetaljacket" ]
then
	sound="/home/pi/odi/mp3/sounds/FullMetalJacket2.mp3"
elif [ $1 = "ressort" ]
then
	sound="/home/pi/odi/mp3/sounds/ressort.mp3"
elif [ $1 = "r2d2" ]
then
	sound="/home/pi/odi/mp3/sounds/system/r2d2.2.mp3"
elif [ $1 = "bb8" ]
then
	sound="/home/pi/odi/mp3/sounds/system/bb8.mp3"
elif [ $1 = "start" ]
then
	sound="/home/pi/odi/mp3/sounds/system/mac-startup-sound2.mp3"
elif [ $1 = "started" ]
then
	sound="/home/pi/odi/mp3/sounds/system/bonjour.mp3"
elif [ $1 = "reboot" ]
then
	sound="/home/pi/odi/mp3/sounds/system/beback.mp3"
elif [ $1 = "shutdown" ]
then
	sound="/home/pi/odi/mp3/sounds/system/sessionOff.mp3"
else
	sound="/home/pi/odi/mp3/sounds/system/radio-switch.mp3"
fi

sudo omxplayer -o local --vol $volume $sound
sudo node /home/pi/odi/pgm/lib/allLedsOff.js