#!/bin/sh

exclamation () {
	volume=$(cat /sys/class/gpio/gpio13/value)
	sound=$(sudo find /home/pi/odi/mp3/exclamation -maxdepth 1 -type f | shuf | head -1)
	if [ $volume = 0 ]
	then
		volume=-400 #-600
	else
		volume=400 #400
	fi
	sudo omxplayer -o local --vol $volume $sound > /dev/null
}


if [ $1 = "loop" ]
then
	SERVICE="omxplayer" # On definit le service a utiliser (omxplayer)
	while true; do # On scanne en boucle le dossier
		if ps ax | grep -v grep | grep $SERVICE > /dev/null
			then
			sleep 10; # Le script plante parfois si la pause n'est pas assez longue
		else
			exclamation
		fi
	done
else
	exclamation
fi
