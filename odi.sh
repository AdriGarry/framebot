#!/bin/sh

clear

_PATH="/home/pi/odi"
echo $_PATH

# Test if log directory exists
if [ ! -d "$_PATH"/log ];
then
	mkdir "$_PATH"/log
	echo "log directory created"
fi

echo "odi.sh -> Starting Wrapper... [$*]" | sudo tee -a "$_PATH/log/Odi.log"

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/Odi.log &
sudo node "$_PATH"/src/wrapper.js $* 2>&1 | sudo tee -a "$_PATH/log/Odi.log" &

# lxterminal -e tail -f /home/pi/odi/log/Odi.log
#tail -f /home/pi/odi/log/Odi.log
# gksudo lxterminal --geometry=75*50 -e "tail -f /home/pi/odi/log/Odi.log"

