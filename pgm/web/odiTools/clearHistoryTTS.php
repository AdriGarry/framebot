<?php // Fonction Clear TTS

//bool unlink('odi/messages.txt');

clearMessagesHistory();

function clearMessagesHistory(){
	$fichier = 'messagesHistory.txt';
	@unlink($fichier);
	//if(file_exists($fichier)) unlink($fichier);		
}

 ?>