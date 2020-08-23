#!/bin/sh



########################
# RENAME AS install.sh #
########################



# Setup script
echo "setup..."

# create odi user
# operation performed by hand
#sudo adduser odi
#sudo adduser odi sudo
#sudo adduser odi audio

# Run the following command to fix the $HOME directory permissions for the current $USER:
# sudo chown -R $USER:$USER $HOME/

#install npm & nodejs
curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
sudo apt install nodejs

# install mplayer & sound tools
# sudo apt-get install -y mplayer
sudo apt-get install -y mplayer alsa-base alsa-utils pulseaudio mpg123

# set audio output to headphones
amixer cset numid=3 1

# reset volume
sudo amixer set PCM 100%
# amixer sset 'Master' 100%

# install espeak
sudo apt-get install -y espeak

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
sudo apt-get install -y mbrola mbrola-fr1 mbrola-fr4


# install fbi (framebuffer imageviewer: diapo)
sudo apt-get -y install fbi

# give odi user's access to needed repositories
sudo chown -R odi /root
sudo chown -R odi /dev/ttyUSB0
echo "odi user granted to needed repositories"

# test it !
espeak -s 125 -v mb/mb-fr1 'installation terminée.'