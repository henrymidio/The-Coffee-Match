// Initialize app
var myApp = new Framework7({
    statusbarOverlay:false,
    smartSelectOpenIn:'picker'
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
  myApp.showTab('#tab1');
	var mySwiper = myApp.swiper('.swiper-container', {
		speed: 400,
		pagination: '.swiper-pagination'
	});
});




myApp.onPageInit('login-informations', function (page) {
  document.getElementById('picture').src = localStorage.getItem("picture");
  $$(".login-name").html(localStorage.getItem("name"));
  $$("#information-profissao").val(localStorage.getItem("occupation"));
  $$("#information-faculdade").val(localStorage.getItem("college"));
  $('.next').on('click', function(){
    if ($$("#information-faculdade").val().length < 3) {
			document.getElementById("information-faculdade").focus();
			return false;
		}
		if ($$("#information-profissao").val().length < 3) {
			document.getElementById("information-profissao").focus();
			return false;
		}

    localStorage.setItem("occupation", $$("#information-profissao").val())
    localStorage.setItem("college", $$("#information-faculdade").val())
    localStorage.setItem("personal-link", $$("#information-link").val())
    mainView.router.loadPage('login-final.html')
  })
});

$(document).on('click', '.btn-interest', function(){
  $('.btn-interest').removeClass('interest-selected')
  $(this).addClass('interest-selected')
  var interesse = $(this).text()
  localStorage.setItem("interest", interesse)
  //mainView.router.loadPage('login-final.html')
})

myApp.onPageInit('login-final', function (page) {
  $.ajax({
								url: 'http://thecoffeematch.com/webservice/get-tags.php',
								dataType: 'json',
								success: function (data) {
									for(i = 0; i < data.length; i++){
										myApp.smartSelectAddOption('#skills select', "<option>"+data[i].nome+"</option>");
                    myApp.smartSelectAddOption('#skills-secundarias select', "<option>"+data[i].nome+"</option>");
									}
								}
	});
  var birthday = localStorage.getItem("birthday");
	var picture = localStorage.getItem("picture");
	var name    = localStorage.getItem("name");
	var work = localStorage.getItem("occupation");
	var education = localStorage.getItem("college");
  var interest = localStorage.getItem("interest") + ', null, null';
  var link = localStorage.getItem("personal-link");

  $('.btn-ready').on('click', function(){

    var topSkill = $('#skills .item-after').text();
    var secondarySkills = $('#skills-secundarias .item-after').text();
		var descricao = $$("#final-description").val();

    //Verifica Quantas skills secundárias foram selecionadas
    var ssqnt = secondarySkills.split(',')

    if(topSkill.length < 1) {
      myApp.alert('Selecione sua habilidade principal', '')
      return false;
    }
    if(secondarySkills.length < 1 || ssqnt.length < 2) {
      myApp.alert('Selecione suas habilidades secundárias', '')
      return false;
    }
    myApp.showIndicator();

    var skills = topSkill + ',' + secondarySkills.replace(/\s*,\s*/g, ",");

    //Chamada o servidor para cadastro/atualização de informações de perfil
		var userObj = {
			fbid: localStorage.getItem("fbid"),
			fb_token: localStorage.getItem("access_token"),
			notification_key: localStorage.getItem("notification_key"),
			name: localStorage.getItem("name"),
			gender: localStorage.getItem("gender"),
			email: localStorage.getItem("email"),
			picture: localStorage.getItem("picture"),
			nascimento: birthday,
			description: descricao,
			occupation: work,
			college: education,
			skills: skills,
			looking: interest,
      urlink: link
		}
    $.ajax({
			url: 'http://api.thecoffeematch.com/v1/users',
			type: 'post',
			dataType: 'json',
			data: userObj,
			success: function(response) {
				localStorage.setItem("user_id", response.data.id);
				localStorage.setItem("logged", 1);
        localStorage.setItem("description", descricao);
				myApp.hideIndicator();
        usuario = new User();
				mainView.router.loadPage("index.html");
			},
			error: function (request, status, error) {
				myApp.hideIndicator();
        console.log(request)
				myApp.alert(error, "The Coffee Match");
				//mainView.router.loadPage("login2.html");
			}
		});



  })
});
/*
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
        usuario = new User();
				mainView.router.loadPage("index.html");
			},
			error: function (request, status, error) {
				myApp.hideIndicator();
				myApp.alert("There was an error processing your request, please try again.", "The Coffee Match");
				mainView.router.loadPage("login2.html");
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
*/

