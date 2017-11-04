#!/bin/sh

#___Screen

if [ $1 = "on" ] # Switch screen off
then
	sudo /opt/vc/bin/tvservice -p
	echo screenOn

else # Switch screen on
	sudo /opt/vc/bin/tvservice -o
	echo screenOff
fi
