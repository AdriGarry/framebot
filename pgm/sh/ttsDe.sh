#!/bin/sh
 
sudo killall omxplayer
sudo killall mplayer

echo $*
url="http://translate.google.com/translate_tts?tl=de&client=tw-ob&q=$*"

sudo amixer cset numid=3 1

volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume -eq 0 ]
then
	volume=100
else
	volume=220
fi

sudo mplayer -softvol -volume $volume -really-quiet -noconsolecontrols "$url"