myApp.onPageInit('confirmacao-convite', function (page) {
	var user_id  = localStorage.getItem("user_id");
	var other_id = localStorage.getItem("idc");

  //Seta aqui para ver o perfil na confirmação
  localStorage.setItem("shown_user_id", other_id)

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
                  var message = localStorage.getItem("mess")

                  $$(".user-name").html(data.name);
                  $$(".confirmacao-img").attr("src", data.picture);
                  $$("#message").html(message);
                },
                error: function(a, b, c) {
                  console.log(c)
                }
							});


	$('#confirmar-cafe').on("click", function(){
		myApp.showIndicator()

    usuario.removeUserFromCache(other_id)
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
									mainView.router.loadPage("chat.html");
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
  myApp.showTab('#tab1');
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
                      var line = '<li>'
                        +'<div class="text-center" style="margin-top: 180px">'
                        +'<img src="img/icNotificationBig.png" />'
                          +'<br>'
                          +'<p style="color: rgb(89, 104, 114); font-size: 21px">Sem novos convites...</p>'
                        +'</div>'
                      +'</li>';
                      $("#invites-li").append(line);
										return false;
									}
									for(i = 0; i < data.length; i++){

									//Seta id da confirmacao-convite
									var idc = localStorage.setItem("idc", data[i].id);

                  //Elipse da mensagem
                  var message = data[i].message.replace(/^(.{25}[^\s]*).*/, "$1");

									//Monta o DOM
									var line1 = "<li class='swipeout'>"
												+ "<div class='swipeout-content'>"
												+ "<div class='item-content'>"
												+ "<div class='item-media cont'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='user.html' class='item-link match' id="+data[i].id+">"
												+ "<div class='item-title div-match' id="+data[i].like_id+"><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle' id='mess'>Quer tomar um café com você!</span>"
												+ "</div>"
												+ "</div>"
												+ "</div>"
												+ "</a>"
												+ "</div>"
												+ "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='bg-red del-invite'>Deletar</a>"
												+ "</div>"
												+ "</li>";

									$("#invites-li").append(line1);

									}

									//Deleta convite
									$('.del-invite').on('click', function () {
										var self   = $(this);
										var inviteId = self.parents("li").find("div.div-match").attr("id");
										var swipeout = self.closest(".swipeout");
										myApp.confirm("Você tem certeza?", "The Coffee Match", function(){
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
										localStorage.setItem("shown_user_id", $(this).attr("id"));
                    //localStorage.setItem("mess", $(this).find("#mess").text());
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
  myApp.showTab('#tab1');
	//gambs
	localStorage.setItem("cancel", "f");

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
									$("#match-li").empty();
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
												+ "<div class='item-media swipeout' id="+data[i].preview_id+">"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner match' id="+data[i].id+">"
												+ "<a href='#' class='item-link'>"
												+ "<div class='item-title '><span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ starbucksLine
												+ "<span class='subtitle'><img style='width: 11px; height: 11px; margin-right: 6px' src='img/time.png' />"+agendamento+"</span></div></div></a>"
												+ "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='bg-red unmatch'>Desfazer convite</a>"
												+ "</div>"
												+"</li>";
									    $("#match-li").append(line1);


									}
                  /*
									$(".match").on("click", function(){
										localStorage.setItem("match", $(this).attr('id'));
										mainView.router.loadPage("detail-calendar.html");
										var suid = $(this).siblings("div.swipeout").attr("id");
										localStorage.setItem("shown_user_id", this.id);
									});
                  */
									$(".unmatch").on("click", function(){
										var self   = $(this);
										var idMatch = self.parent().siblings(".match").attr("id");
										var swipeout = self.closest(".swipeout");

										myApp.confirm("Vocês não poderão se conectar", "Tem certeza?", function(){
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


								}

							});


});

myApp.onPageBack('detail-calendar', function(page){
  $$("#toolbar").toggleClass("none visivel");
});

myApp.onPageInit('detail-calendar', function(page){
  $$("#toolbar").toggleClass("none visivel");
  /*
	$$(".btn-green").on("click", function(){
		mainView.router.loadPage("chat.html");
	});
  */
	$$('.edit').on('click', function () {

				var buttons1 = [
					{
						text: 'Edit',
						label: true
					},
					{
						text: 'Coffee Stores',
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
						text: 'Cancelar',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons2];
				myApp.actions(groups);

	});
});
/*
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

});
*/
/*
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
*/

myApp.onPageInit('myprojects', function (page) {
  myApp.showTab('#tab1');
  usuario.getProjects(function(data){
    $('.ul-projects').empty();
    if(data.length == 0) {
      var line = '<li class="empty-li">'
        +'<div class="text-center" style="margin-top: 90px">'
        +'<img src="img/icProjectsBig.png" />'
          +'<br>'
          +'<p style="color: rgb(89, 104, 114); font-size: 21px">Inicie um novo projeto!</p>'
        +'</div>'
        + '<div class="text-center">'
        + '<a href="#" id="button-new-project" class="btn-0 btn-2 btn-2c open-popup" data-popup=".popup-form">New Project</a>'
        + '</div>'
      +'</li>';
      $(".ul-projects").append(line);
      return false;
    }

    //Adiciona o floating button de criação do projeto
    var line = '<a href="#" id="button-new-project" class="floating-button color-white open-popup" data-popup=".popup-form" style="font-size: 30px">'
      + '+'
      + '</a>';
      $(".ul-projects").append(line);

    for(i = 0; i < data.length; i++){
      var number_joined_users = 0;
      console.log(data)
      if(data[i].joined_users) {
        number_joined_users = data[i].joined_users.length;
      }
      var line = "<li class='item-link item-content open-myproject' id='"+data[i].id+"'>"
        + "<div class='item-media profile'>"
        + "<img class='icon icons8-Settings-Filled' src='"+data[i].image+"' style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
        + "</div>"
        + "<div class='item-inner'>"
        + "<a href='#' class='item-link'>"
        + "<div class='item-title'><span><b>"+data[i].name+"</b></span><br>"
        + "<span class='subtitle'>"+number_joined_users+" interessados</span></div></div></a>"
        + "</li>";
        $('.ul-projects').append(line);
    }
  })

  $(document).on('click', '.open-myproject', function () {
    var project_id = $(this).attr('id');
    localStorage.setItem('project_id', project_id);
    mainView.router.loadPage('joined-project.html');
  })
});



$(document).on('click', '.delete-project', function () {
  myApp.confirm("Tem certeza que deseja deletar este projeto?", "", function(){
    myApp.showIndicator()
    var project_id = localStorage.getItem('project_id');
    deleteProject(project_id, function() {
      mainView.router.reloadPage('myprojects.html')
      mainView.router.back()
      myApp.hideIndicator()
    });
  })
})
myApp.onPageInit('joined-project', function (page) {
  var project_id = localStorage.getItem('project_id');
  $.ajax({
    url: 'http://api.thecoffeematch.com/v1/projects/' + project_id,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      //console.log(data)
      for(i in data) {
        $('.j-name').html(data[i].name);
        $('.j-description').text(data[i].description);

        var skills = '';
        var looking_for = data[i].looking_for.split(",");
        var linha = '';

        $('.content-chips').empty();
        $('.container2-chip').empty();
        looking_for.forEach(function(entry) {
            skills += '<div class="chip" style="margin-right: 3px">'
                      +'<div class="chip-label">'+entry+'</div>'
                      +'</div>';
            linha += "<div class='chip chip-form'>"
                  + "<div class='chip-label project-skill'>"+entry+"</div>"
                  + "<a href='#' class='chip-delete'></a>"
                  + "</div>";
          });
          $('.content-chips').append(skills);
          $(".container2-chip").append(linha);

          //Valores da popup de edição do perfil
          $('.edit-name').val(data[i].name);
          $('.edit-description').val(data[i].description);

          //Todos interessados
          var j = '';
          $('.all-connections-list').empty();
          var c = 0;
          var t = data[i].all_joined_users.length;
          data[i].all_joined_users.forEach(function(entry){
            $.ajax({
              url: 'http://api.thecoffeematch.com/v1/users/' + entry.joined_user,
              type: 'get',
              dataType: 'json',
              success: function (data) {
                $('.label-old').html('<i class="f7-icons" style="font-size: 12px; margin-right: 7px">persons</i>Todos')
                c += 1;
                j += '<div id='+data.id+' class="col-33 op-profile" style="position: relative">'
                       + '<img src='+data.picture+' />'
                       + '<br><span>'+data.name+'</span>'
                       + '</div>';
                if(c == t) {
                  j += '<div class="col-33" style="position: relative"></div>';
                  $('.all-connections-list').append(j);
                }

              }
            });
          });

        //Novos interessados
        var joined = '';
        $('.mutual-connections-list').empty();
        var contador = 0;
        try {
          var total = data[i].joined_users.length;
          data[i].joined_users.forEach(function(entry){
            $.ajax({
              url: 'http://api.thecoffeematch.com/v1/users/' + entry.joined_user,
              type: 'get',
              dataType: 'json',
              success: function (data) {
                contador += 1;
                joined += '<div id='+data.id+' class="col-33 op-chat-profile" style="position: relative">'
                       + '<img src='+data.picture+' />'
                       + '<br><span>'+data.name+'</span>'
                       + '</div>';
                if(contador == total) {
                  joined += '<div class="col-33" style="position: relative"></div>';
                  $('.mutual-connections-list').append(joined);
                }

              }
            });
          });
        } catch (e) {

        } finally {

        }

      }
      $(document).on('click', '.op-profile', function () {
        var shown_user_id = $(this).attr('id');
        localStorage.setItem('shown_user_id', shown_user_id);
        mainView.router.loadPage('profile-view.html');
      })
      $(document).on('click', '.op-chat-profile', function () {
        var shown_user_id = $(this).attr('id');
        localStorage.setItem('shown_user_id', shown_user_id);
        mainView.router.loadPage('user-com-chat.html');
      })
    }

  });

  var name;
  var description;
  $('.edit-project').on('click', function(){
    myApp.showIndicator()
    var project_id = localStorage.getItem('project_id');
    name = $('.edit-name').val();
    description = $('.edit-description').val();
    var editSkills = $('.project-skill').map(function() {
        return $(this).text();
    }).get();

    $('.content-chips').empty();
    var skills = '';
    editSkills.forEach(function(entry) {
        skills += '<div class="chip" style="margin-right: 3px">'
                  +'<div class="chip-label">'+entry+'</div>'
                  +'</div>';
      });
      //console.log(skills)
      $(".content-chips").append(skills);

    editSkills = editSkills.join(',')

    editProject(project_id, name, description, editSkills, function(data) {
      myApp.hideIndicator();
      myApp.closeModal(".popup-edit-form", true);
      myApp.alert('Suas informações foram atualizadas com sucesso', '')
      $('.j-name').html(name);
      $('.j-description').html(description);
    });
  })

});

myApp.onPageBack('project', function (page) {
  $$('.floating-button').removeClass('none');
});

myApp.onPageInit('project', function (page) {
  var project_id = localStorage.getItem('project_id');
  $.ajax({
    url: 'http://api.thecoffeematch.com/v1/projects/' + project_id,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      for(i in data) {
        $('.project-background').css('background-image', 'url('+data[i].image+')')
        $('.p-name').text(data[i].name)
        $('.p-description').text(data[i].description)
        $('.p-category').text(data[i].category)
        $(".p-owner-picture").attr("src", data[i].owner_picture);
        $(".p-owner-name").text(data[i].owner_name);
        $(".p-owner-occupation").text(data[i].owner_occupation);

        //$('.project-owner').attr('id', data[i].owner)

        var skills = '';
        var looking_for = data[i].looking_for.split(",");

        looking_for.forEach(function(entry) {
            skills += '<div class="chip" style="margin-right: 3px">'
                      +'<div class="chip-label">'+entry+'</div>'
                      +'</div>';
          });
          $('.content-chips').append(skills)
      }

      if(data[i].owner == usuario.getID()) {
        $('#join-project').hide()
      } else {
        data[i].all_joined_users.forEach(function(entry) {
            if(entry.joined_user == usuario.getID()) {
              myApp.alert('Você já se cadastrou a este projeto', '')
              $('#join-project').hide()
            }
        });
      }
    }
  });

  $('#join-project').on('click', function() {
      usuario.joinProject(project_id);
      myApp.alert("Sua solicitação foi enviada com sucesso!", "")
      mainView.router.back();
  })
/*
  $('.project-owner').on('click', function() {
    localStorage.setItem("shown_user_id", $(this).attr("id"))
    mainView.router.loadPage("profile-preview.html")
  })
*/
  $$('#report-project').on('click', function () {

				var buttons1 = [
					{
						text: 'Denunciar',
						onClick: function () {
							myApp.prompt("Qual o motivo?", "The Coffee Match", function(value){
								myApp.alert("Usuário denunciado", "Obrigado")
							})
						}
					}
				];
				var buttons2 = [
					{
						text: 'Cancelar',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons2];
				myApp.actions(groups);
	});

});

$(document).on('click', '.back-m', function () {
  mainView.router.back({url: 'index.html', force: true})
});
$(document).on("click", ".erase", function(){
  var self = $(this);
  var idMatch = self.parent().siblings().find(".chat").attr("id");
  var swipeout = self.closest(".swipeout");

  myApp.confirm("Vocês não poderão mais se conectar", "Tem certeza?", function(){
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
$(document).on("click", ".chat", function(){
  localStorage.setItem("match", this.id);
  var idp = $(this).closest(".swipeout").attr('id');
  localStorage.setItem("shown_user_id", idp);
  mainView.router.loadPage("chat.html");
});
myApp.onPageInit('messages', function (page) {
  //myApp.showIndicator()
  myApp.showTab('#tab1');
	var user = localStorage.getItem("user_id");
	var x = {user_id: user}

	$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-last-message.php',
								type: 'post',
								dataType: 'json',
								data: x,
								success: function (data) {

                  $("#messages-li").empty();

                  if(data.length == 0) {
                    var line = '<li>'
                      +'<div class="text-center" style="margin-top: 180px">'
                      +'<img src="img/icChatBig.png" />'
                        +'<br>'
                        +'<p style="color: rgb(89, 104, 114); font-size: 21px">No conversation started yet...</p>'
                      +'</div>'
                    +'</li>';
                    $("#messages-li").append(line);
                    //myApp.hideIndicator()
                  }

									for(i = 0; i < data.length; i++){

										var replyArrow = "";
										var weight = "bold";
										if(data[i].last_message === null){
											data[i].last_message = "Conectado em "+data[i].date;
										}

										if(data[i].user == x.user_id) {
											replyArrow = "<img style='width: 12px; height: 12px; margin-right: 5px' src='img/reply-arrow.png' /> ";
											weight = "";
										}

										//Monta o DOM
									    var line1 = "<li class='swipeout' id="+data[i].suid+">"
												+ "<div class='swipeout-content'>"
                        + "<div class='item-content'>"
                        + "<div class='item-media cont perfil'>"
												+ "<img class='icon icons8-Settings-Filled' src="+data[i].picture+"  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='#' class='item-link chat' id="+data[i].id+">"
												+ "<div class='item-title' style='width: 200px'>"
                        + "<span id='matches-name'><b>"+data[i].name+"</b></span><br>"
												+ "<span class='subtitle " + weight + "'>"+replyArrow+data[i].last_message+"</span>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</a>"
                        + "</div>"
                        + "<div class='swipeout-actions-right'>"
												+ "<a href='#' class='bg-red erase'>Delete</a>"
												+ "</div>"
                        + "</li>";
									    $("#messages-li").append(line1);


										$(".perfil").on("click", function(){
											var idp = $(this).closest('.swipeout').attr("id");
											localStorage.setItem("shown_user_id", idp);
											mainView.router.loadPage("profile-view.html");
										});

									}

                  //myApp.hideIndicator()

								},
								error: function (request, status, error) {
                  //myApp.hideIndicator()
									//alert(request.responseText);
								}

							});


});

$$(document).on("click", "#finalizar-edicao", function(){
  var topSkill;
  var skillsSecundarias;
  var descricao = $$("#p-description").val();
  var profissao = $$("#p-occupation").val();
  var faculdade = $$("#p-graduation").val();
  var link = $$("#p-link").val();

  if (profissao.length == 0) {
    document.getElementById("occupation").focus();
    return false;
  }

  if (faculdade.length == 0) {
    document.getElementById("graduation").focus();
    return false;
  }

  var topSkill = $('#skills .item-after').text();
  var skillsSecundarias = $('#skills-secundarias .item-after').text();

  //Verifica Quantas skills secundárias foram selecionadas
  var ssqnt = skillsSecundarias.split(',')

  if(topSkill.length < 1) {
    myApp.alert('Selecione sua habilidade principal', '')
    return false;
  }
  if(skillsSecundarias.length < 1 || ssqnt.length < 2) {
    myApp.alert('Selecione suas habilidades secundárias', '')
    return false;
  }

  //Junta top skill com skills secundárias
  var skills = topSkill + "," + skillsSecundarias.replace(/\s*,\s*/g, ",");

  var user_id = localStorage.getItem("user_id");

  var birthday = null;
  var interest = "null,null,null";
	//var age = getAge(birthday);
  //console.log(descricao + ' ' + profissao + ' ' + birthday + ' ' + skills + ' ' + interest + ' ' + user_id);

  //Chamada ao servidor para atualização de informações de perfil
  setProfile(descricao, profissao, birthday, faculdade, skills, interest, user_id, link);

  localStorage.setItem("description", descricao);
  localStorage.setItem("occupation", profissao);
  localStorage.setItem("college", faculdade);
  localStorage.setItem("personal-link", link);

  myApp.alert('Seu perfil foi atualizado', "")
  mainView.router.loadPage('index.html');

})
myApp.onPageInit('profile', function (page) {

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
										if(data[i].nome === data[0].skill1){
												myApp.smartSelectAddOption('#skills select', "<option selected>"+data[i].nome+"</option>");
										} else {
											if (typeof data[i].nome === 'undefined'){
												//Não faz nada
											}else {
												myApp.smartSelectAddOption('#skills select', "<option>"+data[i].nome+"</option>");
											}

										}

                    if(data[i].nome == data[0].skill2 || data[i].nome == data[0].skill3){
												myApp.smartSelectAddOption('#skills-secundarias select', "<option selected>"+data[i].nome+"</option>");
										} else {
											if (typeof data[i].nome === 'undefined'){
												//Não faz nada
											}else {
												myApp.smartSelectAddOption('#skills-secundarias select', "<option>"+data[i].nome+"</option>");
											}

										}
									}

								}
	});
	var birthday = localStorage.getItem("age");
	//var age = getAge(birthday);
	$$("#p-name").html(localStorage.getItem("name"));
	$$("#p-description").val(localStorage.getItem("description"));
	$$("#picture").attr("src", localStorage.getItem("picture"));
	$$("#p-occupation").val(localStorage.getItem("occupation"));
	$$("#p-graduation").val(localStorage.getItem("college"));
  $$("#p-link").val(localStorage.getItem("personal-link"));

});
/*
$(document).on('click', '#picture', function(){
  getPhoto()
})
*/

//SHOWN USER
myApp.onPageBack('user', function (page) {
  $$("#toolbar-user").removeClass("visivel");
  $$("#toolbar-user").addClass("none");
});

//Eventos da tela user setados de fora para não ocorrerem duas vezes
$(document).on('popup:open', '.popup-project', function () {
  var project_id = localStorage.getItem('project_id');
  $.ajax({
    url: 'http://api.thecoffeematch.com/v1/projects/' + project_id,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      for(i in data) {
        $('.projeto-background').css('background-image', 'url('+data[i].image+')')
        $('.projeto-name').text(data[i].name)
        $('.projeto-description').text(data[i].description)
        $('.projeto-category').text(data[i].category)
        $(".projeto-owner-picture").attr("src", data[i].owner_picture);
        $(".projeto-owner-name").text(data[i].owner_name);

        var skills = '';
        var looking_for = data[i].looking_for.split(",");

        $('.chip').remove()
        looking_for.forEach(function(entry) {
            skills += '<div class="chip" style="margin-right: 3px">'
                      +'<div class="chip-label">'+entry+'</div>'
                      +'</div>';
          });
          $('.content-chips').append(skills)
      }
    }
  });
});
$(document).on('click', '.open-popup-project', function () {
  localStorage.setItem('project_id', $(this).attr('id'));
  myApp.popup('.popup-project');
});
$(document).on('click', '.send-invite', function () {
    //var message = $('.invite-message').val();
    var shown_user_id = localStorage.getItem('shown_user_id');

    usuario.like(shown_user_id, "");
    myApp.closeModal();
    usuario.removeUserFromCache(shown_user_id)
    $('figure#'+shown_user_id).css({"visibility":"hidden",display:'block'}).slideUp();
    //myApp.alert("Your ")

});

