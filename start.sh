#!/bin/sh

echo "start.sh -> Start Odi Pgm..."

tmpDir = "/home/pi/odi/tmp"

# TEST IF TMP DIRECTORY EXISTS
if [ ! -d "/home/pi/odi/tmp" ];
then
	mkdir "/home/pi/odi/tmp"
fi

sudo node /home/pi/odi/core/manager.js 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
