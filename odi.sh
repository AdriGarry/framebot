#!/bin/sh

clear

ODI_PATH="/home/pi/odi"
echo $ODI_PATH

echo "odi.sh -> Start Odi Pgm... [$*]"

if [ $1 =  "reset2" ]
   then
	echo "Reseting Odi..."
	/bin/bash $ODI_PATH/src/shell/reset.sh
	echo "Odi reseted !"
fi

# configFile="/home/pi/odi/tmp"
# tmpDir="/home/pi/odi/tmp"

# Test if log directory exists
# if [ ! -d "$ODI_PATH"/log ];
# then
# 	mkdir "$ODI_PATH"/log
# 	echo "Creating Log folder"
# fi

# if [ -n "$lastUpdate" ]; then
# 	# echo $lastUpdate
# else
# 	sh /home/pi/odi/core/sh/watchAction.sh updateLastModified ;;
# fi

# Test if conf file is empty, then reInit
# if [ ! -s "$ODI_PATH"/conf.json ];
# then
# 	sudo rm "$ODI_PATH"/conf.json
# fi

# Test if conf file exists
# if [ ! -f "$ODI_PATH"/conf.json ];
# then
# 	sudo cp "$ODI_PATH"/data/defaultConf.json "$ODI_PATH"/conf.json
# 	sudo chmod 777 "$ODI_PATH"/conf.json
# 	echo "Config file reset"
# fi

# Test if tmp directory exists
# if [ ! -d "$ODI_PATH"/tmp ];
# then
# 	# "$ODI_PATH"/tmp
# 	mkdir "$ODI_PATH"/tmp
# 	echo "Creating tmp folder"
# fi

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
# sudo node /home/pi/odi/core/master.js "$lastUpdate" 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
sudo node "$ODI_PATH"/src/launcher.js $* 2>&1 | sudo tee -a "$ODI_PATH/log/odi.log" &

# lxterminal -e tail -f /home/pi/odi/log/odi.log

# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/core/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/data/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sudo sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/web/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &

# sh "/home/pi/odi/core/sh/watchAction.sh" "watch" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/core/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/data/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
# sh "/home/pi/odi/core/sh/watcher.sh" /home/pi/odi/web/ "sh /home/pi/odi/core/sh/watchAction.sh updateLastModified" &
#tail -f /home/pi/odi/log/odi.log
# gksudo lxterminal --geometry=75*50 -e "tail -f /home/pi/odi/log/odi.log"

