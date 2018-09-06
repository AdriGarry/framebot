#!/bin/sh

# TO REMOVE !!

#__Params
echo "CleanUp script"

#__TEST IF LOG DIRECTORY EXISTS
if [ ! -d /home/pi/odi/log ];
then
	mkdir /home/pi/odi/log
	echo "Creating Log file"
fi

#__TEST IF CONF FILE IS EMPTY, THEN REINIT
if [ ! -s /home/pi/odi/conf.json ];
then
	sudo rm /home/pi/odi/conf.json
fi

#__TEST IF CONF FILE EXISTS
if [ ! -f /home/pi/odi/conf.json ];
then
	sudo cp /home/pi/odi/data/defaultConf.json /home/pi/odi/conf.json
	sudo chmod 777 /home/pi/odi/conf.json
	echo "Config file reset"
fi

#__TEST IF TMP DIRECTORY EXISTS
if [ ! -d /home/pi/odi/tmp ];
then
	mkdir /home/pi/odi/tmp
	echo "Creating tmp file"
fi
