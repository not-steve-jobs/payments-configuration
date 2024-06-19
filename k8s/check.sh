#!/bin/bash -e

# This script is used in Makefile to check if the application is
# running the correct version

DOMAIN_NAME=$1
VERSION=$2
STATUS_ENDPOINT=${3:-/status}

# Total time that we wait for k8s to update a service is SLEEPTIME * MAXSLEEPS
SLEEPTIME=${4:-5}
MAXSLEEPS=${5:-4}
sleep 1
c=0
until [[ "$(curl -s http://${DOMAIN_NAME}${STATUS_ENDPOINT})" =~ "\"version\":\"${VERSION}" ]]; do
    let ++c
    if [ $c -gt $MAXSLEEPS ]; then
        break
    fi
    printf '.'
    sleep $SLEEPTIME
done

if [ $c -le $MAXSLEEPS ]; then
    echo "Application at $DOMAIN_NAME is running correct version $VERSION"
else
    echo "FATAL: Application at $DOMAIN_NAME is not running correct version $VERSION"
    false
fi
