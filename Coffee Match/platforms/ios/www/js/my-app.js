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
  swipeBackPage: false
});  

myApp.onPageInit('login2', function (page) {
	var mySwiper = myApp.swiper('.swiper-container', {
		speed: 400,
		pagination: '.swiper-pagination'
	}); 
});

myApp.onPageInit('address', function (page) {
	StatusBar.overlaysWebView(false);
	
	//Quando o campo cep perde o foco.
            $("#zip").blur(function() {

                //Nova variável "cep" somente com dígitos.
                var cep = $(this).val().replace(/\D/g, '');

                //Verifica se campo cep possui valor informado.
                if (cep != "") {

                    //Expressão regular para validar o CEP.
                    var validacep = /^[0-9]{8}$/;

                    //Valida o formato do CEP.
                    if(validacep.test(cep)) {

                        //Preenche os campos com "..." enquanto consulta webservice.
                        $("#street_address").val("...");
                        $("#user_neighborhood").val("...");
                        $("#user_city").val("...");
                        
						$.ajax({
								url: "https://viacep.com.br/ws/"+ cep +"/json/?callback=?",
								dataType: 'json',
								success: function (data) {
									if (!("erro" in data)) {
										//Atualiza os campos com os valores da consulta.
										$("#street_address").val(data.logradouro);
										$("#user_neighborhood").val(data.bairro);
										$("#user_city").val(data.localidade);
									} //end if.
									else {
										//CEP pesquisado não foi encontrado.
										limpa_formulário_cep();
										alert("CEP não encontrado.");
									}
								},
								error: function (request, status, error) {
									alert(error);
								}
						});
						/*
                        //Consulta o webservice viacep.com.br/
                        $.getJSON("//viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {

                            if (!("erro" in dados)) {
                                //Atualiza os campos com os valores da consulta.
                                $("#street_address").val(dados.logradouro);
								$("#user_neighborhood").val(dados.bairro);
								$("#user_city").val(dados.localidade);
                            } //end if.
                            else {
                                //CEP pesquisado não foi encontrado.
                                limpa_formulário_cep();
                                alert("CEP não encontrado.");
                            }
                        });
						*/
                    } //end if.
                    else {
                        //cep é inválido.
                        limpa_formulário_cep();
                        alert("Formato de CEP inválido.");
                    }
                } //end if.
                else {
                    //cep sem valor, limpa formulário.
                    limpa_formulário_cep();
                }
            });
	
	$$("#submit-address").on("click", function(){
		var number = $$("#street_number").val();
		var street = $$("#street_address").val();
		var city   = $$("#user_city").val();
		var neighborhood = $$("#user_neighborhood").val();
		var zip    = $$("#zip").val();
		var user_id = localStorage.getItem("user_id");
		var address_data = {
			number: number,
			street: street,
			city: city,
			neighborhood: neighborhood,
			cep: zip,
			user: user_id
		}
		$.ajax({
								url: 'http://thecoffeematch.com/webservice/save-address-user.php?user=',
								type: 'post',
								data: address_data,
								success: function (data) {
									myApp.alert('You will receive a Starbucks Gift Card at your house!', 'Congratulations!', function () {
										mainView.router.loadPage('index.html');
									});
								}
		});
	}) 
	
	function limpa_formulário_cep() {
                // Limpa valores do formulário de cep.
                $("#street_address").val("");
                $("#user_neighborhood").val("");
                $("#user_city").val("");
            }
});

