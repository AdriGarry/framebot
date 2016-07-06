<?php // Fonction TTS

$send = True;

function sendTTS($lgMessage,$message) {
	if (send) {
		if ( isset($_POST['submit']) ) {
			$error = array();
			
			if ( !empty($_POST['lgMessage']) ) {
				$lgMessage = utf8_decode( strip_tags($_POST['lgMessage']) );
			} else {
				$lgMessage = 'cmd';
			}
			
			if ( !empty($_POST['voice']) ) {
				$voice = utf8_decode( strip_tags($_POST['voice']) );
			} else {
				$voice = '';
			}
			
			if ( !empty($_POST['message']) ) {
				$message = utf8_decode( strip_tags($_POST['message']) );
				$cmd = stripos($message, 'cmd;');
				if($cmd !== false){
					$lgMessage = 'cmd';
					$message = str_ireplace('cmd;', '', $message);
				}
			} elseif ( !empty($_POST['cmd']) ) {
				$message = utf8_decode( strip_tags($_POST['cmd']) );
			} else {
				$error['message']="Allez, dis quelque chose !<br>";
			}

			// 1 : on ouvre le fichier
			$file = fopen('odiTools/messages.txt', 'a+');
			$fileHistory = fopen('odiTools/messagesHistory.txt', 'a+');
			//ftruncate($file,0); // pour vider le fichier


			// 2 : on fera ici nos opérations sur le fichier...
			$newMessage = "\r\n".$lgMessage.";".$message.$voice;
			fwrite($file,$newMessage);
			$lgMessage = strtoupper($lgMessage);
			$ip = $_SERVER["REMOTE_ADDR"];
			$newMessage = "\r\n ".date("d-m-Y H:i:s")." - ".$ip." - ".$lgMessage."/ ".$message.$voice;
			fwrite($fileHistory,$newMessage);

			// 3 : quand on a fini de l'utiliser, on ferme le fichier
			fclose($file);
			fclose($fileHistory);
		}
		return true;
	}
	return false;
}
?>