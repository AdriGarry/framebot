#!/bin/sh
# Mute

if [ $1 = "auto" ]
then
	sudo omxplayer -o local --vol 200 /home/pi/odi/mp3/sounds/system/auto-mute.mp3
#else
	# sudo killall omxplayer.bin
	# sudo killall mplayer
	# sudo killall sh
fi

sudo killall omxplayer.bin
sudo killall mplayer
sudo killall sh
