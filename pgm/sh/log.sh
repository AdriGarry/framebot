#!/bin/sh

reInitLogFiles () {
	sudo > /home/pi/odi/log/odi.log
	sudo chmod 777 /home/pi/odi/log/odi.log
	# sudo > /home/pi/odi/log/odiNode.log
}

deleteLogFiles () {
	sudo rm /home/pi/odi/log/*.log
	sudo touch /home/pi/odi/log/odi.log
}

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

if [ $1 = "clean" ]
then
	cleanLog
else
	echo "No action. Please add param..."
	# deleteLogFiles
fi