myApp.onPageInit('user', function (page) {

  var altura = $('#inside-con').height();
  $('.blur-back').height(altura + 60)

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

                  $$("#toolbar-user").toggleClass("none visivel");
                  $$('#toolbar-user').on('click', function () {
                    myApp.popup('.popup-message');
                  });
									$.ajax({
										url: "https://graph.facebook.com/v2.9/" + localStorage.getItem("fbid") + "?fields=context{all_mutual_friends.fields(picture.width(90).height(90), name).limit(5)}&access_token=" + data.fb_token + "&appsecret_proof=" + data.appsecret,
										type: 'get',
										dataType: 'json',
										success: function (friendsData) {
											var loops = friendsData.context.all_mutual_friends.data.length;
											var friends_number = friendsData.context.all_mutual_friends.summary.total_count;

                      if(friends_number > 0) {
                        $('#mutual-numbers').html(friends_number);
                      }

											for(i = 0; i < loops; i++){
												var line = '<div class="col-33"><img src="'+friendsData.context.all_mutual_friends.data[i].picture.data.url+'" /><br><span>'+ friendsData.context.all_mutual_friends.data[i].name +'</span></div>';
												$(".friends-list").append(line);
											}

											if(friends_number > 5){
												var line = '<div class="col-33" style="position: relative"><img src="img/more-friends.png" /><div class="more color-white">+'+(friends_number - 5)+ '</div></div>';
												$(".friends-list").append(line);
											} else {
												var line = '<div class="col-33"></div>';
												$(".friends-list").append(line);
											}


										},error: function (request, status, error) {
                      //console.log(error)
											//$('.card-friends').hide();
										}
									});

                  var skill1 = data.skill1 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill1+'</div>'
                            +'</div>' : "";
                  var skill2 = data.skill2 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill2+'</div>'
                            +'</div>' : "";
                  var skill3 = data.skill3 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill3+'</div>'
                            +'</div>' : "";

                  /*
									var l1 = data.l1 ? '<span style="margin-right: 10px">●</span>' + data.l1 : "";
									var l2 = data.l2 ? '<span style="margin-right: 10px">●</span>' + data.l2 : "";
									var l3 = data.l3 ? '<span style="margin-right: 10px">●</span>' + data.l3 : "";
                  */
									if(data.distance < 1) {
											data.distance = '<1';
									}

									$$("#user-distance").html('<img width="15" height="15" style="vertical-align: top; margin-right: 5px" src="img/pin-9-xxl.png" />' + data.distance + ' Km');
									$$("#user-view-img").attr("src", data.picture);
                  $(".blur-back").css("background", 'url('+data.picture+')');
                  $(".blur-back").css("background-size", 'cover');
									$$("#user-view-name").html(data.name);
									$$("#user-view-age").html(data.age);
									$$("#user-view-occupation").html(data.occupation);
									$(".skss").append(skill1, skill2, skill3);
                  $$("#top-skill").html(data.skill1);
									$$("#user-view-college").html(data.college);
									//$$("#user-view-description").html(data.description);
                  if(data.description.length > 0) {
                    var lineAbout = '<p class="friends user-label color-silver"><i class="f7-icons" style="font-size: 14px; margin-right: 5px">chat</i>Sobre mim</p>'
                                  + '<p class="friends" style="margin-left: 20px; margin-right: 10px; color: #2f3a41">'+data.description+'</p>'
                                  + '<br>';
                    $('.tc').before(lineAbout)
                  }

                  if(data.urlink) {
                    var lineLink = '<p class="friends user-label color-silver"><i class="f7-icons" style="font-size: 14px; margin-right: 5px">chat</i>Website</p>'
                                  + '<p class="friends" style="margin-left: 20px; margin-right: 10px; color: #2f3a41"><a class="external" href=http://'+data.urlink+'>'+data.urlink+'</a></p>'
                                  + '<br>';
                    $('.tc').before(lineLink)
                  }

                  if(data.projects.length > 0) {
                    //$('.card-projects').toggleClass('none');
                    data.projects.forEach(function(entry) {
                      //console.log(entry.name)

                        var line = "<li id='"+entry.id+"' class='item-link item-content open-popup-project'>"
                                 +"<div class='item-media'>"
                                 +"<img class='icon icons8-Settings-Filled' src='"+entry.image+"'  style='border-radius: 100%; margin-top: 5px; width: 50px; height: 50px' />"
                                 +"</div>"
                                 +"<div class='item-inner'>"
                                 +"<a href='#' class='item-link'>"
                                 +"<div class='item-title'><span><b>"+entry.name+"</b></span><br>"
                                 +"<span class='subtitle'>"+entry.category+"</span></div></div></a>"
                                 +"</li>";
                        $('.projects-list').append(line);

                    });
                  }

								}

	});

	$$('#report').on('click', function () {

				var buttons1 = [
					{
						text: 'Denunciar',
						onClick: function () {
							myApp.prompt("Por qual razão?", "The Coffee Match", function(value){
								var dataReport = {
									user_id: suid,
									reason: value
								}
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/phpmailer/report.php',
										type: 'post',
										data: dataReport,
										success: function(data){
											myApp.alert("Usuário denunciado", "Obrigado", function(){
												mainView.router.back();
											})
										},error: function (request, status, error) {
											myApp.alert("Usuário denunciado", "Obrigado", function(){
												mainView.router.back();
											})
										}
								});

							})
						}
					}
				];
        var buttons3 = [
					{
						text: 'Bloquear',
						onClick: function () {
							usuario.removeUserFromCache(suid);
              mainView.router.back();
              $('figure#'+suid).css({"visibility":"hidden",display:'block'}).slideUp();
						}
					}
				];
				var buttons2 = [
					{
						text: 'Cancelar',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons3, buttons2];
				myApp.actions(groups);
	});

});

