#!/bin/bash
#
# This should contain necessary code to start the service

export TRANSMISSION_HOME=/c/addons-config/Transmission
export TRANSMISSION_WEB_HOME=/etc/frontview/addons/ui/TRANSMISSION/web
export DOWNLOAD_DIR=/c/media/BitTorrent

ARGS="--foreground"
[ -f /c/addons-config/Transmission/settings.json ] || ARGS="$ARGS --allowed 127.0.0.1,10.0.0.*,192.168.*.* --download-dir $DOWNLOAD_DIR --incomplete-dir $DOWNLOAD_DIR/_incomplete --watch-dir $DOWNLOAD_DIR/_watch --no-watch-dir"
 
start-stop-daemon --start --chuid nobody:nogroup --umask 0 --nicelevel 19 \
     --background --quiet --make-pidfile --pidfile /var/run/TRANSMISSION.pid \
     --exec /etc/frontview/addons/bin/TRANSMISSION/transmission-daemon -- $ARGS
