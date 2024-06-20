#!/bin/sh

CONTAINER_ALREADY_STARTED="UP_ONCE"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    mkdir -p certificates
    openssl genrsa -out certificates/key.pem 4096
    openssl rsa -in certificates/key.pem -outform PEM -pubout -out certificates/public.pem
    npm run prepare-application
    npm start
else
    npm start
fi
