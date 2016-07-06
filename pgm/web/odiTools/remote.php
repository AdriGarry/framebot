<?php // Fonction whatsup (getLog & push messages)

whatsup($_POST);
	
function whatsup() {
	$body = file_get_contents('php://input');
	$log = utf8_decode( strip_tags($body) );

	// 1. Recuperation des log
	// 1.1 : on ouvre le fichier
	$fileLog = fopen("odi.log", "w+") or die('fopen failed'); //a+ w+

	// 1.2 : on fera ici nos operations sur le fichier...
	// $log = date("d/m/Y H:i:s")."\n.\n".$log; // Pour ajouter date + .
	fputs($fileLog,$log) or die('fputs failed');

	// 1.3 : quand on a fini de l'utiliser, on ferme le fichier
	fclose($fileLog);
	
	
	// 2. Envoi des messages
	$messages = file_get_contents('messages.txt'); //odiTools/messagesHistory.txt
	$messages = utf8_encode($messages);
	echo $messages;
	//echo "Transfert Log Ok.";
	return true;
}

?>