#!/bin/sh

# Watch Odi directory for change to set last update date in conf file
# --> To activate only if debug mode ? (not in start script?)

# --> Update last modified date&time
# TODO

# --> Restart Odi Core
sh /home/pi/odi/core/sh/watch.sh /home/pi/odi/core "sudo killall node;sh /home/pi/odi/start.sh &"
sh /home/pi/odi/core/sh/watch.sh /home/pi/odi/web "sudo killall node;sh /home/pi/odi/start.sh &"


