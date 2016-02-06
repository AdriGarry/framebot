#!/bin/bash

cd /home/pi/odi 

echo "\n___Git command: "$1

wget -q --spider http://google.com
if [ $? -eq 0 ];
then	
	if [ $1 = "pull" ]
	then
		sudo git pull --rebase https://adrigarry:pnal6931@github.com/adrigarry/odi
	elif [ $1 = "update" ]
	then
		sudo git reset --hard
		sudo git pull https://adrigarry:pnal6931@github.com/adrigarry/odi
		sudo sh /home/pi/odi/pgm/sh/sounds.sh bb8 &
		sudo cp /home/pi/odi/pgm/sh/git.sh /home/pi/git.sh
		if [ ! -d "/home/pi/odi/mp3" ]
		then
			sudo cp -rf /home/pi/odi2/mp3 /home/pi/odi/mp3 &
		fi
		if [ ! -d "/home/pi/odi/log" ]
		then
			sudo mkdir /home/pi/odi/log &
		fi
		sudo rm -rf /home/pi/odi/log/*

	elif [ $1 = "clone" ]
	then
		sudo rm -rf /home/pi/odi/
		sudo git clone https://adrigarry:pnal6931@github.com/adrigarry/odi /home/pi/odi/
		sudo cp /home/pi/odi/pgm/sh/git.sh /home/pi/git.sh
		if [ ! -d "/home/pi/odi/mp3" ]
		then
			sudo cp -rf /home/pi/odiSave/mp3 /home/pi/odi/mp3 &
		fi
		if [ ! -d "/home/pi/odi/log" ]
		then
			sudo mkdir /home/pi/odi/log &
		fi
	else
		sudo git status
	fi
else
	echo "Odi is offline, can't exec git operation   /!\\"
fi

echo "___Git: End.\n"