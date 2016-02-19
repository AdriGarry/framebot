#!/bin/sh
# Startup Odi sound


volume=$(cat /sys/class/gpio/gpio13/value)

if [ $volume = 0 ]
then
	#sudo omxplayer -o local --vol -200 /home/pi/odi/mp3/sounds/system/startupOdi.mp3
	sudo omxplayer -o local /home/pi/odi/mp3/sounds/system/startupOdi2.mp3
else
	sudo omxplayer -o local --vol 500 /home/pi/odi/mp3/sounds/system/startupOdi2.mp3
fi