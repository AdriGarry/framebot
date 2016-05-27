#!/bin/sh

#___Son demi heure
if [ $1 = "half" ]
then
	sudo omxplayer -o local --vol 400 /home/pi/odi/mp3/system/clock-half.mp3

#___Son coq matin
elif [ $1 = "cocorico" ]
then
	sudo node /home/pi/odi/pgm/lib/allLedsOn.js
	sudo omxplayer -o local /home/pi/odi/mp3/system/cocorico.mp3
	sudo node /home/pi/odi/pgm/lib/allLedsOff.js	
else
	sudo omxplayer -o local --vol -500 /home/pi/odi/mp3/system/clock.mp3
fi
