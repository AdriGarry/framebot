#!/bin/sh

#___Fonction ##
reInitLogFiles () {
	sudo > /home/pi/odi/log/odi.log
	sudo chmod 777 /home/pi/odi/log/odi.log
	# sudo > /home/pi/odi/log/odiNode.log
}

#___Fonction suppression fichiers de logs
deleteLogFiles () {
	sudo rm /home/pi/odi/log/*.log
	sudo touch /home/pi/odi/log/odi.log
}

#___Fonction archivage des logs
cleanLog () {
	if [ ! -d "/home/pi/odi/log/old" ]
	then
		sudo mkdir /home/pi/odi/log/old
	fi
	weekNb=$(/bin/date +%V)
	# echo "weekNb : "$weekNb
	sudo cp /home/pi/odi/log/odi.log /home/pi/odi/log/old/odi$weekNb.log 
	reInitLogFiles
	#deleteLogFiles
}

#___Fonction archivage des logs
screenTail () {
	echo "screenTail"
	# lxterminal -e "/home/pi/odi/core/log/odi.log"
	tail -f /home/pi/odi/log/odi.log
}

if [ $1 = "clean" ]
then
	cleanLog
elif [ $1 = "tail" ]
then
	screenTail
else
	echo "No action. Please add param..."
	# deleteLogFiles
fi
