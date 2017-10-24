#!/bin/sh

    #########################################################
    # Script qui transforme une serie de photos en video    #
    # Sans aucune garantie de l'auteur            #
    #########################################################

# Dépendance zenity, mencoder

#Dialogue choix du type de fichier
ext=`zenity --entry --title="Type d'extention" --text="Ce script se charge d'assembler 
\
toutes les photos d'un même dossier en une vidéo AVI
\\
\

Choisissez le type d'extention des photos
\
\
Exemple: .jpg .bmp etc...
\
Attention à la casse .jpg est different de .JPG" --width="400" --height="450"`
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1
fi

echo "les images sont de type $ext" >>log_output.txt

#Nombre d'images/seconde
ips=`zenity --entry --title="Image/seconde" --text="
\
\
\
\
Les images sont de type  $ext 
\
\

Choisissez le nombre d'images par seconde" --width="400" --height="450"`
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1
fi

echo "$ips images par seconde" >>log_output.txt

#Definition du bitrate
btr=`zenity --scale --width="400" --height="450" --title="Bitrate" --text="Les images sont de type  $ext 
\
\

La vidéo aura $ips images/seconde 
\
\

<b>Definissez le Bitrate de la Video</b> 
\
\

<i>si vous ne savez pas laisser cette valeur</i>" --value="1024" --min-value="1000" --max-value="1800"`
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1
fi

echo "Le bitrate a été défini à $btr" >>log_output.txt


#Selection du dossier source
zenity --info --title="Images à assembler" --text="Les images sont de type  $ext 
\
\

La vidéo aura $ips images/seconde 
\
\

\
\
\
\
Le bitrate a été défini à $btr
\
\
\
\ 
\
Veuillez maitenant sélectionner
\
     le dossier contenant les photos." --width="400" --height="450"
INPUT_DIRECTORY=`zenity --file-selection --directory --title="Fichier"`
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1
fi

#Choix nom de fichier et destination
zenity --info --title="Sortie" --text="Les images sont de type  $ext 
\
\

La vidéo aura $ips images/seconde 
\
\

\
\
\
\
Le bitrate a été défini à $btr
\
\
\
\ 
\
\
\
\
\
Dossier sélectionner:  $INPUT_DIRECTORY
\
\
\
\
\\
<b> Choisissez maintenant le nom de la video à créer.</b>
\
 l'extention (.avi) sera ajouter automatiquement" --width="400" --height="450"
output=`zenity --file-selection --save --file-filter=.avi --confirm-overwrite --title="Enregistrer la cible sous"`
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1

fi
 
zenity --info --title="Images à assembler" --text="Les images sont de type  $ext 
\
\

La vidéo aura $ips images/seconde 
\
\

\
\
\
\
Le bitrate a été défini à $btr
\
\
\
\ 
\
Dossier sélectionner:  $INPUT_DIRECTORY
\
\
\
\
\\
Fichier de sortie   $output.avi" --width="400" --height="450"
if [ $? -ne 0 ]; then
    zenity --error --title="Script terminé" --text="Annulation"
    exit 1

fi

cd $INPUT_DIRECTORY

#Lancement de la commande et affichage de la barre de progression
mencoder mf://*$ext -mf fps=$ips -ovc xvid -xvidencopts bitrate=$btr -o $output.avi |  zenity --progress --title="Progression" --text="Création du Fichier en cours..." 


exit 0
