#!/bin/sh

clear

ODI_PATH="/home/pi/odi"
echo $ODI_PATH

# Test if log directory exists
if [ ! -d "$ODI_PATH"/log ];
then
	mkdir "$ODI_PATH"/log
	echo "log directory created"
fi

echo "odi.sh -> Starting Wrapper... [$*]" | sudo tee -a "$ODI_PATH/log/odi.log"

# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
sudo node "$ODI_PATH"/src/wrapper.js $* 2>&1 | sudo tee -a "$ODI_PATH/log/odi.log" &

# lxterminal -e tail -f /home/pi/odi/log/odi.log
#tail -f /home/pi/odi/log/odi.log
# gksudo lxterminal --geometry=75*50 -e "tail -f /home/pi/odi/log/odi.log"

