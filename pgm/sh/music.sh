#!/bin/bash

sudo node /home/pi/odi/pgm/lib/allLedsOn.js

#volume=300
volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume = 0 ]
then
	volume=-600
else
	volume=400
fi

echo $1
if [ $1 = "mouthTrick" ]
then
	music="/home/pi/odi/mp3/jukebox/milanMouthTrick.mp3"
elif [ $1 = "1" ]
then
	music="/home/pi/odi/mp3/jukebox/blackIsTheNight.mp3"
elif [ $1 = "2" ]
then
	music="/home/pi/odi/mp3/jukebox/bellX1Flame.mp3"
else
	music="/home/pi/odi/mp3/jukebox/originsOfTheVillain1.mp3"
fi

sudo omxplayer -o local --vol $volume $music
sudo node /home/pi/odi/pgm/lib/allLedsOff.js