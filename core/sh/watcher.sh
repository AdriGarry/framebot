#!/bin/bash

# script:  watch
# url: https://gist.github.com/mikesmullin/6401258
# author:  Mike Smullin <mike@smullindesign.com>
# license: GPLv3
# description:
#   watches the given path for changes
#   and executes a given command when changes occur
# usage:
#   watch <path> <cmd...>
#

path=$1
shift
cmd=$*
sha=0

update_sha(){
	sha=`ls -lR --time-style=full-iso $path | sha1sum`
	# echo sha $sha
}

update_sha
previous_sha=$sha

build(){
	# echo -n "building:\n"
	echo $cmd
	$cmd
	# sh "/home/pi/odi/core/sh/watchAction.sh" updateLastModified
	echo "|--> watcher > resume watching..."
}

compare(){
	update_sha
	if [ "$sha" = "$previous_sha" ]
	then
		echo -n .
	else
		echo "\n|--> watcher > change detected, building:"
		build
		previous_sha=$sha
	fi
}

trap build SIGINT
trap exit SIGQUIT

echo "|--> Press Ctrl+C to force build, Ctrl+\\ to exit."
echo "|--> watching \"$path\"."

while true; do
	compare
	sleep 2
done