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
  animateNavBackIcon: true,
  preloadPreviousPage: false
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
		
		if (descricao.length == 0) {
			alert("Set description field");
			return false;
		}
		
		if (profissao.length == 0) {
			alert("Set occupation field");
			return false;
		}
		
		if (faculdade.length == 0) {
			alert("Set college field");
			return false;
		}
		
		if (nascimento.length == 0) {
			alert("Set birthday field");
			return false;
		}
		
		$('select option:selected').each(function(){
				tags.push($(this).text());
		});
		tags = tags.join(); 
		
		localStorage.setItem("age", nascimento);
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		var user_id = localStorage.getItem("user_id");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, nascimento, faculdade, tags, user_id);
		
		mainView.router.loadPage('index.html');
	})
	
	var today = new Date();
 
	var pickerInline = myApp.picker({
    input: '#passo2-nascimento',
    toolbar: true,
    rotateEffect: true,
 
    formatValue: function (p, values, displayValues) {
        return displayValues[0] + '-' + values[1] + '-' + values[2];
    },
 
    cols: [
		// Years
        {
            values: (function () {
                var arr = [];
                for (var i = 1950; i <= 1999; i++) { arr.push(i); }
                return arr;
            })(),
			textAlign: 'left'
        },
        // Months
        {
            values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
            displayValues: ('January February March April May June July August September October November December').split(' '),
            textAlign: 'center'
        },
        // Days
        {
            values: [01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
        }
        
    ]
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
									var metrica = localStorage.getItem("metrica");
									metrica = metrica ? metrica : "Km";
									
									var skill1 = data.skill1 ? "<span class='tag'>"+data.skill1+"</span>" : "";
									var skill2 = data.skill2 ? "<span class='tag'>"+data.skill2+"</span>" : "";
									var skill3 = data.skill3 ? "<span class='tag'>"+data.skill3+"</span>" : "";
									var skill4 = data.skill4 ? "<span class='tag'>"+data.skill4+"</span>" : "";
									var skill5 = data.skill5 ? "<span class='tag'>"+data.skill5+"</span>" : "";
									
									$$(".toolbar-image").attr("src", data.picture);
									$$("#name-confirm").html(data.name);
									$$("#invite-age").html(data.age);
									$$("#invite-college").html(data.college);
									$$("#occupation-confirm").html(data.occupation);
									$$("#pic-confirm").attr("src", data.picture);
									$(".skills").append(skill1, skill2, skill3, skill4, skill5);
									$$("#message").html("<b>My message is:</b><br> " + data.message);
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
								dataType: 'json',
								success: function (data) {
							
									localStorage.setItem("match", data.combinacao);
									mainView.router.loadPage("match.html");	
								}
								
							});
	})
	
});

myApp.onPageInit('convites', function (page) {
	var user_id = localStorage.getItem("user_id");
	var y = {user_id: user_id};
	
	//myApp.showPreloader();
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-invites.php',
								type: 'post',
								dataType: 'json',
								data: y,
								success: function (data) {
									if(data == null){
										myApp.hidePreloader();
										return false;
									}
									for(i = 0; i < data.length; i++){
									
									//Seta id da confirmacao-convite
									var idc = localStorage.setItem("idc", data[i].id);
									
									//Monta o DOM
									var line1 = "<li class='swipeout' id='kjk'>"
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
												+ "<a href='#' class='swipeout-delete' id='kjk'>Deletar</a>"
												+ "</div>"
												+ "</li>";
														
									$("#invites-li").append(line1);
									
									}
									
									//Deleta convite
									$('.swipeout-delete').on('click', function () {
									 
									  var inviteId = $(this).parents("li").find("div.div-match").attr("id");										
									
									  var matchToDelete = {
											invite: inviteId
										};
										
										$.ajax({
																	url: 'http://thecoffeematch.com/webservice/delete-invite.php',
																	type: 'post',
																	data: matchToDelete						
										});
										
									});
									
									
									$(".match").on("click touch", function(){
										localStorage.setItem("idc", $(this).attr("id"));		
									})
									$(".div-match").on("click touch", function(){
										localStorage.setItem("invite", $(this).attr("id"));
									})
									
									//myApp.hidePreloader();
									
								}
								
								
															
							});
							
});

