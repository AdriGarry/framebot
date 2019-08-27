#!/bin/bash

cd /home/odi/odi 

echo "\n___Git command: "$1

wget -q --spider http://google.com
if [ $? -eq 0 ];
then	
	if [ $1 = "pull" ]
	then
		# TODO ==> sauvegarder l'ancienne version !!
		sudo git pull --rebase https://adrigarry:pnal6931@github.com/adrigarry/odi
	elif [ $1 = "update" ]
	then
		sudo git reset --hard
		sudo git pull https://adrigarry:pnal6931@github.com/adrigarry/odi
		# sudo sh /home/odi/odi/src/shell/sounds.sh bb8 &
		sudo cp /home/odi/odi/src/shell/git.sh /home/odi/git.sh
		if [ ! -d "/home/odi/odi/mp3" ]
		then
			sudo cp -rf /home/odi/odiSave/mp3 /home/odi/odi/mp3 &
		fi
		sudo rm -rf /home/odi/odi/log/*

	elif [ $1 = "clone" ]
	then
		sudo rm -rf /home/odi/odi/
		sudo git clone https://adrigarry:pnal6931@github.com/adrigarry/odi /home/odi/odi/
		sudo cp /home/odi/odi/pgm/sh/git.sh /home/odi/git.sh
		if [ ! -d "/home/odi/odi/mp3" ]
		then
			sudo cp -rf /home/odi/odiSave/mp3 /home/odi/odi/mp3 &
		fi
		if [ ! -d "/home/odi/odi/log" ]
		then
			sudo mkdir /home/odi/odi/log &
		fi
	else
		sudo git status
	fi
else
	echo "Odi is offline, can't exec git operation   /!\\"
fi

echo "___Git: End.\n"