#!/bin/sh

echo "start.sh -> Start Odi Pgm..."

# configFile="/home/pi/odi/tmp"
# tmpDir="/home/pi/odi/tmp"

# TEST IF LOG DIRECTORY EXISTS
if [ ! -d /home/pi/odi/log ];
then
	mkdir /home/pi/odi/log
	echo "Creating Log file"
fi


# TEST IF CONF FILE EXISTS
if [ ! -f /home/pi/odi/conf.json ];
then
	sudo cp /home/pi/odi/data/defaultConf.json /home/pi/odi/conf.json
	sudo chmod 777 /home/pi/odi/conf.json
	echo "Config file reset"
fi

# TEST IF TMP DIRECTORY EXISTS
if [ ! -d /home/pi/odi/tmp ];
then
	mkdir /home/pi/odi/tmp
	echo "Creating tmp file"
fi

sudo node /home/pi/odi/core/manager.js 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
