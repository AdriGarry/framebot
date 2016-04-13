#!/bin/sh

clearLastTTS(){
	sudo rm -f /home/pi/odi/pgm/tmp/lastTTS.log
	echo 
}

echo $*
case $1 in
	"clearLastTTS")
		clearLastTTS ;;
	*)
		echo "Pas d'argument..." ;;
esac
