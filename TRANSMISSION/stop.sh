#!/bin/bash
#
# This should contain necessary code to stop the service

PIDFILE=/var/run/TRANSMISSION.pid
start-stop-daemon --stop --pidfile $PIDFILE --quiet --oknodo
[ -f $PIDFILE ] && rm $PIDFILE
