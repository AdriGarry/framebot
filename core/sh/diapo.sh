#!bin/sh

# Turn screen On
sudo /opt/vc/bin/tvservice -p

display1Photo () {
	path=$(sudo find /home/pi/odi/media/photo -maxdepth 1 -type f | shuf | head -1)
	echo $rdm diapoPhoto: $path
	rdm=$(shuf -i 3-7 -n 1)
	echo $rdm sec
	sudo fbi -a -T 2 $path
	# echo AA $rdm
	sleep $rdm
	#q
	sudo killall fbi
}

play1Video () {
	path=$(sudo find /home/pi/odi/media/video/rdm -maxdepth 1 -type f | shuf | head -1)
	echo $rdm playVideo: $path

	playTimeDecimal=$(mplayer -identify -ao null -vo null -frames 0 $path | grep ^ID_LENGTH= | cut -d = -f 2)
	# echo "playTimeDecimal" $playTimeDecimal
	playTime=${playTimeDecimal%.*}
	echo "playTime" $playTime

	sudo omxplayer -o hdmi --vol 0 --blank --win '0 0 1680 1050' --layer 0 $path &
	# echo BB $playTime
	sleep $playTime
}

while true
do
	rdm=$(shuf -i 0-2 -n 1 )
	if [ $rdm -eq 0 ]
	then
		# echo AA
		play1Video
	else
		# echo BB
		display1Photo
	fi
done