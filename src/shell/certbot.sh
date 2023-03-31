#!/bin/bash

sudo certbot certonly --webroot -w /home/odi/framebot/src/web -d odi.adrigarry.com

cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/odi/framebot/security/cert.pem
cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/odi/framebot/security/key.pem