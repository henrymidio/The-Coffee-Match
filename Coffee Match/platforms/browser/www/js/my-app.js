// Initialize app
var myApp = new Framework7({
    statusbarOverlay:false 
});
 
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
 
// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true,
  animateNavBackIcon: true
});  

myApp.onPageInit('passo1', function (page) {
	StatusBar.overlaysWebView(false);	
				
	$$('#next-step').on('click touchstart', function(){
		var convites = $$('#convites').val();
		var mensagens = $$('#mensagens').val();
		var distance = document.getElementById("valBox").html;
		var user_id = localStorage.getItem("user_id");
		setPreferences(distance, convites, mensagens, user_id, function(){
			StatusBar.overlaysWebView(true);
			mainView.router.loadPage('passo2.html');
		})
	})
});	

myApp.onPageInit('passo2', function (page) {
	var picture = localStorage.getItem("picture");
	document.getElementById('picture').src = picture;
	$$("#finalizar").on("click", function(){
		var descricao = $$("#passo2-description").val();
		var profissao = $$("#passo2-profissao").val();
		var faculdade = $$("#passo2-faculdade").val();
		var idade     = $$("#passo2-idade").val();
		
		localStorage.setItem("age", idade);
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		var fbid = localStorage.getItem("fbid");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, idade, faculdade, fbid);
		
		mainView.router.loadPage('index.html');
	})
});

myApp.onPageInit('confirmacao-convite', function (page) {

	var like_id = localStorage.getItem("invite");
	var dadosConfirm = {like_id: like_id};
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-invites.php',
								type: 'post',
								dataType: 'json',
								data: dadosConfirm,
								success: function (data) {
									
									$$("#name-confirm").html(data.name);
									$$("#age-confirm").html(data.age);
									$$("#occupation-confirm").html(data.occupation);
									$$("#pic-confirm").attr("src", data.picture);
									$$("#message").html(data.message);
								}
							});
	
	
	$('#confirmar-cafe').on("click", function(){
		//Faz o PUT LIKE
				var user_id  = localStorage.getItem("user_id");
				var other_id = localStorage.getItem("idc");
				
				var dados = {
					user_id: user_id,
					shown_user_id: other_id,
					liked: 1
				}
				$.ajax({
								url: 'http://thecoffeematch.com/webservice/put-like.php',
								type: 'post',
								data: dados,
								success: function (data) {
											
									mainView.router.loadPage("match.html");
									
								}
								
							});
	})
	
});

myApp.onPageInit('convites', function (page) {
	var user_id = localStorage.getItem("user_id");
	var y = {user_id: user_id};
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-invites.php',
								type: 'post',
								dataType: 'json',
								data: y,
								success: function (data) {
									for(i = 0; i < data.length; i++){
									
									//Seta id da confirmacao-convite
									var idc = localStorage.setItem("idc", data[i].id);
									
									//Monta o DOM
									var line1 = "<li class='swipeout'>"
												+ "<div class='swipeout-content'>"
												+ "<div class='item-content'>"
												+ "<div class='item-media cont'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='confirmacao-convite.html' class='item-link match' id="+data[i].id+">"
												+ "<div class='item-title div-match' id="+data[i].like_id+"><span id='matches-name'>"+data[i].name+"</span><br>"
												+ "<span class='subtitle'>Este convite expira em 3 dias</span>"
												+ "</div>"
												+ "</div>"
												+ "</div>"
												+ "</a>"
												+ "</div>"
												+ "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='swipeout-delete'>Deletar</a>"
												+ "</div>"
												+ "</li>";
														
									$("#invites-li").append(line1);
									
									}
									
									$(".match").on("click touch", function(){
										localStorage.setItem("idc", $(this).attr("id"));		
									})
									$(".div-match").on("click touch", function(){
										localStorage.setItem("invite", $(this).attr("id"));
									})
									
								}
								
								
															
							});
							
});

myApp.onPageInit('combinacoes', function (page) {
	
	var user_id = localStorage.getItem("user_id");
	var x = {user_id: user_id}
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-matches.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {
									
									for(i = 0; i < data.length; i++){
										
										var agendamento = data[i].date;
										if(data[i].date === null){
											agendamento = "Aguardando agendamento";
										} 
										/*
										else {
											agendamento = formatDate(new Date(data[i].date));
										}
										*/
								
										var starbucksLine = "";
															
										if(data[i].starbucks !== null){
											starbucksLine = "<span class='subtitle'>"+data[i].starbucks+"</span><br>";
										}
			
										//Monta o DOM
									    var line1 = "<li class='item-content'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 50px; height: 50px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='opcoes.html' class='item-link match' id="+data[i].id+">"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ starbucksLine
												+ "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/find_coffee_icon.png' />"+agendamento+"</span></div></div></a></li>";		
									    $("#match-li").append(line1);
										
										
									}
									
									
									
									$(".match").on("click", function(){
										localStorage.setItem("match", this.id);
									});
									
								}
															
							});
							
	
});