myApp.onPageInit('passo2', function (page) {
	
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-tags.php',
								dataType: 'json',
								success: function (data) {
									for(i = 0; i < data.length; i++){
										myApp.smartSelectAddOption('#skills select', "<option>"+data[i].nome+"</option>");
									}
								}
	});
	
	var birthday = localStorage.getItem("birthday");
	var picture = localStorage.getItem("picture");
	var name    = localStorage.getItem("name");
	var work = localStorage.getItem("occupation");
	var education = localStorage.getItem("college");
	document.getElementById('picture').src = picture;
	$$("#passo2-name").html(name);
	$$("#passo2-profissao").val(work);
	$$("#passo2-faculdade").val(education);
	$$("#passo2-nascimento").val(birthday);
	
	$("#call-smart-select").on("click", function(){
		myApp.smartSelectOpen("#skills")
	});
	$("#call-smart-select2").on("click", function(){
		myApp.smartSelectOpen("#looking-for")
	});
	
	$$("#finalizar").on("click", function(){
		
		var tags = [];
		var looking = [];
		var descricao = $$("#passo2-description").val();
		var profissao = $$("#passo2-profissao").val();
		var faculdade = $$("#passo2-faculdade").val();
		var nascimento = $$("#passo2-nascimento").val();
		
		if (faculdade.length < 3) {
			document.getElementById("passo2-faculdade").focus();
			return false;
		}
		
		if (profissao.length < 3) {
			document.getElementById("passo2-profissao").focus();
			return false;
		}
		
		if (nascimento.length == 0) {
			document.getElementById("passo2-nascimento").focus();
			return false;
		}
		
		myApp.showIndicator();
		
		$('#skills select option:selected').each(function(){
				tags.push($(this).text());
		});
		
		var skills = tags.join(); 
		
		$('#looking-for select option:selected').each(function(){
				looking.push($(this).text());
		});
		looking = looking.join(); 
		
		localStorage.setItem("age", nascimento);
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		//var user_id = localStorage.getItem("user_id");
		
		//Chamada o servidor para cadastro/atualização de informações de perfil
		var userObj = {
			fbid: localStorage.getItem("fbid"),
			fb_token: localStorage.getItem("access_token"),
			notification_key: localStorage.getItem("notification_key"),
			name: localStorage.getItem("name"),
			gender: localStorage.getItem("gender"),
			email: localStorage.getItem("email"),
			picture: localStorage.getItem("picture"),
			nascimento: nascimento,
			description: descricao,
			occupation: profissao,
			college: faculdade,
			skills: skills,
			looking: looking
		}
		
		$.ajax({
			url: 'http://api.thecoffeematch.com/v1/users',
			type: 'post',
			dataType: 'json',
			data: userObj, 
			success: function(response) {
				localStorage.setItem("user_id", response.data.id);
				localStorage.setItem("logged", 1);
				myApp.hideIndicator();
				mainView.router.loadPage("index.html");
			},
			error: function (request, status, error) {
				myApp.hideIndicator();
				myApp.alert(error, "The Coffee Match");
				mainView.router.loadPage("login.html");
			}
		});
		
		
	});
	
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

	var user_id  = localStorage.getItem("user_id");
	var other_id = localStorage.getItem("idc");
	
	var requester = {
		requester: user_id
	}
		
	//Ajax request to get user
	$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users/' + other_id,
								type: 'get',
								dataType: 'json',
								data: requester,
								success: function (data) {
									$.ajax({
										url: "https://graph.facebook.com/v2.9/" + localStorage.getItem("fbid") + "?fields=context{all_mutual_friends.fields(picture.width(90).height(90), name).limit(5)}&access_token=" + data.fb_token + "&appsecret_proof=" + data.appsecret,
										type: 'get',
										dataType: 'json',
										success: function (friendsData) {
											var loops = friendsData.context.all_mutual_friends.data.length;
											var friends_number = friendsData.context.all_mutual_friends.summary.total_count;
																						
											for(i = 0; i < loops; i++){
												var line = '<div class="col-33"><img src="'+friendsData.context.all_mutual_friends.data[i].picture.data.url+'" /><br><span>'+ friendsData.context.all_mutual_friends.data[i].name +'</span></div>';
												$("#confirmacao-friends-list").append(line);
											}
											
											if(friends_number > 5){
												var line = '<div class="col-33" style="position: relative"><img src="img/more-friends.png" /><div class="more color-white">+'+(friends_number - 5)+ '</div></div>';
												$("#confirmacao-friends-list").append(line);
											} else {
												var line = '<div class="col-33"></div>';
												$("#confirmacao-friends-list").append(line);
											}
											
											
										},error: function (request, status, error) {
											//alert(JSON.stringify(request));
										}
									});
									
									var metrica = localStorage.getItem("metrica");
									metrica = metrica ? metrica : "Km";
									
									var skill1 = data.skill1 ? "<span class='tag'>"+data.skill1+"</span>" : "";
									var skill2 = data.skill2 ? "<span class='tag'>"+data.skill2+"</span>" : "";
									var skill3 = data.skill3 ? "<span class='tag'>"+data.skill3+"</span>" : "";
									
									var message = "Hey! It seems we have similar interests. Let's have a coffee at Starbucks?!";
									if(data.id == 193) {
										message = "Hi, I am Nicolas Romano, CEO of The Coffee Match, and it would be a pleasure to have a coffee with you at Starbucks, my treat! So, feel free to schedule our coffee meeting. I am sure this new connection will be amazing! Onward!";
									}
									
									$$("#name-confirm").html(data.name);
									$$("#cc-distance").html(data.distance);
									$$("#cc-metrica").html(metrica);
									$$("#invite-age").html(data.age);
									$$("#invite-college").html(data.college);
									$$("#description-confirm").html(data.description);
									$$("#occupation-confirm").html(data.occupation);
									$$("#pic-confirm").attr("src", data.picture);
									$(".skills").append(skill1, skill2, skill3);
									$$("#message").html(message);
									$$("#cc-l1").html('<span style="margin-right: 10px">●</span>' + data.l1);
									$$("#cc-l2").html('<span style="margin-right: 10px">●</span>' + data.l2);
									$$("#cc-l3").html('<span style="margin-right: 10px">●</span>' + data.l3);
								}
							});
	
	
	$('#confirmar-cafe').on("click", function(){
		myApp.showIndicator()
		//Faz o PUT LIKE
		
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
									myApp.hideIndicator();
									localStorage.setItem("match", data.combinacao);
									mainView.router.loadPage("match.html");	
								},
								error: function (request, status, error) {
									myApp.hideIndicator();
									mainView.router.loadPage("combinacoes.html");	
									//alert(error);
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
										//myApp.hidePreloader();
										return false;
									}
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
												+ "<span class='subtitle'>This invitation expires soon!</span>"
												+ "</div>"
												+ "</div>"
												+ "</div>"
												+ "</a>"
												+ "</div>"
												+ "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='bg-red del-invite'>Delete</a>"
												+ "</div>"
												+ "</li>";
														
									$("#invites-li").append(line1);
									
									}
									
									//Deleta convite
									$('.del-invite').on('click', function () {
										var self   = $(this);
										var inviteId = self.parents("li").find("div.div-match").attr("id");
										var swipeout = self.closest(".swipeout");
										myApp.confirm("Are you sure?", "The Coffee Match", function(){										
											myApp.swipeoutDelete(swipeout, function() {
												var matchToDelete = {
													invite: inviteId
												};
												
												$.ajax({
													url: 'http://thecoffeematch.com/webservice/delete-invite.php',
													type: 'post',
													data: matchToDelete						
												});
											});	
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

myApp.onPageInit('favorites', function (page) {
					
	var user_id = localStorage.getItem("user_id");
	var x = {user_id: user_id}
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-favorites.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {
									
									for(i = 0; i < data.length; i++){
										
										//Monta o DOM
									    var line1 = "<li class='item-link item-content'>"
												+ "<div class='item-media profile'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner fav' id="+data[i].shown_user_id+">"
												+ "<a href='#' class='item-link'>"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle'>Favorited in "+data[i].date+"</span></div></div></a></li>";		
									    $("#favorites-ul").append(line1);
										
										
									}
									
									$(".fav").on("click", function(){
										var idp = $(this).attr("id");
										localStorage.setItem("preview", idp);
										mainView.router.loadPage("profile-view.html");
									});
								},
								error: function (request, status, error) {
									alert(error);
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
											agendamento = "Waiting to schedule";
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
									    var line1 = "<li class='item-content swipeout'>"
												+ "<div class='item-media profile swipeout' id="+data[i].preview_id+">"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner match' id="+data[i].id+">"
												+ "<a href='#' class='item-link'>"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ starbucksLine
												+ "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/time.png' />"+agendamento+"</span></div></div></a>"
												+ "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='bg-red unmatch'>Unmatch</a>"
												+ "</div>"
												+"</li>";		
									    $("#match-li").append(line1);
										
										
									}
																	
									$(".match").on("click", function(){
										localStorage.setItem("match", this.id);
										mainView.router.loadPage("detail-calendar.html");
									});
									
									$(".profile").on("click", function(){
										var idp = $(this).attr("id");
										localStorage.setItem("shown_user_id", idp);
										mainView.router.loadPage("user.html");
									});
																		
									$(".unmatch").on("click", function(){
										var self   = $(this);
										var idMatch = self.parent().siblings(".match").attr("id");
										var swipeout = self.closest(".swipeout");
										
										myApp.confirm("You will no longer be able to talk", "Are you sure?", function(){
											myApp.swipeoutDelete(swipeout, function() {
												var abc = {
													match: idMatch
												};
												$.ajax({
													url: 'http://thecoffeematch.com/webservice/unmatch.php',
													type: 'post',
													data: abc
												});
											});
											
										});
										
									});
									/*
									$$('.swipeout').on('swipeout:delete', function () {
										myApp.alert("Are you sure?", "The Coffee Match", function(){
											var idp = $(".match").attr("id");
											var abc = {
												match: idp
											};
											$.ajax({
												url: 'http://thecoffeematch.com/webservice/unmatch.php',
												type: 'post',
												data: abc
											});
										});
									});
									
									$(".unmatch").on("click", function(event){
										myApp.alert("Are you sure?", "The Coffee Match", function(){
											var idp = $(".match").attr("id");
											var abc = {
												match: idp
											};
											$.ajax({
												url: 'http://thecoffeematch.com/webservice/unmatch.php',
												type: 'post',
												data: abc
											});
										});
										
									});
									*/
									
									
									
								}
															
							});
							
	
});

myApp.onPageInit('detail-calendar', function(page){
	
	$$(".btn-green").on("click", function(){
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
	var metrica = localStorage.getItem("metrica");
	$$("#preview-metrica").html(metrica);
	
	var user_id = localStorage.getItem("user_id");
	
	$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users/' + user_id,
								type: 'get',
								dataType: 'json',
								success: function (data) {
									
									var skill1 = data.skill1 ? "<span class='tag'>"+data.skill1+"</span>" : "";
									var skill2 = data.skill2 ? "<span class='tag'>"+data.skill2+"</span>" : "";
									var skill3 = data.skill3 ? "<span class='tag'>"+data.skill3+"</span>" : "";
									
									$$("#preview-img").attr("src", data.picture);
									$$("#preview-name").html(data.name);
									$$("#preview-age").html(data.age);
									$$("#preview-occupation").html(data.occupation);
									$(".habilidades").append(skill1, skill2, skill3);
									$$("#preview-college").html(data.college);
									$$("#preview-description").html(data.description);
									$$("#profile-l1").html('<span style="margin-right: 10px">●</span>' + data.l1);
									$$("#profile-l2").html('<span style="margin-right: 10px">●</span>' + data.l2);
									$$("#profile-l3").html('<span style="margin-right: 10px">●</span>' + data.l3);
									
								}
								
	});
	
	$("#to-edit-profile").on("click", function(){
		mainView.router.loadPage('profile.html');
	});
	
});

myApp.onPageInit('profile-view', function (page) {
	var metrica = localStorage.getItem("metrica");
	$$("#view-metrica").html(metrica);
	
	//Preview é o id do usuário que irá ser visualizado
	var preview = localStorage.getItem("preview");
	
	$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users/' + preview,
								type: 'get',
								dataType: 'json',
								success: function (data) {
									
									var skill1 = data.skill1 ? "<span class='tag'>"+data.skill1+"</span>" : "";
									var skill2 = data.skill2 ? "<span class='tag'>"+data.skill2+"</span>" : "";
									var skill3 = data.skill3 ? "<span class='tag'>"+data.skill3+"</span>" : "";
									
									var l1 = data.l1 ? '<span style="margin-right: 10px">●</span>' + data.l1 : "";
									var l2 = data.l2 ? '<span style="margin-right: 10px">●</span>' + data.l2 : "";
									var l3 = data.l3 ? '<span style="margin-right: 10px">●</span>' + data.l3 : "";
									
									$$("#view-distance").html(data.distance);
									$$("#profile-view-img").attr("src", data.picture);
									$$("#profile-view-name").html(data.name);
									$$("#profile-view-age").html(data.age);
									$$("#profile-view-occupation").html(data.occupation);
									$(".sks").append(skill1, skill2, skill3);
									$$("#profile-view-college").html(data.college);
									$$("#profile-view-description").html(data.description);
									$$("#view-l1").html(l1);
									$$("#view-l2").html(l2);
									$$("#view-l3").html(l3);
									
								}
								
	});
	
		$$('.nope').on('click', function () {
			var abc = {
				user_id: localStorage.getItem("user_id"),
				shown_user_id: preview,
				liked: 0
			}
			$.ajax({
									url: 'http://thecoffeematch.com/webservice/update-like.php',
									type: 'post',
									data: abc
			});
			
			 myApp.addNotification({
				title: 'The Coffee Match',
				subtitle: 'Your invite is on its way!',
				media: '<img width="44" height="44" style="border-radius:100%" src="img/logotipo.png">',
				onClose: function () {
					mainView.router.loadPage('favorites.html');
				}
			});
			
		});
		$$('.yep').on('click', function () {
			var abc = {
				user_id: localStorage.getItem("user_id"),
				shown_user_id: preview,
				liked: 1
			}
			$.ajax({
									url: 'http://thecoffeematch.com/webservice/update-like.php',
									type: 'post',
									data: abc,
									success: function (data) {
											if(data === "match"){
												myApp.addNotification({
													title: 'The Coffee Match',
													subtitle: "WOW... it's a Coffee Match! Check it out!",
													media: '<img width="44" height="44" style="border-radius:100%" src="img/logotipo.png">',
													onClose: function () {
														mainView.router.loadPage('combinacoes.html');
													}
												});
											} else {
												myApp.addNotification({
													title: 'The Coffee Match',
													subtitle: 'Your invite is on its way!',
													media: '<img width="44" height="44" style="border-radius:100%" src="img/logotipo.png">',
													onClose: function () {
														mainView.router.loadPage('favorites.html');
													}
												});
											}
									}
			});
			
			
		});
	
});

