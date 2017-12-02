#!/bin/sh

# Led by shell

#__Function to switch on all leds
allLedsOn(){
	echo "allLedsOn()"
	echo 1 > /sys/class/gpio/gpio14/value
	echo 1 > /sys/class/gpio/gpio14/value
	echo 1 > /sys/class/gpio/gpio14/value
	echo 1 > /sys/class/gpio/gpio14/value
}

#__Function to switch on all leds
allLedsOff(){
	echo "allLedsOff()"
	echo 0 > /sys/class/gpio/gpio14/value
	echo 0 > /sys/class/gpio/gpio15/value
	echo 0 > /sys/class/gpio/gpio17/value
	echo 0 > /sys/class/gpio/gpio23/value
}


echo $1

if [ $1 = "allLedsOn" ]; then
	allLedsOn
elif [ $1 = "allLedsOff" ]; then
	allLedsOff
fi
