#!/bin/sh

clear

ODI_PATH="/home/pi/odi"
echo $ODI_PATH

echo "odi.sh -> Start Odi Pgm... [$*]"


# sudo python /home/pi/odi/core/py/buttons.py 2>&1 | sudo tee -a /home/pi/odi/log/odi.log &
sudo node "$ODI_PATH"/src/launcher.js $* 2>&1 | sudo tee -a "$ODI_PATH/log/odi.log" &

# lxterminal -e tail -f /home/pi/odi/log/odi.log
#tail -f /home/pi/odi/log/odi.log
# gksudo lxterminal --geometry=75*50 -e "tail -f /home/pi/odi/log/odi.log"

