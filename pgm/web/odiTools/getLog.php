<?php // Fonction GetLog

getLog($_POST);
	
function getLog() {
	// echo "getting log from Odi >  6";
	$body = file_get_contents('php://input');
	$log = utf8_decode( strip_tags($body) );
	// echo "\n<<<<<<<<<<<<<<<<<<<<\n".$log."\n>>>>>>>>>>>>>>>>>>\n";
	
	// 1 : on ouvre le fichier
	$fileLog = fopen("odi.log", "w+") or die('fopen failed'); //a+ w+

	// 2 : on fera ici nos operations sur le fichier...
	$log = date("d/m/Y H:i:s")."\n.\n".$log;
	fputs($fileLog,$log) or die('fputs failed');

	// 3 : quand on a fini de l'utiliser, on ferme le fichier
	fclose($fileLog);
	echo "Transfert Log Ok.";
	return true;
}

?>