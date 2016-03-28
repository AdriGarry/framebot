#!/bin/sh

echo "start.sh -> Start Odi Pgm..."

# sudo node /home/pi/odi/pgm/main.js &
# sudo node /home/pi/odi/pgm/main.js >> /home/pi/odi/log/odi2.log 2>&1 &

sudo node /home/pi/odi/pgm/manager.js 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
# sudo node /home/pi/odi/pgm/main.js 2>&1 | tee -a /home/pi/odi/log/odi2.log &