#!bin/sh

# Init script

# Screen
#sudo /opt/vc/bin/tvservice -p

# Sound
sudo amixer set PCM 100%

# TODO set volume as env variable
echo $VOLUME
VOLUME=100
export VOLUME
echo $VOLUME

# Any problem ? check line ending...