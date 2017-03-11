#!bin/sh

# Turn screen On
sudo /opt/vc/bin/tvservice -p

diapoPhoto () {
	echo $rdm diapoPhoto: $1
}

playVideo () {
	echo $rdm playVideo: $1

	playTimeDecimal=$(mplayer -identify -ao null -vo null -frames 0 $1 | grep ^ID_LENGTH= | cut -d = -f 2)
	# echo "playTimeDecimal" $playTimeDecimal
	playTime=${playTimeDecimal%.*}
	echo "playTime" $playTime

	sudo omxplayer -o hdmi --vol 0 --blank --win '0 0 1680 1050' $video &
	sleep $playTime

}

rdm=$(shuf -i 0-2 -n 1 )
if [ $rdm -eq 0 ]
then
	# echo AA
	path=$(sudo find /home/pi/odi/media/video/rdm -maxdepth 1 -type f | shuf | head -1)
	playVideo $path
else
	# echo BB
	path=$(sudo find /home/pi/odi/media/photo -maxdepth 1 -type f | shuf | head -1)
	diapoPhoto $path
fi
# echo $path



