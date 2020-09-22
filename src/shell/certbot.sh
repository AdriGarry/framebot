#!/bin/sh

#https://certbot.eff.org/lets-encrypt/pip-other

wget -P /home/odi/framebot/tmp/ https://dl.eff.org/certbot-auto
chmod a+x /home/odi/framebot/tmp/certbot-auto
/home/odi/framebot/tmp/certbot-auto certonly --webroot -w /home/odi/framebot/src/web -d odi.adrigarry.com

# ./certbot-auto renew

cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/odi/framebot/security/cert.pem
cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/odi/framebot/security/key.pem