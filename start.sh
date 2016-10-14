#!/bin/sh

echo "start.sh -> Start Odi Pgm..."

# sudo node /home/pi/odi/pgm/main.js &
# sudo node /home/pi/odi/pgm/main.js >> /home/pi/odi/log/odi2.log 2>&1 &

# TEST IF TMP DIRECTORY EXISTS
if [ ! -d "$DIRECTORY" ]; then
	mkdir /home/pi/odi/pgm/tmp
fi

sudo node /home/pi/odi/pgm/manager.js 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
# sudo node /home/pi/odi/pgm/main.js 2>&1 | tee -a /home/pi/odi/log/odi2.log &