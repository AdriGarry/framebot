#!/bin/sh

deleteLogFiles () {
	sudo rm /home/pi/odi/log/*
}


if [ $1 = "delete" ]
then
	deleteLogFiles
else
	echo "No action. Please add param..."
	# deleteLogFiles
fi
