#!/bin/bash

if [ $1 = "loop" ]
then
	SERVICE="omxplayer" # On definit le service a utiliser (omxplayer)
	while true; do # On scanne en boucle le dossier
		if ps ax | grep -v grep | grep $SERVICE > /dev/null
			then
			sleep 10; # Le script plante parfois si la pause n'est pas assez longue
		else
			sound=$(sudo find /home/pi/odi/mp3/sounds -maxdepth 1 -type f | shuf | head -1)
			sudo omxplayer -o local $sound > /dev/null
		fi
	done
else
	sound=$(sudo find /home/pi/odi/mp3/sounds -maxdepth 1 -type f | shuf | head -1)
	sudo omxplayer -o local --vol 100 $sound
fi