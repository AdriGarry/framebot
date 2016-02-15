#!/bin/sh

if [ $1 = "loop" ]
then
	SERVICE="omxplayer" # On definit le service a utiliser (omxplayer)
	while true; do # On scanne en boucle le dossier
		if ps ax | grep -v grep | grep $SERVICE > /dev/null
			then
			sleep 10; # Le script plante parfois si la pause n'est pas assez longue
		else
			volume=$(cat /sys/class/gpio/gpio13/value)
			sound=$(sudo find /home/pi/odi/mp3/sounds -maxdepth 1 -type f | shuf | head -1)
			if [ $volume = 0 ]
			then
				sudo omxplayer -o local --vol -600 $sound > /dev/null
			else
				sudo omxplayer -o local --vol 400 $sound > /dev/null
			fi
		fi
	done
else
	volume=$(cat /sys/class/gpio/gpio13/value)
	
	sound=$(sudo find /home/pi/odi/mp3/sounds -maxdepth 1 -type f | shuf | head -1)
	sudo omxplayer -o local --vol 100 $sound
fi