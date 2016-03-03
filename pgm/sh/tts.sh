#!/bin/sh
 
#sudo killall omxplayer
sudo killall mplayer

echo $1
# lg="fr"
case $1 in
	"en")
		lg="en" ;;
	"es")
		lg="es" ;;
	"it")
		lg="it" ;;
	"de")
		lg="de" ;;
	*)
		lg="fr" ;;
esac

shift

echo $*
url="http://translate.google.com/translate_tts?tl=$lg&client=tw-ob&q=$*"

sudo amixer cset numid=3 1

volume=$(cat /sys/class/gpio/gpio13/value)
if [ $volume -eq 0 ]
then
	volume=100
else
	volume=220
fi

sudo mplayer -softvol -volume $volume -really-quiet -noconsolecontrols "$url"

#si aucun son, verifier volume avec la commande alsamixer