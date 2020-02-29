#!bin/sh

# Turn screen On
sudo /opt/vc/bin/tvservice -p

display1Photo () {
	path=$(sudo find /home/odi/frameBot/media/photo -maxdepth 1 -type f | shuf | head -1)
	echo $rdm diapoPhoto: $path
	rdm=$(shuf -i 5-9 -n 1)
	echo $rdm sec
	sudo fbi -a -T 2 $path
	sleep $rdm
	#q
	sudo killall fbi
}

play1Video () {
	path=$(sudo find /home/odi/frameBot/media/video/rdm -maxdepth 1 -type f | shuf | head -1)
	echo $rdm playVideo: $path

	playTimeDecimal=$(mplayer -identify -ao null -vo null -frames 0 $path | grep ^ID_LENGTH= | cut -d = -f 2)
	# echo "playTimeDecimal" $playTimeDecimal
	playTime=${playTimeDecimal%.*}
	echo "playTime" $playTime

	# --win '0 0 1680 1050' // landscape position
	sudo omxplayer -o hdmi --vol 0 --blank --win '0 420 1050 1260' --layer 0 $path &
	sleep $playTime
	#sleep $(( playTime - 1 ))
}

loopForever () {
	echo "loopForever..."
	while true
	do
		#echo operation: $(( 52 - 1 ))
		rdm=$(shuf -i 0-4 -n 1 )
		if [ $rdm -eq 0 ]
		then
			# echo AA
			play1Video
		else
			# echo BB
			display1Photo
		fi
	done
}

echo $1
case $1 in
	"display1Photo")
		display1Photo ;;
	"play1Video")
		play1Video ;;
	*)
		loopForever ;;
esac
