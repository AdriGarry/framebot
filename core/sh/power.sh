#!/bin/sh

#___Action redemarrage
if [ $1 = "reboot" ]
then
	sudo reboot
#___Action arret
else
	sudo halt
fi

