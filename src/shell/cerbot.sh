#!/bin/sh

#https://certbot.eff.org/lets-encrypt/pip-other

sudo wget -P /home/pi/core/tmp/ https://dl.eff.org/certbot-auto

sudo chmod a+x /home/pi/core/tmp/certbot-auto

sudo /home/pi/core/tmp/certbot-auto certonly --webroot -w /home/pi/core/src/web -d odi.adrigarry.com

sudo cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/pi/core/security/cert.pem

sudo cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/pi/core/security/key.pem