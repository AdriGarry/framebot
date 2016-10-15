#!/bin/sh

#___Fonction silence automatique dans une heure
if [ $1 = "auto" ]
then
	sudo omxplayer -o local --vol 200 /home/pi/odi/data/mp3/system/autoMute.mp3
fi

#___Fonction silence
sudo killall omxplayer.bin
sudo killall mplayer
sudo killall espeak
sudo killall sh
