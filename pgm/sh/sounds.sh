#!/bin/sh

sudo node /home/pi/odi/pgm/lib/allLedsOn.js

volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume = 0 ]
then
	volume = -500
else
	volume = 350
fi

echo $1
if [ $1 = "sonar" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/sonar.mp3"
elif [ $1 = "test" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/testMode.mp3"

	elif [ $1 = "carburant" ]
then
	sound="/home/pi/odi/mp3/sounds/carburant.mp3"
elif [ $1 = "r2d2" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/r2d2.2.mp3"
elif [ $1 = "bb8" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/bb8.mp3"
elif [ $1 = "start" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/mac-startup-sound2.mp3"
elif [ $1 = "started" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/launchingcompleted.mp3"
elif [ $1 = "reboot" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/beback.mp3"
elif [ $1 = "shutdown" ]
then
	sound="/home/pi/odi/mp3/sounds/autres/sessionOff.mp3"
else
	sound="/home/pi/odi/mp3/sounds/autres/radio-switch.mp3"
fi

sudo omxplayer -o local --vol $volume $sound
sudo node /home/pi/odi/pgm/lib/allLedsOff.js