myApp.onPageInit('profile', function (page) {
	
	$$("#profile-name").html(localStorage.getItem("name"));
	$$("#profile-age").html(localStorage.getItem("age"));
	$$("#description").val(localStorage.getItem("description"));
	$$("#picture").attr("src", localStorage.getItem("picture"));
	$$("#occupation").val(localStorage.getItem("occupation"));
	$$("#graduation").val(localStorage.getItem("college"));
	
	$$("#finalizar-edicao").on("click", function(){
		var descricao = $$("#description").val();
		var profissao = $$("#occupation").val();
		var faculdade = $$("#graduation").val();
		var idade     = localStorage.getItem("age");
		
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		var fbid = localStorage.getItem("fbid");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, idade, faculdade, fbid);
		
		mainView.router.back();
	})
	
	
});


//SHOWN USER
myApp.onPageInit('user', function (page) {
	var suid = localStorage.getItem("shown_user_id");
	var d = {shown_user_id: suid};
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								dataType: 'json',
								data: d,
								success: function (data) {
									
									$$("#nome").html(data[0].name);
									$$("#description").html(data[0].description);
									$$("#idade").html(data[0].age);
									$$("#college").html(data[0].college);
									$$("#occupation").html(data[0].occupation);
									$$("#picture").attr("src", data[0].picture);
									
									//Handler dos amigos em comum
									/*
									var json = JSON.parse(data[0].mutual_friends);
									var context = json.context;
									//alert(context.mutual_friends)
									if(context.mutual_friends){
										//alert(context);
									} 
									*/
								}
							});
	$$('.but-info').on('click', function () {
		myApp.prompt('Sobre o que você quer conversar?', "Coffee Match", function (value) {
		    localStorage.setItem("message", value);
			$("#tinderslide").jTinder('like');
			mainView.router.back();
		});
	});
	$$('.but-nope').on('click', function () {
		$("#tinderslide").jTinder('dislike');
		mainView.router.back();
	});
	$$('.but-yay').on('click', function () {
		$("#tinderslide").jTinder('like');
		mainView.router.back();
	});
});


myApp.onPageInit('settings', function (page) {
	$$('#salvar').on('click', function(){
		var convites = 0;
		if($('#check-convites').is(":checked")){
			var convites = 1;
		};
		var mensagens = 0;
		if($('#check-mensagens').is(":checked")){
			var convites = 1;
		};
		var distance = 4;//document.getElementById("valBox").html;
		var user_id = localStorage.getItem("user_id");
		setPreferences(distance, convites, mensagens, user_id, function(){
			//alert(convites + "-" + mensagens);
			//mainView.router.loadPage('index.html');
		})
	})
});

myApp.onPageInit('chat', function (page) {
	$$("#toolbar").toggleClass("none visivel");
	var user_id = localStorage.getItem("user_id");
	
	var match = localStorage.getItem("match");
	var g = {match: match};
		
	// Handle message
$$('.messagebar').on('click', function () {
	// Init Messages
	var myMessages = myApp.messages('.messages', {
	  autoLayout:true
	});
	
	// Init Messagebar
	var myMessagebar = myApp.messagebar('.messagebar');
  // Message text
  var messageText = myMessagebar.value().trim();
  // Exit if empy message
  if (messageText.length === 0) return;
 
  // Empty messagebar
  myMessagebar.clear()
  
  // Message type
  var messageType = "sent";
  
  myMessages.addMessage({
    // Message text
    text: messageText,
    // Random message type
    type: messageType
  })
  
  //Put message on DB via ajax
  var putMessageData = {
	  user: user_id,
	  message: messageText,
	  combinacao: match
  }
 
	  $.ajax({
									url: 'http://thecoffeematch.com/webservice/put-message.php',
									type: 'post',
									data: putMessageData,
									success: function (data) {
										
									}
		});
 
  
 
	}); 
	
	//Request ajax que recupera a conversa
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-messages.php',
								type: 'post',
								dataType: 'json',
								data: g,
								success: function (data) {
									var user;
									var message_id;
									for(i = 0; i < data.length; i++){
										
										if(data[i].id === user_id){
											var line0 = "<div class='message message-with-avatar message-sent'>"
														+ "<div class='message-text'>"+data[i].message+"</div>"
														+ "<div style='background-image:url("+data[i].picture+")' class='message-avatar'></div>"
														//+ "<div class='message-label'>"+data[i].data+"</div>"
														+ "</div>";
											$(".messages").append(line0);
										} else {
											user = data[i].id;
											
											//Monta o DOM
											var line1 = "<div class='message message-with-avatar message-received' id="+data[i].message_id+">"
															+ "<div class='message-name'>"+data[i].name+"</div>"
															+ "<div class='message-text'>"+data[i].message+"</div>"
															+ "<div style='background-image:url("+data[i].picture+")' class='message-avatar'></div>"
															//+ "<div class='message-label'>"+data[i].data+"</div>"
															+ "</div>";
											$(".messages").append(line1);
										}
									
									}
									
									myInterval = setInterval(function(){ 
										getLastMessage(user, match); 
									}, 3000);
									
								}
	});
	
	
	
	function getLastMessage(user, combinacao){
		var last_message_id = $(".message-received").last().attr("id");
		var lm = {
			  user: user,
			  last_message_id: last_message_id,
			  combinacao: combinacao
		}
		
		$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: lm,
								success: function (data) {
									
									var line1 = "<div class='message message-received' id="+data.message_id+">"
															+ "<div class='message-name'>"+data.name+"</div>"
															+ "<div class='message-text'>"+data.message+"</div>"
															+ "</div>";
											$(".messages").append(line1);
								}
		});
	}
	
});



