#!/bin/sh

#__Sons pour minuterie
if [ $1 = "almost" ]
then
	#__10 dernieres secondes
	sudo omxplayer -o local /home/pi/core/media/mp3/system/timerAlmostEnd.mp3
elif [ $1 = "end" ]
then
	#___Fin minuterie
	sudo omxplayer -o local /home/pi/core/media/mp3/system/timerEnd.mp3
else
	#___Son minuterie active
	sudo omxplayer -o local --vol -200 /home/pi/core/media/mp3/system/timer.mp3
fi