myApp.onPageBack('user-com-chat', function (page) {
  $$("#toolbar-user-chat").removeClass("visivel");
  $$("#toolbar-user-chat").addClass("none");
});

myApp.onPageInit('user-com-chat', function (page) {
  $$("#toolbar-user-chat").toggleClass("none visivel");

  var altura = $('#inside-con').height();
  $('.blur-back').height(altura + 60)

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

                      if(friends_number > 0) {
                        $('#mutual-numbers').html(friends_number);
                      }

											for(i = 0; i < loops; i++){
												var line = '<div class="col-33"><img src="'+friendsData.context.all_mutual_friends.data[i].picture.data.url+'" /><br><span>'+ friendsData.context.all_mutual_friends.data[i].name +'</span></div>';
												$(".friends-list").append(line);
											}

											if(friends_number > 5){
												var line = '<div class="col-33" style="position: relative"><img src="img/more-friends.png" /><div class="more color-white">+'+(friends_number - 5)+ '</div></div>';
												$(".friends-list").append(line);
											} else {
												var line = '<div class="col-33"></div>';
												$(".friends-list").append(line);
											}


										},error: function (request, status, error) {
                      //console.log(error)
											//$('.card-friends').hide();
										}
									});

                  var skill1 = data.skill1 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill1+'</div>'
                            +'</div>' : "";
                  var skill2 = data.skill2 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill2+'</div>'
                            +'</div>' : "";
                  var skill3 = data.skill3 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill3+'</div>'
                            +'</div>' : "";

                  /*
									var l1 = data.l1 ? '<span style="margin-right: 10px">●</span>' + data.l1 : "";
									var l2 = data.l2 ? '<span style="margin-right: 10px">●</span>' + data.l2 : "";
									var l3 = data.l3 ? '<span style="margin-right: 10px">●</span>' + data.l3 : "";
                  */
									if(data.distance < 1) {
											data.distance = '<1';
									}

									$$("#user-distance").html('<img width="15" height="15" style="vertical-align: top; margin-right: 5px" src="img/pin-9-xxl.png" />' + data.distance + ' Km');
									$$("#user-view-img").attr("src", data.picture);
                  $(".blur-back").css("background", 'url('+data.picture+')');
                  $(".blur-back").css("background-size", 'cover');
									$$("#user-view-name").html(data.name);
									$$("#user-view-age").html(data.age);
									$$("#user-view-occupation").html(data.occupation);
									$(".skss").append(skill1, skill2, skill3);
                  $$("#top-skill").html(data.skill1);
									$$("#user-view-college").html(data.college);
									$$("#user-view-description").html(data.description);
