#!bin/sh

# Reset script
# Any problem ? check line ending...
echo 'RESET.SH'

# Sound
sudo amixer set PCM 100%

echo $VOLUME
VOLUME=100
export VOLUME
echo "VOLUME = " $VOLUME

# Screen
sudo /opt/vc/bin/tvservice -p
