#!/bin/bash

echo -e "\n. WAKE UP !\n"

# Set audio output to jack
sudo amixer cset numid=3
sudo node /home/pi/odi/pgm/lib/allLedsOn.js

#sudo omxplayer -o local /home/pi/odi/mp3/sounds/system/mac-startup-sound.mp3
sudo omxplayer -o local /home/pi/odi/mp3/sounds/system/mac-startup-sound2.mp3 | echo ".. mac startup sound 2 [fast]" &

# Get Odi program
sudo sh /home/pi/git.sh update
#	sudo sh /home/pi/odi/pgm/sh/git.sh update
#sudo git clone https://adrigarry:pnal6931@github.com/adrigarry/odi /home/pi/odi/
#sudo git pull https://adrigarry:pnal6931@github.com/adrigarry/odi

#sleep 1

sudo omxplayer -o local /home/pi/odi/mp3/sounds/system/launchingcompleted.mp3 | echo "... launching completed" 
sudo node /home/pi/odi/pgm/lib/allLedsOff.js

sudo node /home/pi/odi/pgm/main.js & - pi
#echo ido | sudo -S su -c 'node odi/pgm/main.js &' - pi
#sudo chmod u+x /home/pi/odi/pgm/main.js

#exit 0
