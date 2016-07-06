<?php // Fonction Clear TTS

//bool unlink('odi/messages.txt');

clearMessages();

function clearMessages(){
	$fichier = 'messages.txt';
	@unlink($fichier);
	//if(file_exists($fichier)) unlink($fichier);		
}

 ?>