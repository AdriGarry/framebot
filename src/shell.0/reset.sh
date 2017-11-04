#!bin/sh

# Reset script
# Any problem ? check line ending...

# Screen
#sudo /opt/vc/bin/tvservice -p

# Sound
sudo amixer set PCM 100%

# TODO set volume as env variable ?
echo $VOLUME
VOLUME=100
export VOLUME
echo "VOLUME = " $VOLUME


#___Fonction ##
initiatialization () {
	echo "Initiatialization..."
	# TODO mplayer, espeak, node_modules, fbi
}


if [ $# -eq 0 ]
	then
	exit
fi

echo "params " $1

if [ $1 = "init" ]
then
	initiatialization
fi