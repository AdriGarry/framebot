#!/bin/sh

#___Sons Party mode
sudo node /home/pi/odi/core/modules/allLedsOn.js
volume=300
if [ $1 = "startParty" ]
then
	sound="/home/pi/odi/data/mp3/party/startParty.mp3"
	volume=600
elif [ $1 = "pasAssezSaoul" ]
then
	sound="/home/pi/odi/data/mp3/party/pasAssezSaoul.mp3"
	volume=600
elif [ $1 = "puisJeExprimer" ]
then
	sound="/home/pi/odi/data/mp3/party/puisJeExprimer.mp3"
	volume=600
elif [ $1 = "discours" ]
then
	sudo node /home/pi/odi/core/modules/allLedsOn.js
	sound="/home/pi/odi/data/mp3/party/discours.mp3"
	volume=300
elif [ $1 = "23h" ]
then
	sound="/home/pi/odi/data/mp3/party/23h.mp3"
	volume=600
elif [ $1 = "23h30" ]
then
	sound="/home/pi/odi/data/mp3/party/23h30.mp3"
	volume=600
elif [ $1 = "compteARebours" ]
then
	sudo node /home/pi/odi/core/modules/allLedsOn.js
	sound="/home/pi/odi/data/mp3/party/compteARebours.mp3"
	volume=600
elif [ $1 = "compteARebours2" ]
then
	sudo node /home/pi/odi/core/modules/allLedsOn.js
	sound="/home/pi/odi/data/mp3/party/compteARebours2.mp3"
	volume=600
else
	sound="/home/pi/odi/data/mp3/sounds/circuitsTransistors.mp3"
fi

volume=800

sudo omxplayer -o local --vol $volume $sound
sudo node /home/pi/odi/core/modules/allLedsOff.js