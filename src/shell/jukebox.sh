#!/bin/sh

#___Fonction Jukebox

# SERVICE="omxplayer" # On definit le service a utiliser (omxplayer)

#___Fonction Jukebox Meddley
if [ $1 = "medley" ]
then
	position=$(shuf -e 4 51 -n 1)
	playTime=$(shuf -i 5-13 -n 1)
	echo $position " -> " $(($position+$playTime)) " [" $playTime "s]"
	sudo omxplayer -o local --pos $position --vol 200 /home/pi/odi/media/mp3/jukebox/originsOfTheVillain1.mp3 > /dev/null &
	#sudo node /home/pi/odi/core/modules/allLedsOff.js
	#sudo node /home/pi/odi/core/modules/leds.js allLedsOff
	sleep $playTime
	#sudo node /home/pi/odi/core/modules/allLedsOn.js
	#sudo node /home/pi/odi/core/modules/leds.js allLedsOn
	sudo killall omxplayer.bin

	while true; do # On scanne en boucle le dossier
			music=$(sudo find /home/pi/odi/media/mp3/jukebox -maxdepth 1 -type f | shuf | head -1)
			volume=$(cat /sys/class/gpio/gpio13/value)
			position=$(shuf -i 5-120 -n 1)
			playTime=$(shuf -i 3-7 -n 1)

			if [ $volume = 0 ]
			then
				sudo omxplayer -o local --pos $position --vol -500 $music > /dev/null &
			else
				sudo omxplayer -o local --pos $position --vol 300 $music > /dev/null &
			fi
			#sudo node /home/pi/odi/core/modules/allLedsOff.js
			# sudo node /home/pi/odi/core/modules/leds.js allLedsOff
			#echo "PlayTime : " $playTime "sec"
			sleep $playTime
			#sudo node /home/pi/odi/core/modules/allLedsOn.js
			# sudo node /home/pi/odi/core/modules/leds.js allLedsOn
			sudo killall omxplayer.bin
	done
#___Fonction Jukebox Normal
else
	while true; do # On scanne en boucle le dossier
			music=$(sudo find /home/pi/odi/media/mp3/jukebox -maxdepth 1 -type f | shuf | head -1)
			volume=$(cat /sys/class/gpio/gpio13/value)
			position=$(shuf -i 5-20 -n 1)
			playTimeDecimal=$(mplayer -identify -ao null -vo null -frames 0 $music | grep ^ID_LENGTH= | cut -d = -f 2)
			echo "playTimeDecimal " $playTimeDecimal
			playTime=${playTimeDecimal%.*}
			playTimeReal=$(($playTime-$position))
			#echo "playTime " $playTime
			echo "playTime " $playTime " - position " $position " = " $(($playTime-$position)) " sec"
			
			if [ $volume = 0 ]
			then
				sudo omxplayer -o local --pos $position --vol -500 $music > /dev/null &
			else
				sudo omxplayer -o local --pos $position --vol 300 $music > /dev/null &
			fi
			#sudo node /home/pi/odi/core/modules/allLedsOff.js
			# sudo node /home/pi/odi/core/modules/leds.js allLedsOff
			sleep $playTimeReal
			#sudo node /home/pi/odi/core/modules/allLedsOn.js
			# sudo node /home/pi/odi/core/modules/leds.js allLedsOn
			sudo killall omxplayer.bin
	done
fi