myApp.onPageInit('messages', function (page) {
	
	var user = localStorage.getItem("user_id");
	var x = {user_id: user}
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {
									
									for(i = 0; i < data.length; i++){
										var replyArrow = "";
										var weight = "bold";
										if(data[i].last_message === null){
											data[i].last_message = "Matched in "+data[i].date;
										}
										
										if(data[i].user == x.user_id) {
											replyArrow = "<img style='width: 12px; height: 12px; margin-right: 5px' src='img/reply-arrow.png' /> ";
											weight = "";
										}
													
										//Monta o DOM
									    var line1 = "<li class='item-content'>"
												+ "<div class='item-media perfil' id="+data[i].suid+">"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='chat.html' class='item-link chat' id="+data[i].id+">"
												+ "<div class='item-title' style='width: 200px'><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle " + weight + "'>"+replyArrow+data[i].last_message+"</span></div></div></a></li>";		
									    $("#messages-li").append(line1);
																		
										$(".chat").on("click", function(){
											localStorage.setItem("match", this.id);
										});
										
										$(".perfil").on("click", function(){
											var idp = $(this).attr("id");
											localStorage.setItem("shown_user_id", idp);
											mainView.router.loadPage("user.html");
										});
									}
									
								},
								error: function (request, status, error) {
									alert(request.responseText);
								}
															
							});
				
	
});


