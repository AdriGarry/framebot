#!/bin/sh

echo "start.sh -> Start Odi Pgm..."

# sudo node /home/pi/odi/core/main.js &
# sudo node /home/pi/odi/core/main.js >> /home/pi/odi/log/odi2.log 2>&1 &

tmpDir = "/home/pi/odi/tmp"

# TEST IF TMP DIRECTORY EXISTS
if [ ! -d "/home/pi/odi/tmp" ];
then
	mkdir "/home/pi/odi/tmp"
fi

sudo node /home/pi/odi/core/manager.js 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
# sudo node /home/pi/odi/core/main.js 2>&1 | tee -a /home/pi/odi/log/odi2.log &