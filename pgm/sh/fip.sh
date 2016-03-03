#!/bin/sh
echo 'Odi/ Play random music'

volume=$(cat /sys/class/gpio/gpio13/value)

if [ $volume = 0 ]
then
	sudo omxplayer -o local --vol -200 http://audio.scdn.arkena.com/11016/fip-midfi128.mp3 &
else
	sudo omxplayer -o local --vol 300 http://audio.scdn.arkena.com/11016/fip-midfi128.mp3 &
fi


