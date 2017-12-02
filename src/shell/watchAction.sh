#!/bin/sh

# Watch Action

#__Function to update last modified date & time of Odi's files
updateLastModified(){
	lastUpdate=`ls | egrep ".*\.watcher$"`
	if [ -n "$lastUpdate" ]; then
		sudo rm "/home/pi/odi/$lastUpdate"
	fi
	# echo "updateLastModified()_lastUpdate:"$lastUpdate
	now=`date +"%Y-%m-%d %H:%M:%S"`
	# now=`date +"%d-%m %H:%M"`
	touch /home/pi/odi/"$now".watcher
	echo "Last modified time updated:" $now
}

echo $1

if [ $1 = "updateLastModified" ]; then
	updateLastModified
elif [ $1 = "watch" ]; then
	sh "/home/pi/odi/src/shell/watcher.sh" /home/pi/odi/core/ "sh /home/pi/odi/src/shell/watchAction.sh updateLastModified" &
	sh "/home/pi/odi/src/shell/watcher.sh" /home/pi/odi/data/ "sh /home/pi/odi/src/shell/watchAction.sh updateLastModified" &
	sh "/home/pi/odi/src/shell/watcher.sh" /home/pi/odi/web/ "sh /home/pi/odi/src/shell/watchAction.sh updateLastModified" &
	echo "--------------> TOTO2"
fi