myApp.onPageInit('profile', function (page) {
	
	$("a.close-popup").on("click touchstart", function(event){
		alert("close")
	});
	
	$(".cms").on("click touchstart", function(event){
		myApp.smartSelectOpen("#skills")
	});
	$(".cms2").on("click touchstart", function(event){
		myApp.smartSelectOpen("#looking-for")
	});
	
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
										if(data[i].nome === data[0].skill1 || data[i].nome === data[0].skill2 || data[i].nome === data[0].skill3){
												myApp.smartSelectAddOption('#skills select', "<option selected>"+data[i].nome+"</option>");
										} else {
											if (typeof data[i].nome === 'undefined'){
												//Não faz nada
											}else {
												myApp.smartSelectAddOption('#skills select', "<option>"+data[i].nome+"</option>");
											}
											
										}
									}
									/*
										INSERIR CONDIÇÃO PARA VERIFICAR SE OS LOOKING-FOR ESTÃO SETADOS
									*/
									if(data[1].l1.length > 0){ $("#looking-for select option:contains("+data[1].l1+")").prop('selected', true) }
									if(data[1].l2.length > 0){ $("#looking-for select option:contains("+data[1].l2+")").prop('selected', true) }
									if(data[1].l3.length > 0){ $("#looking-for select option:contains("+data[1].l3+")").prop('selected', true) }
									
									//$("#looking-for .item-after").text(data[1].l1 + ", " + data[1].l2 + ", " + data[1].l3);
									
									//$("#call-smart-select").val(data[0].skill1 + ", " + data[0].skill2 + ", " + data[0].skill3)
									//$("#call-smart-select2").val(data[1].l1 + ", " + data[1].l2 + ", " + data[1].l3)
								}
	});
	var birthday = localStorage.getItem("age");
	var age = getAge(birthday);
	$$(".profile-name").html(localStorage.getItem("name") + ", ");
	$$("#profile-age").html(age);
	$$("#description").val(localStorage.getItem("description"));
	$$("#picture").attr("src", localStorage.getItem("picture"));
	$$("#occupation").val(localStorage.getItem("occupation"));
	$$("#graduation").val(localStorage.getItem("college"));
	
	$$("#finalizar-edicao").on("click", function(){
		var tags = [];
		var looking = [];
		var descricao = $$("#description").val();
		var profissao = $$("#occupation").val();
		var faculdade = $$("#graduation").val();
		var idade     = null;
		
		if (profissao.length == 0) {
			document.getElementById("occupation").focus();
			return false;
		}
		
		if (faculdade.length == 0) {
			document.getElementById("graduation").focus();
			return false;
		}
		
		$('#skills select option:selected').each(function(){
			tags.push($(this).text());
		});
		tags = tags.join();
		
		$('#looking-for select option:selected').each(function(){
				looking.push($(this).text());
		});
		looking = looking.join(); 
		
		var user_id = localStorage.getItem("user_id");
		//Chamada ao servidor para atualização de informações de perfil
		setProfile(descricao, profissao, idade, faculdade, tags, looking, user_id);
		
		localStorage.setItem("description", descricao);
		localStorage.setItem("occupation", profissao);
		localStorage.setItem("college", faculdade);
		
		//Para dar tempo de atuaizar antes de exibir novamete o preview do perfil
		setTimeout(function(){ mainView.router.loadPage('profile-preview.html'); }, 1000);
		
	})
	
	
	
});


