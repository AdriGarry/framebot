#!/bin/sh

#__si aucun son, verifier le niveau du volume avec la commande alsamixer  /!\ 
#sudo killall omxplayer
sudo killall mplayer
sudo killall espeak

echo $1

#__Fonction Synthetisation vocale Google Translate
googleTTS(){
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
		volume=150
	else
		volume=300
	fi

	sudo mplayer -softvol -volume $volume -really-quiet -noconsolecontrols "$url"
}

#__Fonction Synthetisation vocale Espeak
espeakTTS(){
	echo $*
	#shift

	volume=$(cat /sys/class/gpio/gpio13/value)
	if [ $volume -eq 0 ]
	then
		volume=125
	else
		volume=200
	fi
	
	#pitch=40 #0->99
	pitch=$(shuf -i 30-60 -n 1) #0->99
	echo "pitch => $pitch"
	
	#speed=140 #80->450 //175
	speed=$(shuf -i 100-150 -n 1) #80->450 #100-200 #130-150
	echo "speed =>$speed"

	case $1 in
		"en")
			lg="en-uk" ;;
		"it")
			lg="it" ;;
		"es")
			lg="es" ;;
		"de")
			lg="de" ;;
		*)
			lg="fr" ;;
	esac
	shift
	espeak -v $lg -s $speed -p $pitch -a $volume "$*"
}

echo $*

case $1 in
	"googleTTS")
		shift
		googleTTS $* ;;
	"espeakTTS")
		shift
		espeakTTS $* ;;
	*)
		shift
		espeakTTS $* ;;
esac
