#!/bin/bash
# sudo fbi -a -T 2 *.jpg
while true
do
	rdm=$(shuf -i 2-6 -n 1 )
	path=$(sudo find /home/odi/framebot/media/photo -maxdepth 1 -type f | shuf | head -1)
	echo $rdm $path
	sudo fbi -T 2 $path
	sleep $rdm
	q
	#sudo killall fbi
done