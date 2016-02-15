#!/bin/sh

if [ $1 = "almost" ]
then
	sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/timer-almost-end.mp3
elif [ $1 = "end" ]
then
	sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/timer-end.mp3
else
	sudo omxplayer -o local --vol -200 /home/pi/odi/mp3/sounds/autres/timer.mp3
fi