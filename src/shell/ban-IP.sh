#!/bin/bash

#___Ban IP

echo 'BanIP.sh script'
echo $*

#TEST REGEX
#if [ $1 == 'auto' ]
#then
	sudo echo $1 >> /home/odi/odi/conf/ip.blacklist
#fi
