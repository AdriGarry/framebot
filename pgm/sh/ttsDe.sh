#!/bin/bash

sudo killall omxplayer
sudo killall mplayer

echo $*
url="http://translate.google.com/translate_tts?tl=de&client=tw-ob&q=$*"

sudo amixer cset numid=3 1
sudo mplayer -volume 100 -really-quiet -noconsolecontrols "$url"