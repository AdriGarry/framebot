#!/bin/sh

clearLastTTS(){
	sudo chmod 777 /home/pi/odi/pgm/tmp/lastTTS.log
	sudo rm -f /home/pi/odi/pgm/tmp/lastTTS.log
	echo 
}

clearVoiceMail(){
	sudo chmod 777 /home/pi/odi/pgm/tmp/voicemail.log
	sudo rm -f /home/pi/odi/pgm/tmp/voicemail.log
	echo 
}


echo $*
case $1 in
	"clearLastTTS")
		clearLastTTS ;;
	"clearVoiceMail")
		clearVoiceMail ;;
	*)
		echo "Pas d'argument..." ;;
esac
