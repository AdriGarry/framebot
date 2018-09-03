#!/bin/sh

clear

echo 'Launching $*'
_NAME = '$1'

_PATH = '$pwd'
echo $_PATH

# Test if log directory exists
if [ ! -d "$_PATH"/log ];
then
	mkdir "$_PATH"/log
	echo "log directory created"
fi

echo "core.sh -> Starting Wrapper... [$*]" | sudo tee -a "$_PATH/log/$_NAME.log"

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/Odi.log &
sudo node "$_PATH"/src/wrapper.js $* 2>&1 | sudo tee -a "$_PATH/log/$_NAME.log" &
