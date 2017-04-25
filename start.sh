#!/bin/sh

clear

echo "start.sh -> Start Odi Pgm..."

# configFile="/home/pi/odi/tmp"
# tmpDir="/home/pi/odi/tmp"

# Test if log directory exists
if [ ! -d /home/pi/odi/log ];
then
	mkdir /home/pi/odi/log
	echo "Creating Log file"
fi

# if [ -n "$lastUpdate" ]; then
# 	# echo $lastUpdate
# else
# 	sh /home/pi/odi/core/sh/watchAction.sh updateLastModified ;;
# fi


# Retreive last modified time
lastUpdate=`ls | egrep ".*\.watcher$" | sed 's/.\{8\}$//'`
if [ ! -n "$lastUpdate" ]; then
	echo "File doesn't exists. Creating it"
	sh "/home/pi/odi/core/sh/watchAction.sh" updateLastModified
fi
lastUpdate=`ls | egrep ".*\.watcher$" | sed 's/.\{8\}$//'`

# Test if conf file is empty, then reInit
if [ ! -s /home/pi/odi/conf.json ];
then
	sudo rm /home/pi/odi/conf.json
fi

# Test if conf file exists
if [ ! -f /home/pi/odi/conf.json ];
then
	sudo cp /home/pi/odi/data/defaultConf.json /home/pi/odi/conf.json
	sudo chmod 777 /home/pi/odi/conf.json
	echo "Config file reset"
fi

# Test if tmp directory exists
if [ ! -d /home/pi/odi/tmp ];
then
	mkdir /home/pi/odi/tmp
	echo "Creating tmp file"
fi

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
sudo node /home/pi/odi/core/master.js "$lastUpdate" 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &


# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/core/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/data/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/web/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &

# sh "/home/pi/odi/core/sh/watchAction.sh" "watch" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/core/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/data/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/web/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# echo "--------------> TOTO"
#tail -f /home/pi/odi/log/odi.log
# gksudo lxterminal --geometry=75*50 -e "tail -f /home/pi/odi/log/odi.log"