myApp.onPageInit('combinacoes', function (page) {
	
	var user_id = localStorage.getItem("user_id");
	var x = {user_id: user_id}
	//myApp.showPreloader();
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
												+ "<div class='item-media profile'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='#' class='item-link match' id="+data[i].id+">"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ starbucksLine
												+ "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/time.png' />"+agendamento+"</span></div></div></a></li>";		
									    $("#match-li").append(line1);
										
										
									}
																	
									$(".match").on("click", function(){
										localStorage.setItem("match", this.id);
										mainView.router.loadPage("detail-calendar.html");
									});
									
									$(".profile").on("click", function(){
										var idp = $(this).attr("id");
										localStorage.setItem("preview", idp);
										mainView.router.loadPage("profile-preview.html");
									});
									
									//myApp.hidePreloader();
									
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
						onClick: function () {
							mainView.router.loadPage("starbucks-proximas.html");
						}
					},
					{
						text: 'Calendar',
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

myApp.onPageInit('profile-preview', function (page) {
	//Preview é o id do usuário que irá ser visualizado
	var preview = localStorage.getItem("preview");
	
	var dado = {
		shown_user_id: preview
	};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								data: dado,
								dataType: 'json',
								success: function (data) {
									
									var skill1 = data[0].skill1 ? "<span class='tag'>"+data[0].skill1+"</span>" : "";
									var skill2 = data[0].skill2 ? "<span class='tag'>"+data[0].skill2+"</span>" : "";
									var skill3 = data[0].skill3 ? "<span class='tag'>"+data[0].skill3+"</span>" : "";
									var skill4 = data[0].skill4 ? "<span class='tag'>"+data[0].skill4+"</span>" : "";
									var skill5 = data[0].skill5 ? "<span class='tag'>"+data[0].skill5+"</span>" : "";
									
									$$("#preview-img").attr("src", data[0].picture);
									$$("#preview-name").html(data[0].name);
									$$("#preview-age").html(data[0].age);
									$$("#preview-occupation").html(data[0].occupation);
									$(".habilidades").append(skill1, skill2, skill3, skill4, skill5);
									$$("#preview-college").html(data[0].college);
									$$("#preview-description").html(data[0].description);
									
								}
								
	});
	
	$("#to-edit-profile").on("click", function(){
		mainView.router.loadPage('profile.html');
	});
	
});

myApp.onPageInit('messages', function (page) {
	
	var user = localStorage.getItem("user_id");
	var x = {user_id: user}
	//myApp.showPreloader();
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {
									
									for(i = 0; i < data.length; i++){
										var replyArrow = "";
										if(data[i].last_message === null){
											data[i].last_message = "Combinado em "+data[i].date;
										}
										
										if(data[i].user == x.user_id) {
											replyArrow = "<img style='width: 12px; height: 12px; margin-right: 5px' src='img/reply-arrow.png' /> "
										}
													
										//Monta o DOM
									    var line1 = "<li class='item-content'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='chat.html' class='item-link chat' id="+data[i].id+">"
												+ "<div class='item-title' style='width: 200px'><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle'>"+replyArrow+data[i].last_message+"</span></div></div></a></li>";		
									    $("#messages-li").append(line1);
																		
										$(".chat").on("click", function(){
											localStorage.setItem("match", this.id);
										});
									}
									
									
									//myApp.hidePreloader();
								},
								error: function (request, status, error) {
									alert(request.responseText);
								}
															
							});
							
	
});



myApp.onPageInit('profile', function (page) {
	
	var user = {
		user: localStorage.getItem("user_id")
	};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-tags.php',
								type: 'post',
								data: user,
								dataType: 'json',
								success: function (data) {
									
									for(i = 1; i < data.length; i++){
										if(data[i].nome == data[0].skill1 || data[i].nome == data[0].skill2 || data[i].nome == data[0].skill3 || data[i].nome == data[0].skill4 || data[i].nome == data[0].skill5){
												myApp.smartSelectAddOption('.smart-select select', "<option selected>"+data[i].nome+"</option>");
										} else {
											myApp.smartSelectAddOption('.smart-select select', "<option>"+data[i].nome+"</option>");
										}
										
									}
								}
	});
	
	$$(".profile-name").html(localStorage.getItem("name") + ", ");
	$$("#profile-age").html(getAge(localStorage.getItem("age")));
	$$("#description").val(localStorage.getItem("description"));
	$$("#picture").attr("src", localStorage.getItem("picture"));
	$$("#occupation").val(localStorage.getItem("occupation"));
	$$("#graduation").val(localStorage.getItem("college"));
	
	$$("#finalizar-edicao").on("click", function(){
		var tags = [];
		var descricao = $$("#description").val();
		var profissao = $$("#occupation").val();
		var faculdade = $$("#graduation").val();
		var idade     = null;
		
		$('select option:selected').each(function(){
			tags.push($(this).text());
		});
		tags = tags.join();
		
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		var user_id = localStorage.getItem("user_id");
		
		
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, idade, faculdade, tags, user_id);
		
		mainView.router.loadPage('index.html');
	})
	
	
});


