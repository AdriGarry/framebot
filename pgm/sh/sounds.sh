#!/bin/sh

#___Sons Generiques
volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume -eq 0 ]
then
	volume=-400 #-450
else
	volume=400 #350
fi

#___Son restart Odi Program
if [ $1 = "odi" ]
then
	sudo omxplayer -o local --vol $volume /home/pi/odi/mp3/system/startupOdi.mp3
else
	sudo node /home/pi/odi/pgm/lib/allLedsOn.js

	echo $1
	
	#___Son Demarrage Odi
	if [ $1 = "startup" ]
	then
		#sound="/home/pi/odi/mp3/system/bonjour.mp3"
		sound="/home/pi/odi/mp3/system/bonjourBonjour.mp3"
	#___Son Redemarrage Odi
	elif [ $1 = "reboot" ]
	then
		sound="/home/pi/odi/mp3/system/beBack.mp3"
	#___Son Arret Odi
	elif [ $1 = "shutdown" ]
	then
		sound="/home/pi/odi/mp3/system/sessionOff.mp3"
	# elif [ $1 = "cocorico" ]
	# then
		# sound="/home/pi/odi/mp3/system/cocorico.mp3"
	#___Son Cigales
	elif [ $1 = "cigales" ]
	then
		sound="/home/pi/odi/mp3/Cigales.mp3"
	#___Son Mer du matin
	elif [ $1 = "MorningSea" ]
	then
		sound="/home/pi/odi/mp3/MorningSea.mp3"
	#___Son oiseaux du matin
	elif [ $1 = "MorningBirds" ]
	then
		sound="/home/pi/odi/mp3/MorningBirds.mp3"
	#___Chanson 'Il est Midi'
	elif [ $1 = "IlEstMidi" ]
	then
		sound="/home/pi/odi/mp3/DeLaSoulTransmittingLiveFromMars.mp3"
	#___Son Test
	elif [ $1 = "test" ]
	then
		sound="/home/pi/odi/mp3/system/test.mp3"
	elif [ $1 = "new" ]
	#___Son Test derniere maj
	then
		sound="/home/pi/odi/mp3/exclamation/jusquIciToutVaBienLaHaine.mp3"
	#___Son par defaut : ressort
	else
		sound="/home/pi/odi/mp3/exclamation/ressort.mp3"
	fi

	sudo omxplayer -o local --vol $volume $sound
	sudo node /home/pi/odi/pgm/lib/allLedsOff.js
fi