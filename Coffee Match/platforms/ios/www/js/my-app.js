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

myApp.onPageInit('passo2', function (page) {
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-tags.php',
								dataType: 'json',
								success: function (data) {
									for(i = 0; i < data.length; i++){
										myApp.smartSelectAddOption('.smart-select select', "<option>"+data[i].nome+"</option>");
									}
								}
	});
	
	var picture = localStorage.getItem("picture");
	var name    = localStorage.getItem("name");
	document.getElementById('picture').src = picture;
	$$("#passo2-name").html(name);
	
	$$("#finalizar").on("click", function(){
		var tags = [];
		var descricao = $$("#passo2-description").val();
		var profissao = $$("#passo2-profissao").val();
		var faculdade = $$("#passo2-faculdade").val();
		var nascimento = $$("#passo2-nascimento").val();
		
		$('select option:selected').each(function(){
				tags.push($(this).text());
		});
		tags = tags.join(); 
		
		//localStorage.setItem("age", nascimento);
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		var user_id = localStorage.getItem("user_id");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, nascimento, faculdade, tags, user_id);
		
		mainView.router.loadPage('index.html');
	})
	
	var pickerDescribe = myApp.calendar({
		input: '#passo2-nascimento',
		dateFormat: 'yyyy-dd-mm'
	}); 
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
									$$("#age-confirm").html(data.nascimento);
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
												+ "<div class='item-title div-match' id="+data[i].like_id+"><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
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
											starbucksLine = "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/map.png' />"+data[i].starbucks+"</span><br>";
										}
			
										//Monta o DOM
									    var line1 = "<li class='item-link item-content'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='detail-calendar.html' class='item-link match' id="+data[i].id+">"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ starbucksLine
												+ "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/time.png' />"+agendamento+"</span></div></div></a></li>";		
									    $("#match-li").append(line1);
										
										
									}
									
									
									
									$(".match").on("click", function(){
										localStorage.setItem("match", this.id);
									});
									
								}
															
							});
							
	
});

myApp.onPageInit('detail-calendar', function(page){
	
	$$(".btn-pink").on("click", function(){
		mainView.router.loadPage("chat.html");
	});
	
	$$('.edit').on('click', function () {
				
				var buttons1 = [
					{
						text: 'Edit',
						label: true
					},
					{
						text: 'Starbucks',
						bold: true,
						onClick: function () {
							mainView.router.loadPage("starbucks-proximas.html");
						}
					},
					{
						text: 'Calendar',
						bold: true,
						onClick: function () {
							mainView.router.loadPage("calendario.html");
						}
					}
				];
				var buttons2 = [
					{
						text: 'Cancel',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons2];
				myApp.actions(groups);
				
	});
});

myApp.onPageInit('messages', function (page) {
	
	var user = localStorage.getItem("user_id");
	var x = {user_id: user}
	myApp.showPreloader();
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {
									
									for(i = 0; i < data.length; i++){
										
										if(data[i].last_message === null){
											data[i].last_message = "Combinado em "+data[i].date;
										}
													
										//Monta o DOM
									    var line1 = "<li class='item-content'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='chat.html' class='item-link chat' id="+data[i].id+">"
												+ "<div class='item-title' style='width: 200px'><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle'>"+data[i].last_message+"</span></div></div></a></li>";		
									    $("#messages-li").append(line1);
										
										$(".chat").on("click", function(){
											localStorage.setItem("match", this.id);
										});
									}
									myApp.hidePreloader();
								},
								error: function (request, status, error) {
									alert(request.responseText);
								}
															
							});
							
	
});



myApp.onPageInit('profile', function (page) {
	
	$$(".profile-name").html(localStorage.getItem("name") + ", ");
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
		
		var user_id = localStorage.getItem("user_id");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, idade, faculdade, null, user_id);
		
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


myApp.onPageBeforeInit('settings', function (page) {
	
	var uid = localStorage.getItem("user_id");
	var ud = {user_id: uid};
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-preferences.php',
								type: 'post',
								dataType: 'json',
								data: ud,
								success: function (data) {
									
									if(data.notification_invites == false){
										$('#check-convites').prop('checked', false);
									}
									if(data.notification_emails == false){
										$('#check-emails').prop('checked', false);
									}
									if(data.metrica == 'k'){
										$('#check-km').prop('checked', true);
										$('#check-mile').prop('checked', false);
									} else {
										$('#check-km').prop('checked', false);
										$('#check-mile').prop('checked', true);
									}
									
								},
								error: function (request, status, error) {
									alert(error);
								}
	});
	
	$('#check-mile:checkbox').change(function() {
		$('#check-km').prop('checked', false);
	});
	
	$('#check-km:checkbox').change(function() {
		$('#check-mile').prop('checked', false);
	});
	
	$$('#salvar').on('click', function(){
		var convites = 0;
		if($('#check-convites').is(":checked")){
			convites = 1;
		};
		var emails = 0;
		if($('#check-emails').is(":checked")){
			emails= 1;
		};
		var metrica = 'k';
		if($('#check-mile').is(":checked")){
			metrica = 'm';
		};
		
		var distance = document.getElementById("valBox").html;
		var user_id = localStorage.getItem("user_id");
	
		setPreferences(metrica, distance, convites, emails, user_id);
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
  var avatar      = localStorage.getItem("picture");
  
  myMessages.addMessage({
    // Message text
    text: messageText,
    // Random message type
    type: messageType,
	avatar: avatar
  })
  
  //Put message on DB via ajax
  var putMessageData = {
	  user: user_id,
	  message: messageText,
	  combinacao: localStorage.getItem("match")
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
								url: 'http://thecoffeematch.com/webservice/ajax-get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: lm,
								success: function (data) {
									
									var line1 = "<div class='message message-with-avatar message-received' id="+data.message_id+">"
															+ "<div class='message-name'>"+data.name+"</div>"
															+ "<div class='message-text'>"+data.message+"</div>"
															+ "<div style='background-image:url("+data.picture+")' class='message-avatar'></div>"
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
	var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto' , 'Setembro' , 'Outubro', 'Novembro', 'Dezembro'];
 
var calendarInline = myApp.calendar({
    container: '#calendar-inline-container',
    value: [new Date()],
    weekHeader: false,
	input: '#picker-data',
    toolbarTemplate: 
        '<div class="toolbar calendar-custom-toolbar" style="background: #f2efe9">' +
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
function setPreferences(metrica, distance, convites, emails, user_id){
	  myApp.showPreloader();
	var pref = {metrica: metrica, distance: distance, convites: convites, emails: emails, user_id: user_id};

	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-preferences.php',
								type: 'post',
								data: pref,
								success: function (data) {
										
										//Atualiza preferências e executa função de callback
										localStorage.setItem("distance", distance);
										myApp.hidePreloader();
										myApp.alert('Settings updated!', 'The Coffee match');
								}
							});
}

//Seta informações do perfil (somente descrição por enquanto)
function setProfile(description, occupation, nascimento, college, tags, user_id){
	
	var info = {
		description: description, 
		occupation: occupation,
		nascimento: nascimento,
		college: college,
		tags: tags,
		user_id: user_id
		}
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-profile-info.php',
								type: 'post',
								dataType: 'json',
								data: info,
								success: function (data) {
									
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


