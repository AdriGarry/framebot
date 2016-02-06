#!/bin/bash

sudo killall omxplayer
sudo killall mplayer

echo $*
url="http://translate.google.com/translate_tts?tl=fr&client=tw-ob&q=$*"

sudo amixer cset numid=3 1

volume=$(cat /sys/class/gpio/gpio13/value)

if [ $volume = 0 ]
then
	sudo mplayer -softvol -volume 100 -really-quiet -noconsolecontrols "$url"
else
	sudo mplayer -softvol -volume 250 -really-quiet -noconsolecontrols "$url"
fi
