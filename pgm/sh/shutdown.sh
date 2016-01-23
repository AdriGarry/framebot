#!/bin/bash

if [ $1 = "reboot" ]
then
	#sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/beback.mp3
	#sleep 1
	#sudo shutdown -r
	sudo reboot
else
	#sudo omxplayer -o local /home/pi/odi/mp3/sounds/autres/powerOff.mp3
	#sleep 1
	#sudo shutdown -r
	sudo halt
fi

