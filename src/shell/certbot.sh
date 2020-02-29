#!/bin/sh

#https://certbot.eff.org/lets-encrypt/pip-other

sudo wget -P /home/odi/frameBot/tmp/ https://dl.eff.org/certbot-auto
sudo chmod a+x /home/odi/frameBot/tmp/certbot-auto
sudo /home/odi/frameBot/tmp/certbot-auto certonly --webroot -w /home/odi/frameBot/src/web -d odi.adrigarry.com

# sudo ./certbot-auto renew

sudo cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/odi/frameBot/security/cert.pem
sudo cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/odi/frameBot/security/key.pem