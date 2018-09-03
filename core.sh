#!/bin/sh

clear

echo 'Launching $*'
_NAME = '$1'

_PATH = '$pwd'
echo $_PATH

install(){
	echo "installing core..."
	sudo chmod +x "$_PATH"/core.sh
}

if [ $1 = "install" ]; then
	install;;
	exit 0;;
fi


# Test if log directory exists
if [ ! -d "$_PATH"/log ];
then
	mkdir "$_PATH"/log
	echo "log directory created"
fi

echo "core.sh -> Starting Wrapper... [$*]" | sudo tee -a "$_PATH/log/$_NAME.log"

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/Odi.log &
sudo node "$_PATH"/src/wrapper.js $* 2>&1 | sudo tee -a "$_PATH/log/$_NAME.log" &


#___Fonction silence automatique dans une heure
#if [ $1 = "auto" ]
#then
#	sudo omxplayer -o local --vol 200 /home/pi/odi/media/mp3/system/autoMute.mp3
#fi