//SHOWN USER

myApp.onPageInit('user', function (page) {
	
	var metrica = localStorage.getItem("metrica");
	$$("#user-metrica").html(metrica);
	
	var suid = localStorage.getItem("shown_user_id");
	var user_id = localStorage.getItem("user_id");	
	
	var requesterObj = {
		requester: user_id
	};
	
	$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users/' + suid,
								type: 'get',
								data: requesterObj,
								dataType: 'json',
								success: function (data) {
									
									$.ajax({
										url: "https://graph.facebook.com/v2.9/" + localStorage.getItem("fbid") + "?fields=context{all_mutual_friends.fields(picture.width(90).height(90), name).limit(5)}&access_token=" + data.fb_token + "&appsecret_proof=" + data.appsecret,
										type: 'get',
										dataType: 'json',
										success: function (friendsData) {
											var loops = friendsData.context.all_mutual_friends.data.length;
											var friends_number = friendsData.context.all_mutual_friends.summary.total_count;
																						
											for(i = 0; i < loops; i++){
												var line = '<div class="col-33"><img src="'+friendsData.context.all_mutual_friends.data[i].picture.data.url+'" /><br><span>'+ friendsData.context.all_mutual_friends.data[i].name +'</span></div>';
												$("#friends-list").append(line);
											}
											
											if(friends_number > 5){
												var line = '<div class="col-33" style="position: relative"><img src="img/more-friends.png" /><div class="more color-white">+'+(friends_number - 5)+ '</div></div>';
												$("#friends-list").append(line);
											} else {
												var line = '<div class="col-33"></div>';
												$("#friends-list").append(line);
											}
											
											
										},error: function (request, status, error) {
											//alert(JSON.stringify(request));
										}
									});
																		
									var skill1 = data.skill1 ? "<span class='tag'>"+data.skill1+"</span>" : "";
									var skill2 = data.skill2 ? "<span class='tag'>"+data.skill2+"</span>" : "";
									var skill3 = data.skill3 ? "<span class='tag'>"+data.skill3+"</span>" : "";
									
									var l1 = data.l1 ? '<span style="margin-right: 10px">●</span>' + data.l1 : "";
									var l2 = data.l2 ? '<span style="margin-right: 10px">●</span>' + data.l2 : "";
									var l3 = data.l3 ? '<span style="margin-right: 10px">●</span>' + data.l3 : "";
									
									if(data.distance < 1) {
											data.distance = 0.5;
									}
									
									$$("#user-distance").html(data.distance);
									$$("#user-view-img").attr("src", data.picture);
									$$("#user-view-name").html(data.name);
									$$("#user-view-age").html(data.age);
									$$("#user-view-occupation").html(data.occupation);
									$(".skss").append(skill1, skill2, skill3);
									$$("#user-view-college").html(data.college);
									$$("#user-view-description").html(data.description);
									$$("#l1").html(l1);
									$$("#l2").html(l2);
									$$("#l3").html(l3);
									
								}
								
	});
	
	$$('#report').on('click', function () {
				
				var buttons1 = [
					{
						text: 'Report',
						onClick: function () {
							myApp.prompt("For what reason?", "The Coffee Match", function(value){
								var dataReport = {
									user_id: suid,
									reason: value
								}
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/phpmailer/report.php',
										type: 'post',
										data: dataReport,
										success: function(data){
											myApp.alert("User has been reported", "Thank you", function(){
												mainView.router.back();
											})
										},error: function (request, status, error) {
											myApp.alert("User has been reported", "Thank you", function(){
												mainView.router.back();
											})
										}
								});
								
							})
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


myApp.onPageBeforeInit('settings', function (page) {
	
	var uid = localStorage.getItem("user_id");
	var ud = {user_id: uid};
	var dst = null;
	
	$$('#delete-account').on('click', function(){
		myApp.confirm("You will lose all its data", "Are you sure you want to delete your profile?", function(){
			myApp.showIndicator()
			$.ajax({
				url: 'http://thecoffeematch.com/webservice/delete-user.php',
				type: 'post',
				data: ud,
				success: function (data) {
					//Anula variável logged	e envia email avisando da exclusão	
					localStorage.removeItem("logged");
					myApp.hideIndicator()
					mainView.router.loadPage('login2.html');
				},error: function (request, status, error) {
					myApp.hideIndicator()
					alert("Error");
				}
			});
		});
	})
	
	//Ajax request to get user
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-preferences.php',
								type: 'post',
								dataType: 'json',
								data: ud,
								success: function (data) {
									$$("#ranger").val(data.distance);
									dst = data.distance;
									localStorage.setItem("distance", data.distance);
									if(data.notification_invites == false){
										$('#check-convites').prop('checked', false);
									}
									if(data.notification_emails == false){
										$('#check-emails').prop('checked', false);
									}
									if(data.metrica == 'k'){
										$('#check-km').prop('checked', true);
										$('#check-mile').prop('checked', false);
										$$("#valBox").html(data.distance + " Km");
									} else {
										$('#check-km').prop('checked', false);
										$('#check-mile').prop('checked', true);
										$$("#valBox").html(data.distance + " Mi")
									}
									
								},
								error: function (request, status, error) {
									alert(error);
								}
	});
	
	$('#check-mile:checkbox').change(function() {
		if($(this).is(":checked")) {
			$('#check-km').prop('checked', false);
			$$("#valBox").html(dst + " Mi");
			localStorage.setItem("medida", "Mi")
		} else {
			$('#check-km').prop('checked', true);
			$$("#valBox").html(dst + " km");
			localStorage.setItem("medida", "Km")
		}
	});
	
	$('#check-km:checkbox').change(function() {
		
		if($(this).is(":checked")) {
			$('#check-mile').prop('checked', false);
			$$("#valBox").html(dst + " km");
			localStorage.setItem("medida", "Km")
		} else {
			$('#check-mile').prop('checked', true);
			$$("#valBox").html(dst + " Mi");
			localStorage.setItem("medida", "Mi")
		}
		
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
		localStorage.setItem("metrica", "Km");
		if($('#check-mile').is(":checked")){
			metrica = 'm';
			localStorage.setItem("metrica", "Mi");
		};
		
		var distance = $$("#ranger").val();
		localStorage.setItem("distance", distance);
		
		var user_id = localStorage.getItem("user_id");
		setPreferences(metrica, distance, convites, emails, user_id);
		mainView.router.loadPage('index.html');
	})
	
	
});

myApp.onPageInit('chat', function (page) {
	myApp.showIndicator()
	
	var match = localStorage.getItem("match");
	
	$$('.overflow').on('click', function () {
				
				var buttons1 = [
					{
						text: 'Report',
						onClick: function () {
							myApp.prompt("For what reason?", "The Coffee Match", function(value){
								var dataReport = {
									user_id: match,
									match: match,
									reason: value
								}
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/phpmailer/report.php',
										type: 'post',
										data: dataReport,
										success: function(data){
											myApp.alert("User has been reported", "Thank you")
										},error: function (request, status, error) {
											myApp.alert("User has been reported", "Thank you")
										}
								});
								
							})
						}
					},
					{
						text: 'Unmatch',
						onClick: function () {
							
										var abc = {
											match: match
										};
										$.ajax({
											url: 'http://thecoffeematch.com/webservice/unmatch.php',
											type: 'post',
											data: abc,
											success: function(data){
												page.view.router.back({
													url: 'messages.html',
													force: true,
													ignoreCache: true
												})
											}
										});
										
							
									
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
	
	$$("#toolbar").toggleClass("none visivel");
	var user_id = localStorage.getItem("user_id");
	
	// Init Messages
	var myMessages = myApp.messages('.messages', {
	  autoLayout:true
	});
			
	// Handle message
$$('.messagebar .link').on('click', function () {
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
  $('#toolbar').css("height","");
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
										
										myApp.hideIndicator();
									
									}
				
									myMessages.scrollMessages();
									$('.messagebar').trigger('click');
									
									updateStatusUser(1);	
									
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
									try {
										var line1 = "<div class='message message-with-avatar message-received' id="+data.message_id+">"
															+ "<div class='message-name'>"+data.name+"</div>"
															+ "<div class='message-text'>"+data.message+"</div>"
															+ "<div style='background-image:url("+data.picture+")' class='message-avatar'></div>"
															+ "</div>";
											$(".messages").append(line1);
									} catch(err) {
										
									} finally {
										//$('.messagebar').trigger('click');
									}
									
								}
		});
	}
	
});



myApp.onPageBack('chat', function (page) {
	
	$$("#toolbar").toggleClass("visivel none");
	updateStatusUser(0)
	try {
		clearInterval(myInterval);
	}
	catch(err) {
		alert('chat onBack error')
	}
	
});

myApp.onPageInit('match', function (page) {
	var user_id = localStorage.getItem("user_id");
	var suid = localStorage.getItem("idc");
	var d = {
		requester: user_id
	};
	
	//Ajax request to get user info
	$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users/' + suid,
								type: 'get',
								dataType: 'json',
								data: d,
								success: function (data) {
								
									$$("#user-one-img").attr("src", localStorage.getItem("picture"));
									$$("#user-two-img").attr("src", data.picture);						
								}
							});
	$$("#select-starbucks").on("click", function(){
		mainView.router.loadPage('starbucks-proximas.html');
	})
});		