//SHOWN USER
/*
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
									
								}
							});
	$$('.but-info').on('click', function () {
		myApp.prompt('My coffee message is:', "The Coffee Match", function (value) {
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
*/

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
									$$("#ranger").val(data.distance);									
									if(data.notification_invites == false){
										$('#check-convites').prop('checked', false);
									}
									if(data.notification_emails == false){
										$('#check-emails').prop('checked', false);
									}
									if(data.metrica == 'k'){
										$('#check-km').prop('checked', true);
										$('#check-mile').prop('checked', false);
										$$("#valBox").html(data.distance + " km");
									} else {
										$('#check-km').prop('checked', false);
										$('#check-mile').prop('checked', true);
										$$("#valBox").html(data.distance + "mi")
										//localStorage.setItem("metrica", "Mi");
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
			localStorage.setItem("metrica", "Mi");
		};
		
		var distance = $$("#ranger").val();
		var user_id = localStorage.getItem("user_id");
		setPreferences(metrica, distance, convites, emails, user_id);
		mainView.router.loadPage('starbucks-proximas.html');
	})
});

myApp.onPageInit('chat', function (page) {
	//myApp.showPreloader();
	
	$$("#toolbar").toggleClass("none visivel");
	var user_id = localStorage.getItem("user_id");
	
	var match = localStorage.getItem("match");
		
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
	
	var g = {match: match};
	
	//Request ajax que recupera a conversa
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-messages.php',
								type: 'post',
								dataType: 'json',
								data: g,
								success: function (data) {
									
									var user; //shown_user
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
											if(data[i].id){
											user = data[i].id;
											
											//Monta o DOM
											var line1 = "<div class='message message-with-avatar message-received' id="+data[i].message_id+">"
															+ "<div class='message-name'>"+data[i].name+"</div>"
															+ "<div class='message-text'>"+data[i].message+"</div>"
															+ "<div style='background-image:url("+data[i].picture+")' class='message-avatar'></div>"
															//+ "<div class='message-label'>"+data[i].data+"</div>"
															+ "</div>";
											$(".messages").append(line1);
											} else {
												if(data[0].first_user === user_id){
													user = data[0].sec_user;
												}
											}
										}
										
										//myApp.hidePreloader();
									
									}
								
									$('.messagebar').trigger('click');
																
									myInterval = setInterval(function(){ 
										getLastMessage(user, match); 
									}, 3000);
									
								}
	});
	
	
	
	function getLastMessage(user, combinacao){
		
		var last_message_id = $(".message-received").last().attr("id");
		if(!last_message_id){
			last_message_id = 0;
		}
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
									$('.messagebar').trigger('click');
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
	var suid = localStorage.getItem("idc");
	var d = {shown_user_id: suid};
	
	//Ajax request to get user info
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								dataType: 'json',
								data: d,
								success: function (data) {
								
									$$("#user-one-img").attr("src", localStorage.getItem("picture"));
									$$("#user-two-img").attr("src", data[0].picture);						
								}
							});
	$$("#select-starbucks").on("click", function(){
		mainView.router.loadPage('starbucks-proximas.html');
	})
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
            values: ('01: 02: 03: 04: 05: 06: 07: 08: 09: 10: 11: 12:').split(' ')
        },
        {
            values: ('00 15 30 45').split(' ')
        },
		{
            values: ('AM PM').split(' ')
        },
    ]
}); 

$$("#confirmar-data").on("touchstart click", function(e){
	var data    = $$("#picker-data").val();
	var horario = $$("#picker-horario").val().substring(0,6);
	var complemento = $$("#picker-horario").val().substring(6,9);

	var value  = data + " " + horario.replace(/\s/g,'') + "" + complemento;
	value = convertTo24(value);

	var match = localStorage.getItem("match");
	var d2 = {match: match, data: value};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/update-date.php',
								type: 'post',
								data: d2,
								success: function (data) {
									//myApp.alert("Horário agendado!", "");
									mainView.router.loadPage('combinacoes.html');
									
								}
	});
	e.stopPropagation(); //stops propagation
})

})

//Mudança do slider de distância
function showVal(newVal){
  document.getElementById("valBox").innerHTML=newVal + "km";
}

//Seta preferências
function setPreferences(metrica, distance, convites, emails, user_id){
	//myApp.showPreloader();
	var pref = {metrica: metrica, distance: distance, convites: convites, emails: emails, user_id: user_id};

	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-preferences.php',
								type: 'post',
								data: pref,
								success: function (data) {
										
										//Atualiza preferências e executa função de callback
										localStorage.setItem("distance", distance);
										//myApp.hidePreloader();
										//myApp.alert('Settings updated!', 'The Coffee match');
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

function convertTo24(date){
	var data = new Date(date.replace(/-/g, "/"));
    var ano = data.getFullYear();
	var mes = data.getMonth() + 1;
	var dia = data.getDate();
	var hora = data.getHours();
	var minutos = data.getMinutes();
	
	return ano + "-" + mes + "-" + dia + " " + hora + ":" + minutos + ":00";
}

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

