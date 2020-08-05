#!/bin/sh

# Setup script
echo "setup..."

# give odi user's access to needed repositories
sudo chown -R odi /root
sudo chown -R odi /dev/ttyUSB0
echo "odi user granted to needed repositories"

# install mplayer
sudo apt-get install mplayer

# install espeak
sudo apt-get install espeak


# install voices for mbrola
wget http://tcts.fpms.ac.be/synthesis/mbrola/dba/fr1/fr1-990204.zip
sudo unzip fr1-990204.zip -d /opt/mbrola
sudo mkdir -p /usr/share/mbrola/voices/
sudo cp -r /opt/mbrola/fr1/* /usr/share/mbrola/voices/


# wget http://tcts.fpms.ac.be/synthesis/mbrola/bin/raspberri_pi/mbrola.tgz
# tar xvzf mbrola.tgz 
# sudo chmod 755 mbrola
# sudo mv ./mbrola /usr/local/bin/

wget http://steinerdatenbank.de/software/mbrola3.0.1h_armhf.deb
sudo dpkg -i mbrola3.0.1h_armhf.deb
sudo apt-get install mbrola mbrola-fr1 mbrola-fr4

# reset volume
sudo amixer set PCM 100%

# test it !
espeak -s 125 -v mb/mb-fr1 'installation terminée.'