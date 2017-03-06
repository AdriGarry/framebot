#!/bin/sh
# Select a random file from many directories
# if (( RANDOM % 2 ));
rdm=$(shuf -i 0-2 -n 1)
echo $rdm
if [ $rdm -eq 0 ]
then
	echo AA
	path=$(sudo find /home/pi/odi/media/video/rdm -maxdepth 1 -type f | shuf | head -1)
else
	echo BB
	path=$(sudo find /home/pi/odi/media/photo -maxdepth 1 -type f | shuf | head -1)
fi
echo $path