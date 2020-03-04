#!/bin/sh

#https://certbot.eff.org/lets-encrypt/pip-other

sudo wget -P /home/odi/framebot/tmp/ https://dl.eff.org/certbot-auto
sudo chmod a+x /home/odi/framebot/tmp/certbot-auto
sudo /home/odi/framebot/tmp/certbot-auto certonly --webroot -w /home/odi/framebot/src/web -d odi.adrigarry.com

# sudo ./certbot-auto renew

sudo cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/odi/framebot/security/cert.pem
sudo cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/odi/framebot/security/key.pem