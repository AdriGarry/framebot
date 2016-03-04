#!/bin/sh
 
#sudo killall omxplayer
sudo killall mplayer

echo $1

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

espeak -vfr "$*"