myApp.onPageInit('calendario', function(page){
	var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
 
var calendarInline = myApp.calendar({
    container: '#calendar-inline-container',
    value: [new Date()],
    weekHeader: false,
	input: '#picker-data',
    toolbarTemplate: 
        '<div class="toolbar calendar-custom-toolbar" style="background: white">' +
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
    }, 
	onDayClick: function (p, dayContainer, year, month, day) {
		pickerDescribe.open();
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

$("#confirmar-data").one("click", function(e){
	var data    = $$("#picker-data").val();
	var horario = $$("#picker-horario").val().substring(0,6);
	var complemento = $$("#picker-horario").val().substring(6,9);

	var value  = data + " " + horario.replace(/\s/g,'') + "" + complemento;
	value = convertTo24(value);

	var match = localStorage.getItem("match");
	var user_id = localStorage.getItem("user_id");
	var d2 = {match: match, data: value, user_id: user_id};
	
	$.ajax({
								url: 'http://thecoffeematch.com/webservice/update-date.php',
								type: 'post',
								data: d2,
								success: function (data) {
									
									mainView.router.loadPage('detail-calendar.html');
									
								}
	});
	 myApp.addNotification({
        title: 'The Coffee Match',
        subtitle: "You are all set",
        message: 'Feel free to reschedule at any time',
        media: '<img width="44" height="44" style="border-radius:100%" src="img/logotipo.png">'
    });
	
});

});

//Mudança do slider de distância
function showVal(newVal){
  var medida = localStorage.getItem("medida");
  
  if(!medida){
	  medida = localStorage.getItem("metrica");
  }
  
  document.getElementById("valBox").innerHTML=newVal + " " + medida;
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
										
								}
							});
}

//Seta informações do perfil (somente descrição por enquanto)
function setProfile(description, occupation, nascimento, college, skills, looking, user_id){
	
	var info = {
		description: description, 
		occupation: occupation,
		nascimento: nascimento,
		college: college,
		skills: skills,
		looking: looking
		}
		
	$.ajax({
		url: 'http://api.thecoffeematch.com/v1/users/' + user_id,
		type: 'put',
		dataType: 'json',
		data: info,
		success: function (data) {
			
			if(data.status == 'success'){
				
				//Atualiza preferências e executa função de callback
				localStorage.setItem("description", description);
				
			}
		},
		error: function (request, status, error) {
			//alert(error);
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
    var birthDate = new Date(dateString.replace(/-/g, "/"));
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function updateStatusUser(status){
		var usid = localStorage.getItem("user_id");
		var statusData = {
			online: status
		}
		$.ajax({
			url: 'http://thecoffeematch.com/webservice/update-status.php?user=' + usid,
			type: 'post',
			data: statusData,
			success: function (data) {
			},
			error: function (request, status, error) {
				alert(error);
			}
		});
	}
	