myApp.onPageBack('chat', function (page) {
	$$("#toolbar").toggleClass("visivel none");
	try {
		clearInterval(myInterval);
	}
	catch(err) {
		
	}
	
});

myApp.onPageInit('match', function (page) {
	var suid = localStorage.getItem("shown_user_id");
	var d = {shown_user_id: suid};
	
	//Ajax request to get user info
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								dataType: 'json',
								data: d,
								success: function (data) {
									
									$$("#user-one-name").html(localStorage.getItem("name"));
									$$("#user-two-name").html(data[0].name);
									$$("#user-one-img").attr("src", localStorage.getItem("picture"));
									$$("#user-two-img").attr("src", data[0].picture);						
								}
							});
});		

myApp.onPageInit('calendario', function(page){
	var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto' , 'Setembro' , 'Outubro', 'Novembro', 'Decembro'];
 
var calendarInline = myApp.calendar({
    container: '#calendar-inline-container',
    value: [new Date()],
    weekHeader: false,
	input: '#picker-data',
    toolbarTemplate: 
        '<div class="toolbar calendar-custom-toolbar">' +
            '<div class="toolbar-inner">' +
                '<div class="left">' +
                    '<p style="color: grey"></p>' +
                '</div>' +
                '<div class="center"></div>' +
                '<div class="right">' +
                    '<p style="color: grey"></p>' +
                '</div>' +
            '</div>' +
        '</div>',
    onOpen: function (p) {
		$$('.calendar-custom-toolbar .left p').text(monthNames[p.currentMonth - 1]);
        $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth]);
		$$('.calendar-custom-toolbar .right p').text(monthNames[p.currentMonth + 1]);
        $$('.calendar-custom-toolbar .left').on('click', function () {
            calendarInline.prevMonth();
        });
        $$('.calendar-custom-toolbar .right').on('click', function () {
            calendarInline.nextMonth();
        });
    },
    onMonthYearChangeStart: function (p) {
		$$('.calendar-custom-toolbar .left p').text(monthNames[p.currentMonth - 1]);
        $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth]);
		$$('.calendar-custom-toolbar .right p').text(monthNames[p.currentMonth + 1]);
    }
}); 

var pickerDescribe = myApp.picker({
    input: '#picker-horario',
    rotateEffect: true,
    cols: [
        {
            textAlign: 'left',
            values: ('00: 01: 02: 03: 04: 05: 06: 07: 08: 09: 10: 11: 12: 13: 14: 15: 16: 17: 18: 19: 20: 21: 22: 23:').split(' ')
        },
        {
            values: ('00 30').split(' ')
        },
    ]
}); 

$$("#confirmar-data").on("click", function(){
	var data    = $$("#picker-data").val();
	var horario = $$("#picker-horario").val();
	var value   = data + " " + horario.replace(/\s/g,'') + ":00";
	var match = localStorage.getItem("match");
	var d2 = {match: match, data: value};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/update-date.php',
								type: 'post',
								data: d2,
								success: function (data) {
									myApp.alert("Horário agendado!", "")					
								}
					});
})

})

//Mudança do slider de distância
function showVal(newVal){
  document.getElementById("valBox").innerHTML=newVal + "km";
}

//Seta preferências
function setPreferences(distance, convites, mensagens, user_id, callback){
	var pref = {distance: distance, convites: convites, mensagens: mensagens, user_id: user_id};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-preferences.php',
								type: 'post',
								dataType: 'json',
								data: pref,
								success: function (data) {
									if(data.status == 1){
										//Atualiza preferências e executa função de callback
										localStorage.setItem("distance", distance);
										callback();
									}
								}
							});
}

/*
function formatDate(date) {
	  var hours = date.getHours();
	  var minutes = date.getMinutes();
	  minutes = minutes < 10 ? '0'+minutes : minutes;
	  var strTime = hours + ':' + minutes;
	  return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + "  " + strTime;
	}
*/

//Seta informações do perfil (somente descrição por enquanto)
function setProfile(description, occupation, age, college, fbid){
	
	var info = {
		description: description, 
		occupation: occupation,
		age: age,
		college: college,
		fbid: fbid
		}
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-profile-info.php',
								type: 'post',
								dataType: 'json',
								data: info,
								success: function (data) {
									alert(data);
									if(data.code == 1){
										
										//Atualiza preferências e executa função de callback
										localStorage.setItem("description", description);
										//myApp.alert("Bem vindo ao Coffee Match!", "");
										//mainView.router.loadPage('index.html');
									}
								},
								error: function (request, status, error) {
									alert(request.responseText);
								}
							});
}


