//odi.js

/*******************************
* Attributions Fonction jQuery *
*******************************/	
	// $('#focusMessage').focus();
	$('#focusMessage').click(function(){
		setTimeout(function(){
			$('#message').focus();
		}, 1000);
	});
	/*$('.ttsFocus').click(function(){
		$('#message').focus();
	});*/

	/** Abonnement fonction refreshLog */
	$('#log .container').click(function () {
		refreshLog();
	});

	// Affichage telecommande
	$('html#odi footer#footer').click(function () {
		remote();
	});
	if($(location).attr('hash') == '#remote'){
		remote();
	}

	/* Supprime tous les messages de la file */
	$('#remote form#buttons a').click(function () {
		clearQueue();
	});

	/** Attribution des valeurs pour la telecomande (lastTTS) */
	$('html#odi #tts form#buttonsTts button').mousedown(function(){
		var cmd = this.value.trim();
		$('html#odi #tts form#buttonsTts #cmd').val(cmd);
	});
	/** Attribution des valeurs pour la telecomande */
	$('html#odi #remote form#buttons button').mousedown(function(){
		var cmd = this.value.trim();
		$('html#odi #remote form#buttons #cmd').val(cmd);
	});

	// Affichage du lien .toplink
	$('body').append('<a href="#intro" title="Haut de page" class="navlink toplink glyphicon glyphicon-chevron-up"></a>');
	$(window).scroll(function(){  
		var posScroll = $(document).scrollTop();  
		if(posScroll >=400)  
			$('.toplink').fadeIn(600);  
		else  
			$('.toplink').fadeOut(600);  
	});
	
	// smoothScroll
	$('.navlink').click(function(){
		var id = $(this).attr("href");
		var offset = $(id).offset().top
		$('html,body').animate({scrollTop: offset}, 700);
		// return false;
	});

	// réduire Menu sur small device
	$('#divheader a').on('click',function(){
		$('.navbar-collapse.in').collapse('hide');
	})

	// modal pour send command
	$("#modalCommand").modal("show");

setTimeout(function(){
	writeWelcome();
}, 1000);
$('html#odi #intro .jumbotron h1').click(function () {
	writeWelcome();
});

setInterval(function(){ // CHANGER POUR ACTIVER/ANNULER l'interval
	var autoRefresh = $('#log input#switchLog').is(':checked');
	if(autoRefresh){
		refreshLog();
	}
}, 13*1000);


/** Fonction de temoin d'ordre dans la file */
function orderInQueue(){
	var sec = 0;
	var msgWaiting = setInterval(function(){
		var url = 'http://adrigarry.com/odiTools/messages.txt';
		$.ajax({
			url:'http://adrigarry.com/odiTools/messages.txt',
			type:'GET',
			dataType: 'text',
			// async: false,
			success: function(data){
				if(data.indexOf('DOCTYPE') > 0){
					console.log('Msg received... stop msgWaiting()');
					$('body #header').removeClass('orderInQueue');
					$('body #header').find('*').removeClass('orderInQueue');
					clearInterval(msgWaiting);
				}else{
					sec++;
					// console.log(sec);
					if(sec%10 == 0){
						console.log('Loop msgWaiting()... ' + sec/10 + 'sec ' + data);
					}
					$('body #header').addClass('orderInQueue');
					$('body #header').find('*').addClass('orderInQueue');
				}
			}
		});
		console.log(sec)
	}, 50); //100
};
orderInQueue(); // Lancement automatique



/** Fonction de suppression des messages non receptionnes dans la file */
function clearQueue(){
	$.ajax({
		url: 'http://adrigarry.com/odiTools/clearTTS',
		// success: function(odiLog){
		// }
	});
};

/** Fonction d'affichage de texte façon machine a ecrire */
function showText(target, message, index, interval){
	if (index < message.length){
		if('<' == message[index]){
			var htmlTag = '';
			while('>' != message[index]){
				htmlTag = htmlTag + message[index];
				index++;
			}
			htmlTag = htmlTag + message[index];
			index++;
			$(target).append(htmlTag);
		}else{
			$(target).append(message[index++]);
		}
		setTimeout(function(){ showText(target, message, index, interval); }, interval);
	}
}

/** Fonction Welcome (parametre showText) */
function writeWelcome(){
	$('html#odi #intro .jumbotron p').html('');
	var txtWelcome = "I'm a great robot :!<br>Do you want to interact with me ?<hr>And maybe you could help me to assert my dominance on this world...";
	showText("html#odi #intro .jumbotron p", txtWelcome, 0, 70);
}

/** Fonction de remplassement des caracteres speciaux */
function cleanText(){
	var message = document.getElementById('message').value;
	message = message.replace(/[àâ]/g,'a');
	message = message.replace(/[ç]/g,'c');
	message = message.replace(/[èéêë]/g,'e');
	message = message.replace(/[îï]/g,'i');
	message = message.replace(/[ôóö]/g,'o');
	message = message.replace(/[ù]/g,'u');
	document.getElementById("message").value = message;
};

/** Fonction de rafraichissement automatique des logs */
function refreshLog(){
	$('body #header').addClass('refreshLog');
	$('body #header').find('*').addClass('refreshLog');
	$.ajax({
		url: 'http://adrigarry.com/odiTools/odi.log',
		success: function(odiLog){
			setTimeout(function(){
				odiLog = odiLog.replace(/ /g,"&nbsp;");
				odiLog = '<span class="logInfo">' + odiLog;
				odiLog = odiLog.replace(/\n\n/g,'\n');
				odiLog = odiLog.replace(/\n/g,'</span><span>');
				odiLog = odiLog + '</span>';
				$('#odiLog').html(odiLog);
				$('body #switchLog').removeClass('noDisplay');
				$('body #header').removeClass('refreshLog');
				$('body #header').find('*').removeClass('refreshLog');
			}, 400); //300
		}
	});
};

/** Fonction pour afficher la telecommande */
function remote(){
		$('html#odi section#remote').removeClass('noDisplay');
		$(document).scrollTop( $("#remote").offset().top );
};

/** Fonction pour ajouter des parametres aux boutons remote */
function addParamButton(element, txt){
	var timeoutButton;
	$(element).mousedown(function(){
		timeoutButton = setTimeout( function(){
			var param = prompt('Add param to ' + element, txt ? txt : '');
			console.log(element);
				if(param != null){
					var v = $(element).val();
					$(element).val(v + param);
					$(element).addClass('btn-danger');
				}
		}, 1000);
	}).bind('mouseup mouseleave', function(){
		clearTimeout(timeoutButton);
	});
};


/** Fonction pour afficher/masquer la date et l'heure des logs */
/*var hideTimeLog = function(element){
	var timeoutTimeLog;
	$(element).mousedown(function(){
		timeoutTimeLog = setTimeout( function(){
			// var param = prompt('Add param to ' + element);
			alert('showHideTimeLog');
			console.log(element);

			// Enlever 15 premiers caractères
			var log = ($('#odi #odiLog span').html);
			console.log(log);
			log = log.substr(15);
			console.log(log);
			$('#odi #odiLog span').html(log);

		}, 1000);
	}).bind('mouseup mouseleave', function(){
		clearTimeout(timeoutTimeLog);
	});
};*/
