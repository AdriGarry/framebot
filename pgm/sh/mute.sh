#!/bin/sh
# Mute

if [ $1 = "auto" ]
then
	sudo omxplayer -o local --vol 200 /home/pi/odi/mp3/system/autoMute.mp3
fi

sudo killall omxplayer.bin
sudo killall mplayer
sudo killall espeak
sudo killall sh
