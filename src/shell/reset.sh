#!bin/sh

# Reset script
# Any problem ? check line ending...
echo 'RESET.SH'

# Deleting log files
sudo rm /home/pi/odi/log/odi.log
sudo rm /home/pi/odi/log/errorHistory.json
sudo rm /home/pi/odi/log/requestHistory.log
sudo rm /home/pi/odi/log/ttsUIHistory.json
sudo rm /home/pi/odi/log/voicemailHistory.json
echo "Log files deleted"

# Cleaning tmp folder
sudo rm -r -f /home/pi/odi/tmp
mkdir /home/pi/odi/tmp
echo "Temp folder cleaned"

# Reset conf file
sudo cp /home/pi/odi/data/defaultConf.json /home/pi/odi/conf.json
sudo chmod 777 /home/pi/odi/conf.json
echo "Conf file reseted"

# Sound
sudo amixer set PCM 100%

# TODO set volume as env variable ?
echo $VOLUME
VOLUME=100
export VOLUME
echo "VOLUME = " $VOLUME

# Screen
sudo /opt/vc/bin/tvservice -p
