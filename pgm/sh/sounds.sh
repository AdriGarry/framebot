#!/bin/sh

volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume -eq 0 ]
then
	volume=-400 #-450
else
	volume=400 #350
fi

if [ $1 = "odi" ]
then
	sudo omxplayer -o local --vol $volume /home/pi/odi/mp3/system/startupOdi.mp3
else
	sudo node /home/pi/odi/pgm/lib/allLedsOn.js

	echo $1
	if [ $1 = "startup" ]
	then
		sound="/home/pi/odi/mp3/system/bonjour.mp3"
	elif [ $1 = "reboot" ]
	then
		sound="/home/pi/odi/mp3/system/beBack.mp3"
	elif [ $1 = "shutdown" ]
	then
		sound="/home/pi/odi/mp3/system/sessionOff.mp3"
	# elif [ $1 = "cocorico" ]
	# then
		# sound="/home/pi/odi/mp3/system/cocorico.mp3"
	elif [ $1 = "test" ]
	then
		sound="/home/pi/odi/mp3/system/test.mp3"
	elif [ $1 = "new" ]
	then
		sound="/home/pi/odi/mp3/exclamation/jusquIciToutVaBienLaHaine.mp3"
	else
		sound="/home/pi/odi/mp3/exclamation/ressort.mp3"
	fi

	sudo omxplayer -o local --vol $volume $sound
	sudo node /home/pi/odi/pgm/lib/allLedsOff.js
fi