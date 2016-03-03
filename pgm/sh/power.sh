#!/bin/sh

if [ $1 = "reboot" ]
then
	sudo reboot
else
	sudo halt
fi

