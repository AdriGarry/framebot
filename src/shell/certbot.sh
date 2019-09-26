#!/bin/sh

#https://certbot.eff.org/lets-encrypt/pip-other

#sudo wget -P /home/odi/core/tmp/ https://dl.eff.org/certbot-auto
#sudo chmod a+x /home/odi/core/tmp/certbot-auto
#sudo /home/odi/core/tmp/certbot-auto certonly --webroot -w /home/odi/core/src/web -d odi.adrigarry.com

sudo ./certbot-auto renew

sudo cp /etc/letsencrypt/live/odi.adrigarry.com/fullchain.pem /home/odi/core/security/cert.pem
sudo cp /etc/letsencrypt/live/odi.adrigarry.com/privkey.pem /home/odi/core/security/key.pem