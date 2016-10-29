#!/bin/sh

#___Delete config file for reinitialization
sudo rm /home/pi/odi/conf.json

#___Action redemarrage
if [ $1 = "reboot" ]
then
	sudo reboot
#___Action arret
else
	sudo halt
fi

