#!/bin/sh

#___Fonction nettoyage dernier message
clearLastTTS(){
	sudo chmod 777 /home/pi/odi/tmp/lastTTS.log
	sudo rm -f /home/pi/odi/tmp/lastTTS.log
	echo 
}

#___Fonction nettoyage Messagerie
#clearVoiceMail(){
#	sudo chmod 777 /home/pi/odi/tmp/voicemail.log
#	sudo rm -f /home/pi/odi/tmp/voicemail.log
#	echo 
#}


echo $*
case $1 in
	"clearLastTTS")
		clearLastTTS ;;
	#"clearVoiceMail")
	#	clearVoiceMail ;;
	*)
		echo "Pas d'argument..." ;;
esac
