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
	dateTime=$(date +"%m-%d-%y_%H.%M.%S")
	logFile=$dateTime"_reset[init].log" #/home/pi/odi/
	sudo touch $logFile
	echo "logFile $logFile created"

	echo "Installing mplayer..."
	sudo apt-get install mplayer 2>&1 | tee -a $logFile

	echo "Installing espeak..."
	#script "ls /" reset.log
	sudo apt-get install espeak 2>&1 | tee -a $logFile


	# TODO mplayer, espeak, node_modules
	# 2>&1 | sudo tee -a
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