//console.log(data)
                  if(data.projects.length > 0) {
                    //$('.card-projects').toggleClass('none');
                    data.projects.forEach(function(entry) {
                      //console.log(entry.name)

                        var line = "<li id='"+entry.id+"' class='item-link item-content open-popup-project'>"
                                 +"<div class='item-media'>"
                                 +"<img class='icon icons8-Settings-Filled' src='"+entry.image+"'  style='border-radius: 100%; margin-top: 5px; width: 50px; height: 50px' />"
                                 +"</div>"
                                 +"<div class='item-inner'>"
                                 +"<a href='#' class='item-link'>"
                                 +"<div class='item-title'><span><b>"+entry.name+"</b></span><br>"
                                 +"<span class='subtitle'>"+entry.category+"</span></div></div></a>"
                                 +"</li>";
                        $('.projects-list').append(line);

                    });
                  }

								}

	});

	$$('#report').on('click', function () {

				var buttons1 = [
					{
						text: 'Denunciar',
						onClick: function () {
							myApp.prompt("Por qual razão?", "The Coffee Match", function(value){
								var dataReport = {
									user_id: suid,
									reason: value
								}
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/phpmailer/report.php',
										type: 'post',
										data: dataReport,
										success: function(data){
											myApp.alert("Usuário denunciado", "Obrigado", function(){
												mainView.router.back();
											})
										},error: function (request, status, error) {
											myApp.alert("Usuário denunciado", "Obrigado", function(){
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
						text: 'Cancelar',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons2];
				myApp.actions(groups);
	});

});

myApp.onPageInit('profile-view', function (page) {
  var altura = $('#inside-con').height();
  $('.blur-back').height(altura + 60)

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

                      if(friends_number > 0) {
                        $('#mutual-numbers').html(friends_number);
                      }

											for(i = 0; i < loops; i++){
												var line = '<div class="col-33"><img src="'+friendsData.context.all_mutual_friends.data[i].picture.data.url+'" /><br><span>'+ friendsData.context.all_mutual_friends.data[i].name +'</span></div>';
												$(".friends-list").append(line);
											}

											if(friends_number > 5){
												var line = '<div class="col-33" style="position: relative"><img src="img/more-friends.png" /><div class="more color-white">+'+(friends_number - 5)+ '</div></div>';
												$(".friends-list").append(line);
											} else {
												var line = '<div class="col-33"></div>';
												$(".friends-list").append(line);
											}


										},error: function (request, status, error) {
                      //console.log(error)
											//$('.card-friends').hide();
										}
									});

                  var skill1 = data.skill1 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill1+'</div>'
                            +'</div>' : "";
                  var skill2 = data.skill2 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill2+'</div>'
                            +'</div>' : "";
                  var skill3 = data.skill3 ? '<div class="chip" style="margin-right: 3px">'
                            +'<div class="chip-label">'+data.skill3+'</div>'
                            +'</div>' : "";

                  /*
									var l1 = data.l1 ? '<span style="margin-right: 10px">●</span>' + data.l1 : "";
									var l2 = data.l2 ? '<span style="margin-right: 10px">●</span>' + data.l2 : "";
									var l3 = data.l3 ? '<span style="margin-right: 10px">●</span>' + data.l3 : "";
                  */
									if(data.distance < 1) {
											data.distance = '<1';
									}

									$$("#user-distance").html('<img width="15" height="15" style="vertical-align: top; margin-right: 5px" src="img/pin-9-xxl.png" />' + data.distance + ' Km');
									$$("#user-view-img").attr("src", data.picture);
                  $(".blur-back").css("background", 'url('+data.picture+')');
                  $(".blur-back").css("background-size", 'cover');
									$$("#user-view-name").html(data.name);
									$$("#user-view-age").html(data.age);
									$$("#user-view-occupation").html(data.occupation);
									$(".skss").append(skill1, skill2, skill3);
                  $$("#top-skill").html(data.skill1);
									$$("#user-view-college").html(data.college);
									$$("#user-view-description").html(data.description);

                  if(data.urlink) {
                    var lineLink = '<p class="friends user-label color-silver"><i class="f7-icons" style="font-size: 14px; margin-right: 5px">chat</i>Website</p>'
                                  + '<p class="friends" style="margin-left: 20px; margin-right: 10px; color: #2f3a41"><a class="external" href=http://'+data.urlink+'>'+data.urlink+'</a></p>'
                                  + '<br>';
                    $('.tc').before(lineLink)
                  }

                  if(data.projects.length > 0) {
                    //$('.card-projects').toggleClass('none');
                    data.projects.forEach(function(entry) {
                      //console.log(entry.name)

                        var line = "<li id='"+entry.id+"' class='item-link item-content open-popup-project'>"
                                 +"<div class='item-media'>"
                                 +"<img class='icon icons8-Settings-Filled' src='"+entry.image+"'  style='border-radius: 100%; margin-top: 5px; width: 50px; height: 50px' />"
                                 +"</div>"
                                 +"<div class='item-inner'>"
                                 +"<a href='#' class='item-link'>"
                                 +"<div class='item-title'><span><b>"+entry.name+"</b></span><br>"
                                 +"<span class='subtitle'>"+entry.category+"</span></div></div></a>"
                                 +"</li>";
                        $('.projects-list').append(line);

                    });
                  }

								}

	});

	$$('#report').on('click', function () {

				var buttons1 = [
					{
						text: 'Denunciar',
						onClick: function () {
							myApp.prompt("Por qual razão?", "The Coffee Match", function(value){
								var dataReport = {
									user_id: suid,
									reason: value
								}
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/phpmailer/report.php',
										type: 'post',
										data: dataReport,
										success: function(data){
											myApp.alert("Usuário denunciado", "Obrigado", function(){
												mainView.router.back();
											})
										},error: function (request, status, error) {
											myApp.alert("Usuário denunciado", "Obrigado", function(){
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
						text: 'Cancelar',
						color: 'red'
					}
				];
				var groups = [buttons1, buttons2];
				myApp.actions(groups);
	});

});

myApp.onPageBeforeInit('settings', function (page) {
  myApp.showTab('#tab1');
	var uid = localStorage.getItem("user_id");
	var ud = {user_id: uid};
	var dst = null;

	$$('#delete-account').on('click', function(){
		myApp.confirm("Todas as suas informações serão perdidas", "Tem certeza que deseja deletar o seu perfil?", function(){
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
					alert("Erro");
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
                  if(data.available == false){
										$('#change-status').prop('checked', false);
									}

										$$("#valBox").html(data.distance + " Km")

								},
								error: function (request, status, error) {
									alert(error);
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
    var status = 0;
    if($('#change-status').is(":checked")){
			status = 1;
		};

		var distance = $$("#ranger").val();
		localStorage.setItem("distance", distance);

		var user_id = localStorage.getItem("user_id");
		setPreferences(status, distance, convites, emails, user_id);
		mainView.router.loadPage('index.html');
	})


});

$(document).on('click', '.chat-back', function () {
  mainView.router.back({url: 'messages.html', force: true})
});
myApp.onPageInit('chat', function (page) {
  $$("#toolbar-user").removeClass("visivel");
  $$("#toolbar-user").addClass("none");
  $$("#toolbar-user-chat").removeClass("visivel");
  $$("#toolbar-user-chat").addClass("none");

  StatusBar.overlaysWebView(false);
	myApp.showIndicator()

	var match = localStorage.getItem("match");

	$$('.overflow').on('click', function () {

				var buttons1 = [
					{
						text: 'Denunciar',
						color: 'red',
						onClick: function () {
							myApp.prompt("Por qual razão?", "The Coffee Match", function(value){
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
											myApp.alert("Usuário denunciado", "Obrigado")
										},error: function (request, status, error) {
											myApp.alert("Usuário denunciado", "Obrigado")
										}
								});

							})
						}
					},
					{
						text: 'Desfazer convite',
						color: 'red',
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
						text: 'Cancelar',
						bold: true
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
  var messageText = myMessagebar.value().trim().replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');
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
                  $(".messages").empty()
									for(i = 0; i < data.length; i++){

										if(data[i].id === user_id){
											var line0 = "<div class='message message-with-avatar message-sent message-last message-with-tail message-first'>"
														+ "<div class='message-text'>"+data[i].message+"</div>"
														+ "<div style='background-image:url("+data[i].picture+")' class='message-avatar'></div>"
														//+ "<div class='message-label'>"+data[i].data+"</div>"
														+ "</div>";
											$(".messages").append(line0);
										} else {
											if(data[i].id){
												user = data[i].id;

												//Monta o DOM
												var line1 = "<div class='message message-with-avatar message-received message-last message-with-tail message-first' id="+data[i].message_id+">"
																+ "<div class='message-name'>"+data[i].name+"</div>"
																+ "<div class='message-text'>"+data[i].message+"</div>"
																+ "<div style='background-image:url("+data[i].picture+")' id='"+data[i].id+"' class='message-avatar avatar-click'></div>"
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

                    $('.avatar-click').on('click', function(){
                      var id = $(this).attr('id');
                      localStorage.setItem("shown_user_id", id);
                      mainView.router.loadPage('profile-view.html');
                    });

									}

									myMessages.scrollMessages();
									$('.messagebar').trigger('click');

									updateStatusUser(1);

								}
	});

  $('textarea').on({input: function(){
    var totalHeight = $(this).prop('scrollHeight') - parseInt($(this).css('padding-top')) - parseInt($(this).css('padding-bottom'));
    $(this).css({'height':totalHeight});
    $(".toolbar-popup").css({'height':totalHeight + 25});
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


myApp.onPageInit('match', function (page) {
	var user_id = usuario.getID()
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
                  //console.log(data)
									$$("#user-one-img").attr("src", usuario.getPicture());
									$$("#user-two-img").attr("src", data.picture);
								},
                error: function(err) {
                  console.log(err)
                }
							});
	$$("#send-message").on("click", function(){
		mainView.router.loadPage('messages.html');
	})
});

myApp.onPageBack('calendario', function(){
  $$("#toolbar").toggleClass("none visivel");
});
myApp.onPageInit('calendario', function(page){
	var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto' , 'Setembro' , 'Outubro', 'Novembro', 'Dezembro'];

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
                  mainView.router.reloadPage('detail-calendar.html')
                  mainView.router.back()
									//mainView.router.loadPage('detail-calendar.html');
                  $$("#toolbar").toggleClass("none visivel");

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
function setPreferences(status, distance, convites, emails, user_id){
	//myApp.showPreloader();
	var pref = {status: status, distance: distance, convites: convites, emails: emails, user_id: user_id};

	$.ajax({
								url: 'http://thecoffeematch.com/webservice/set-preferences.php',
								type: 'post',
								data: pref,
								success: function (data) {
//console.log(data)
										//Atualiza preferências e executa função de callback
										localStorage.setItem("distance", distance);
										//myApp.hidePreloader();

								}
							});
}

//Seta informações do perfil (somente descrição por enquanto)
function setProfile(description, occupation, nascimento, college, skills, looking, user_id, urlink){

	var info = {
		description: description,
		occupation: occupation,
		nascimento: nascimento,
		college: college,
    urlink: urlink,
		skills: skills,
		looking: looking
		}

	$.ajax({
		url: 'http://api.thecoffeematch.com/v1/users/' + user_id,
		type: 'put',
		dataType: 'json',
		data: info,
		success: function (data) {
      //console.log(data)
			if(data.status == 'success'){

				//Atualiza preferências e executa função de callback
				localStorage.setItem("description", description);

			}
		},
		error: function (request, status, error) {
			console.log(error)
		}
	});
}

  myApp.onPageInit('starbucks-map', function(){
   myApp.showTab('#tab1');
   StatusBar.overlaysWebView(false);
   var latLng = new google.maps.LatLng(usuario.getLatitude(), usuario.getLongitude());
   var mapOptions = {
     center: latLng,
     zoom: 12,
     mapTypeId: google.maps.MapTypeId.ROADMAP
   };
   var map = new google.maps.Map(document.getElementById('starbucks-map'), mapOptions);

   //Marker da localização do user
   var marker = new google.maps.Marker({
     position: latLng,
     map: map
   });

   var latLngUser = {
     lat_user: usuario.getLatitude(),
     lng_user: usuario.getLongitude()
     }

   $.ajax({
             url: 'http://thecoffeematch.com/webservice/get-starbucks-map.php',
             type: 'post',
             dataType: 'json',
             data: latLngUser,
             success: function (data) {

               if (data.length < 2) {
                 var lineEmpty = "<div class='text-center' style='margin: 20px'>"
                     + "<br><br>"
                     + "<h3>Nenhuma cafeteria encontrada próximo a você</h3>"
                     + "<p class='color-silver'>Indique-nos a sua cafeteria preferida para ela aparecer aqui</p>"
                     + "<p class='color-silver'>nicolas@thecoffeematch.com</p>"
                     + "</div>";
                 $("#map-ul").html(lineEmpty);
                 return false;
               }

               $("#map-ul").empty();
               //Renderiza markers no mapa
               for(i in data) {

                 if(data[i].distance < 1){
                   data[i].distance = 1;
                 }

                 //Logo e ícone do marker
                 var icon = {
                     url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00d173"
                 };

                 var line1 = "<li>"
                     + "<a href='#' class='item-link item-content cafeteria' id="+data[i].id+">"
                     + "<div class='item-media'><img class='cafeteria-mini-logo' src='"+data[i].logo+"'></div>"
                     + "<div class='item-inner'>"
                     + "<div class='item-title-row'>"
                     + "<div class='item-title'>"+data[i].name+"</div>"
                     + "<div class='item-after' style='color: #00d173'>"+data[i].distance+ " Km</div>"
                     + "</div>"
                     + "<div class='item-text'>"+data[i].street+", "+data[i].num+"</div>"
                     + "</div>"
                     + "</a>";
                 $("#map-ul").append(line1);

                 var pin = data[i];
                 var lat = pin.lat;
                 var lng = pin.lng;

                 var coordenadas = new google.maps.LatLng(lat, lng);

                 var marker = new google.maps.Marker({
                   position: coordenadas,
                   map: map,
                   icon: icon
                 });
               }
             },
             error: function(a, b, c) {
               console.log(c)
             }
           });

  });
  $(document).on('click', '.cafeteria', function(){
    var cafeteria = $(this).attr('id')
    localStorage.setItem("cafeteria", cafeteria)
    mainView.router.loadPage('cafeteria.html')
  })

  myApp.onPageInit('cafeteria', function(){
    var cafeteria = localStorage.getItem("cafeteria")
    $.ajax({
			url: 'http://api.thecoffeematch.com/v1/cafeterias/' + cafeteria,
			dataType: 'json',
			success: function (data) {

				$('.cafeteria-background').css('background-image', 'url('+data[0].cover+')')
        $('.cafeteria-logo').attr('src', data[0].logo)
        $('.cafeteria-name').text(data[0].name)
        $('.cafeteria-endereco').text(data[0].street + ', ' + data[0].num + ' - ' + data[0].bairro)
        $('.cafeteria-description').text(data[0].description)

        data['horarios'].forEach(function(entry){
          if(entry.open_time == null) {
            $('.horarios').append('<p>Fechado</p>')
          } else {
            $('.horarios').append('<p>'+entry.open_time + ' às ' + entry.close_time+'</p>')
          }
        });
			}
  	});

    //Seta Horário e data do voucher
    var date = new Date();
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    $('.voucher-date').text(day + '/' + (monthIndex + 1) + '/' + year)
    $('.voucher-hour').text(date.toTimeString().substr(0,5))

    //Request que verifica se já foi resgatada uma recompensa no dia atual
    usuario.getRewards(function(dados) {

      if(dados == null) {
        return false;
      }
      if(day<10) {
          day = '0'+day
      }
      var rewardsAvailable = true;
      for(i in dados) {
        var d1 = new Date(dados[i].granted.replace(/\s/, 'T'));
        var d2 = new Date((year + '-' + (monthIndex + 1) + '-' + day).replace(/\s/, 'T'));

        var same = d1.getTime() === d2.getTime();
        if(same) {
          rewardsAvailable = false;
          return false;
        }
      }
      $('#fc-button').removeClass('free-coffee-disabled')
      $('#fc-button').addClass('free-coffee')
    })

  })
  $(document).on('click', '.free-coffee', function(){
    var reward = {
      'user_id': usuario.getID(),
      'cafeteria': localStorage.getItem("cafeteria")
    }

    myApp.confirm('Esse voucher possui validade diária e somente poderá ser visualizado uma única vez. Clique em ok, caso já esteja pronto para retirar a sua recompensa', 'Atenção!', function () {
      $.ajax({
                url: 'http://api.thecoffeematch.com/v1/rewards',
                type: 'post',
                dataType: 'json',
                data: reward,
                success: function (data) {
                  myApp.popup('.popup-voucher');
                },
                error: function(a, b, c) {
                  console.log(a)
                }
              })
    });

  })
/*
  myApp.onPageInit('rewards', function(){
    myApp.showTab('#tab1');
    var renderRewards = function(rewards) {
      $('#rewards-ul').empty()
      for(i in rewards) {
        var line = '<li>'
          +'<div class="item-content">'
          +'<div class="item-media"><img src="img/ic_coffee.png" width="40"></div>'
          +'<div class="item-inner">'
              +'<div class="item-title-row">'
                +'<div class="item-title">'+rewards[i].name+'</div>'
                +'<div class="item-after"><small>'+rewards[i].granted+'</small></div>'
              +'</div>'
              +'<div class="item-subtitle">Espresso</div>'
            +'</div>'
          +'</div>'
        +'</li>';
        $('#rewards-ul').append(line)
      }
    }
    usuario.getRewards(renderRewards)
  })
  */
