#!/bin/bash

if [ $1 = "reboot" ]
then
	#sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/beback.mp3
	sudo reboot
else
	#sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/powerOff.mp3
	sudo halt
fi

