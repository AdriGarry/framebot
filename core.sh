#!/bin/sh

clear

# copy core shell file to bin to have core command
sudo cp /home/pi/core/data/core /usr/bin/
# ...

echo Launching Core: $*

_NAME=$1
_PATH=`pwd`
echo _PATH $_PATH

#___Intall function
install(){
	echo "installing core..."
	sudo chmod +x "$_PATH"/core.sh
}

if [ $1 = "install" ]; then
	install
	exit 0
fi


# Test if log directory exists
if [ ! -d "$_PATH"/log ];
then
	mkdir "$_PATH"/log
	echo "log directory created"
fi

echo "\nStarting Wrapper... [$*]" | sudo tee -a "$_PATH/log/$_NAME.log"

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/Odi.log &
sudo node "$_PATH"/src/wrapper.js $* 2>&1 | sudo tee -a "$_PATH/log/$_NAME.log" &
