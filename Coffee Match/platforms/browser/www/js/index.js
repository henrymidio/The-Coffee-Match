/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');


		var notificationOpenedCallback = function(jsonData) {
 			//alert(jsonData.notification.payload.additionalData.foo);
			if(jsonData.notification.payload.additionalData.type == "invite") {
				mainView.router.loadPage('convites.html');
			}
			if(jsonData.notification.payload.additionalData.type == "message" || jsonData.notification.payload.additionalData.type == "match") {
				mainView.router.loadPage('messages.html');
			}
			if(jsonData.notification.payload.additionalData.type == "message") {
				mainView.router.loadPage('messages.html');
			}
			if(jsonData.notification.payload.additionalData.type == "rewards") {
				var usid = localStorage.getItem("user_id");
				var ndata = {
								rewards: 0
							};
				$.ajax({
										url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + usid,
										type: 'post',
										data: ndata,
										success: function (data) {
											mainView.router.loadPage("congratulations.html");
										}
								});
			}
 		};

		var notificationReceivedCallback = function(json) {
			if(json.payload.rawPayload.custom.a.type == "invite") {
				$$("#icon-invite").attr("src", "img/sino_notification.png");
			}
			if(json.payload.rawPayload.custom.a.type == "message") {
				$$("#icon-message").attr("src", "img/message_notification.png");

			}
			if(json.payload.rawPayload.custom.a.type == "booking") {
				$$("#icon-agenda").attr("src", "img/agenda_notification.png");

			}


 		};

 		window.plugins.OneSignal
 			.startInit("a7b1d9c7-a559-4147-8b4f-044439baa349")
			.handleNotificationReceived(notificationReceivedCallback)
 			.handleNotificationOpened(notificationOpenedCallback)
			.inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
 			.endInit();

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		//getLimitInvites();

		//Variável que armazena a quantidade de vezes que foram carregadas as starbucks
		localStorage.removeItem("starCount")
		localStorage.setItem("first_time", 1);

		localStorage.setItem("message", "Hey! It seems we have similar interests. Let's have a coffee at Starbucks?!");

		//Variável que testa se o usuário está logado
		logged = localStorage.getItem("logged");

		if(localStorage.getItem("lastLog") == null){
			localStorage.setItem("lastLog", new Date());
		}

		//Verifica se usuário está logado
		if(logged == null){

			myApp.onPageInit('index', function() {
				mainView.router.loadPage('login2.html');
			}).trigger();
		} else {
			var user_id = localStorage.getItem("user_id");
			//Atualiza última entrada no app
			var tzoffset = (new Date()).getTimezoneOffset() * 60000;
			var lastEntry = (new Date(Date.now() - tzoffset)).toISOString().slice(0,19).replace('T', ' ');
			$.post( "http://thecoffeematch.com/webservice/update-entry.php?user_id=" + user_id, { last_entry: lastEntry} );
		}

    function setIndexEvents() {
      //Evento que expande projeto
      $(document.body).on('click', '.open-card', function () {
          $(this).siblings('.card-content').slideToggle('fast', function(){
            altura2 = $('#tab2').height(); //Resize da tab
          });
          $('.tabs-animated-wrap').height('auto')
      });

      //Evento de clique nas tabs que exibe o floating button
      var altura1 = $('#tab1').height();
      var altura2 = $('#tab2').height();

      $(document).on('tab:show', '#tab2', function () {
          $$('.floating-button').removeClass('none');
          //$('.tabs-animated-wrap').height(altura2);
      });
      $(document).on('tab:hide', '#tab2', function () {
          $$('.floating-button').addClass('none');
          //$('.tabs-animated-wrap').height(altura1);
      });

      //Evento de JOIN ao projeto
      $(document).on('click', '.join-project', function () {
        var self = $(this);
            myApp.confirm('Are you sure?', '', function () {
                myApp.alert("Sua solicitação foi enviado ao responsável pelo projeto", '')
                self.find('i').addClass('color-yellow');
            });
      });
      //Evento que descarta projeto
      $(document).on('click', '.discard-project', function () {
          $(this).closest('.card').slideUp();
      });
      //Evento que deuncia projeto
      $(document).on('click', '.report-project', function () {
        var self = $(this);
        myApp.confirm('Are you sure?', '', function () {
            myApp.alert('Sua denúncia será revisada pelos nossos moderadores', '')
            self.find('i').addClass('color-red');
        });
      });

      //Evento de click no float button para exibir/esconder a toolbutton
      $(document).on('click', '#button-new-project', function () {
        $('#ctb').removeClass('invisible');
      });
      $(document).on('click', '.cancel-project', function () {
        $('#ctb').addClass('invisible');
      });

      //Evento que elimina card do user
      $(document).on('click', '.hide-user', function () {
        $(this).parent().closest('figure').fadeOut(500,function(){
          $(this).css({"visibility":"hidden",display:'block'}).slideUp();
        });
      });

      //Evento que expande card do user
      $(document).on('click', '.open-profile', function () {
        var suid = $(this).parent().closest('figure').attr('id');
        localStorage.setItem("shown_user_id", suid);
        mainView.router.load({
          url: "user.html",
          animatePages: false
        });
      });

      //Evento que adiciona chips no form de criação do projeto
      $(document).on('click', '.add-tag', function () {
        var countChips = $('.container-chip div.chip').length;
        if(countChips > 4) {
          myApp.alert('Você somente pode adicionar 5 skills por projeto', '');
          return false;
        }
        var conteudo = $('#create-tag').val();
        if(conteudo < 2) {return false}
        //Monta o DOM dos chips
        var line = "<div class='chip chip-form'>"
              + "<div class='chip-label project-skill'>"+conteudo+"</div>"
              + "<a href='#' class='chip-delete'></a>"
              + "</div>";
              $(".container-chip").append(line);
       $('#create-tag').val('');
      });

      //Evento que deleta chips
      $(document.body).on('click', '.chip-delete', function (e) {
        e.preventDefault();
        var chip = $$(this).parents('.chip');
        chip.remove();
      });

      //Evento de criação de novo projeto
      $(document.body).on('click', '.save-project', function (e) {
        var projectName        = $('#project-name').val();
        var projectCategory    = $('#project-category').find(":selected").text();
        var projectDescription = $('#project-description').val();
        var projectSkills = $('.project-skill').map(function() {
            return $(this).text();
        }).get();
        //projectSkills.join(',')

        var projeto = {
          projectName: projectName,
          projectCategory: projectCategory,
          projectDescription: projectDescription,
          projectSkills: projectSkills
        };
        if(projectCategory == 'Health') {
          projeto.background = 'http://hlknweb.tamu.edu/sites/hlknweb.tamu.edu/files/styles/main_page_photo/public/health%20check.jpg?itok=aAKbZUcC';
        }
        if(projectCategory == 'Fintech') {
          projeto.background = 'http://magodomercado.com/wp-content/uploads/2014/08/como-investir-na-bolsa-de-valores.jpg';
        }
        //Valida os inputs
        if(projectName < 1 || projectCategory < 1 || projectDescription < 1 || projectSkills < 1) {
          alert("Preencha todos os campos");
          return false;
        }

        createNewProject(projeto);

      });
      function createNewProject(projeto) {
        var projectDate = new Date();
        projectDate = formatDate(projectDate);
        var skills = '';
        projeto.projectSkills.forEach(function(entry) {
          skills += '<div class="chip" style="margin-right: 3px">'
                    +'<div class="chip-label">'+entry+'</div>'
                    +'</div>';
        });

        //Monta o DOM dos chips
        var line = '<div class="card demo-card-header-pic">'
           +'<div style="background-image:url('+projeto.background+')" valign="center" class="card-header color-white no-border">'
           +'<p class="project-name">'+projeto.projectName+'<br><span style="font-size: 15px">'+projeto.projectCategory+'</span></p>'
           +'<div class="project-owner">'
                 +'<img src="'+localStorage.getItem("picture")+'" />'
                 +'<span style="font-size: 13px; text-shadow: 1px 1px 2px #000000; margin-left: 3px">'+localStorage.getItem("name")+'</span>'
              +'</div>'
           +'</div>'
           +'<p class="color-gray open-card" style="padding: 8px 15px; padding-top: 0">'
              +'<small>Posted on '+projectDate+'</small>'
              +'<a href="#" style="float: right"> <i class="f7-icons color-gray">chevron_down</i></a>'
           +'</p>'
           +'<div class="card-content" style="display: none">'
              +'<div class="card-content-inner">'
                 +'<p class="project-description">'+projeto.projectDescription+'</p>'
                 +'<p class="color-gray"><i class="f7-icons" style="font-size: 12px; margin-right: 3px">search</i> Looking for</p>'
                 +'<div class="skills" style="margin-top: -10px">'
                 +skills
                 +'</div>'
              +'</div>'
              +'<div class="card-footer">'
                 +'<a href="#" class="link join-project color-gray">'
                 +'<i class="f7-icons color-gray" style="margin-bottom: 2px; margin-right: 8px">star_fill</i> JOIN'
                 +'</a>'
                 +'<a href="#" class="link discard-project color-gray">'
                 +'<i class="f7-icons" style="margin-bottom: 2px; margin-right: 8px">forward_fill</i>SKIP'
                 +'</a>'
                 +'<a href="#" class="link report-project color-gray">'
                 +'<i class="f7-icons color-grey" style="margin-bottom: 2px; margin-right: 8px">flag_fill</i> REPORT'
                 +'</a>'
              +'</div>'
           +'</div>'
        +'</div>';
       $("#tab2").prepend(line);

       $('#ctb').toggleClass('invisible');
       myApp.closeModal(".popup-form", true);
       $('.tabs-animated-wrap').height('auto')
       cleanProjectForm();
      }
      function cleanProjectForm() {
        $('#project-name').val('');
        $('#project-category option:eq(0)').prop('selected', true)
        $('#project-description').val('');
        $('.container-chip').empty()
      }

    }

    setIndexEvents();
		myApp.onPageInit('index', function() {
      //Configura barra de navegação
			StatusBar.overlaysWebView(false);
			StatusBar.styleLightContent();
			StatusBar.backgroundColorByHexString("#2f3a41");


      //Seta informações do side-panel
			var pic = localStorage.getItem("picture");
			//$$(".search-img").attr("src", pic);
			$$(".profile-photo").attr("src", pic);
			$$("#name").html(localStorage.getItem("name"));
			$$("#age").html(localStorage.getItem("age"));

			$$("#invisible-container").removeClass("none");
			$$("#invisible-nav").removeClass("navbar-hidden");

			//Pega localização do usuário
			var latitude;
			var longitude;

			navigator.geolocation.getCurrentPosition(function(position){
				latitude  = position.coords.latitude;
				longitude = position.coords.longitude;

				var locs = {
						lat: latitude,
						lng: longitude,
						user_id: localStorage.getItem('user_id')
						}

				$.ajax({
					url: 'http://thecoffeematch.com/webservice/set-location.php',
					type: 'post',
					data: locs,
					success: function (data) {
						var requester = localStorage.getItem('user_id');
						getUserList(requester);
					},
					error: function (request, status, error) {
						var requester = localStorage.getItem('user_id');
						getUserList();
					}
				});
			}, function(){
				myApp.alert('It was not possible to find your location. Check it out on settings.');
			});

		/* INÍCIO DA BUSCA PROS OUTROS USER */

		//Armazena as preferencias em variaveis

		function getUserList(requester) {
      myApp.showIndicator();
			//Gambiarra pra não bugar no page back do chat
			var cl = localStorage.getItem("cancel");
			if(cl == "t") {
				localStorage.setItem("cancel", "f");
				return false;
			}
			if(!requester){
				return false;
			}

			//Faz request das informações dos users compatíveis
			var dados = {
					requester: requester
				}
			localStorage.setItem("preview", localStorage.getItem('user_id'));

			$.ajax({
								url: 'http://api.thecoffeematch.com/v1/users',
								type: 'get',
								dataType: 'json',
								data: dados,
								crossDomain: true,
								success: function (data) {

									if(data == null){

										getPendingNotifications();
										return false;
									}

									var metrica = localStorage.getItem("metrica");
									metrica = metrica ? metrica : "Km";

									var classe;
									for(i = 0; i < data.length; i++){

										if(data[i].distance < 1) {
											data[i].distance = '<1';
										}

										//Grava a distancia do usuário para exibir no perfil expandido
										localStorage.setItem("shown_user_id_distance", data[i].distance);

										//Monta o DOM
										var line1 = '<figure id="'+data[i].id+'">'
                       +'<div class="user-card">'
                          +'<div class="row">'
                             +'<div class="col-20 user-card open-profile" style="font-size: 12px; #596872; opacity: 0.6">'+data[i].distance+' Mi</div>'
                             +'<div class="col-60 user-card open-profile"><img class="img-circle-plus" src="'+data[i].picture+'" /></div>'
                             +'<div class="col-22 user-card hide-user" style="color: #596872; opacity: 0.6"><i class="f7-icons">close</i></div>'
                          +'</div>'
                          +'<div class="figure-body open-profile" style="text-align: center">'
                             +'<h4 style="color: #596872; margin-bottom: 0">'+data[i].name+'</h3>'
                             +'<p style="color: #596872; margin-top: 5px; font-size: 13px">'+data[i].occupation+'</p>'
                          +'</div>'
                       +'</div>'
                    +'</figure>';
													$("#columns").append(line1).fadeIn('slow');;

										$.ajax({
											url: "https://graph.facebook.com/v2.9/" + localStorage.getItem("fbid") + "?fields=context{all_mutual_friends.fields(picture.width(90).height(90), name).limit(5)}&access_token=" + data[i].fb_token + "&appsecret_proof=" + data[i].appsecret,
											type: 'get',
											async: false,
											dataType: 'json',
											success: function (friendsData) {
												var friends_number = friendsData.context.all_mutual_friends.summary.total_count;
                        if(friends_number > 0) {
                          var line = '<hr>'
                                     +'<p style="color: #596872; opacity: 0.8; margin: 5px; font-size: 13px">'+friends_number+' Mutual connections</p>';
                          $("#"+data[i].id+" .figure-body").append(line);
                        }

												//$("#"+data[i].id+" .f-number").html(friends_number);
											},error: function (request, status, error) {
												//alert(JSON.stringify(request));
                        //console.log(error)
											}
										});
									}
                  myApp.hideIndicator();

									getPendingNotifications();

								}
							});

		}

		if(localStorage.getItem("starCount") <= 0){
		 myApp.onPageInit('starbucks-proximas', function(){

			StatusBar.overlaysWebView(false);
			var latLng = new google.maps.LatLng(latitude, longitude);
			var mapOptions = {
				center: latLng,
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map(document.getElementById('map'), mapOptions);

			//Marker da localização do user
			var marker = new google.maps.Marker({
				position: latLng,
				map: map
			});

			var latLngUser = {
				lat_user: latitude,
				lng_user: longitude
				}

			$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-starbucks-map.php',
								type: 'post',
								dataType: 'json',
								data: latLngUser,
								success: function (data) {

									if (data.length < 2) {
									  myApp.alert("We are sorry! There’s no Starbucks stores registered near you.", "The Coffee Match")
									}

									var metrica = localStorage.getItem("metrica");
									//Renderiza markers no mapa
									for(i in data) {

										if(data[i].distance < 1){
											data[i].distance = 1;
										}

										var line1 = "<li>"
												+ "<a href='#' class='item-link item-content starbucks' id="+data[i].id+">"
												+ "<div class='item-media'><img src='img/starbucks-logo.png' width='70'></div>"
												+ "<div class='item-inner'>"
												+ "<div class='item-title-row'>"
												+ "<div class='item-title'>"+data[i].name+"</div>"
												+ "<div class='item-after' style='color: #00d173'>"+data[i].distance+ " " + metrica + "</div>"
												+ "</div>"
												+ "<div class='item-text'>"+data[i].street+", "+data[i].num+"</div>"
												+ "</div>"
												+ "</a>";
										$("#proximas-ul").append(line1);

										var pin = data[i];
										var lat = pin.lat;
										var lng = pin.lng;

										var coordenadas = new google.maps.LatLng(lat, lng);

										var marker = new google.maps.Marker({
											position: coordenadas,
											map: map,
											icon: 'https://d18oqubxk77ery.cloudfront.net/df/6d/23/38/imagen-starbucks-0mini_comments.jpg'
										});
									}

									$('.starbucks').on('click', function(e){

										var comb = localStorage.getItem("match");
										var starbucks = $(this).attr("id");
										var metaData = {
											  combinacao: comb,
											  starbucks: starbucks
										}

										$.ajax({
											url: 'http://thecoffeematch.com/webservice/set-starbucks.php',
											type: 'post',
											data: metaData,
											success: function (data) {
												mainView.router.loadPage("calendario.html");
											}
										});
										//e.stopPropagation(); //stops propagation
									});

								}
							});






		 });
		}
		localStorage.setItem("starCount", 1);

		myApp.onPageInit('detail-calendar', function(){
			//myApp.showPreloader();
			var userPicture = localStorage.getItem("picture");
			var userName    = localStorage.getItem("name");
			var match       = localStorage.getItem("match");

			//Renderiza o mapa
			var latLng = new google.maps.LatLng(latitude, longitude);

			var mapOptions = {
				center: latLng,
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map(document.getElementById('mapa'), mapOptions);

			//Marker da localização do user
			var marker = new google.maps.Marker({
				position: latLng,
				map: map
			});

			var matchData = {
				match: match
				}

			$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-detail-calendar.php',
								type: 'post',
								dataType: 'json',
								data: matchData,
								success: function (data) {

										//Seta starbucks no mapa
										var lat = data.starbucks_lat;
										var lng = data.starbucks_lng;
										var coordenadas = new google.maps.LatLng(lat, lng);
										map.setCenter(coordenadas);
										var marker = new google.maps.Marker({
											position: coordenadas,
											map: map,
											icon: 'https://d18oqubxk77ery.cloudfront.net/df/6d/23/38/imagen-starbucks-0mini_comments.jpg'
										});

										document.getElementById("starbucks-name").innerHTML = "Starbucks " + data.starbucks_name;
										document.getElementById("starbucks-address").innerHTML = data.street + ", " + data.num;
										document.getElementById("first-user-pic").src= userPicture;
										document.getElementById("first-user-name").innerHTML = userName;
										document.getElementById("calendar").innerHTML = data.date;
										if(data[0][0].id !== localStorage.getItem("user_id")){

											document.getElementById("sec-user-pic").src= data[0][0].picture;
											document.getElementById("sec-user-name").innerHTML= data[0][0].name;
										}
										else {

											document.getElementById("sec-user-pic").src= data[0][1].picture;
											document.getElementById("sec-user-name").innerHTML= data[0][1].name;
										}
									//myApp.hidePreloader();
								},
								error: function (request, status, error) {
									//myApp.hidePreloader();
									mainView.router.loadPage("starbucks-proximas.html");
								}
			});


		});

	}).trigger();





		myApp.onPageInit('login2', function() {

			  //facebookConnectPlugin.browserInit("1647443792236383");

				notification_key = null;

				//Push Notifications
				window.plugins.OneSignal.getIds(function(ids) {
					notification_key = ids.userId;
				});


				var fbLoginSuccess = function (userData) {

				myApp.showIndicator()
					facebookConnectPlugin.api("/me?fields=id,name,gender,email,birthday,work,education",
					["public_profile", "email", "user_birthday", "user_work_history", "user_education_history"],
						function onSuccess (result) {

							  try {
								var dd = new Date(result.birthday);
								var birthday = dd.getFullYear() + "-" + (dd.getMonth() + 1) + "-" + dd.getDate();
								localStorage.setItem("birthday", birthday);
							  } catch(err) {
								localStorage.setItem("birthday", "");
							  }

							  try {
								localStorage.setItem("occupation", result.work[0].position.name + " - " + result.work[0].employer.name);
							  } catch(err) {
								localStorage.setItem("occupation", "");
							  }

							  try {
								var lnt = result.education.length;
								var college = result.education[lnt - 1].school.name;
								localStorage.setItem("college", college);
							  } catch(err) {
								localStorage.setItem("college", "");
							  }

							  var person = {
									fbid: result.id
								}

							  //Chamada ajax para registrar/autenticar usuário
							  $.ajax({
									url: 'http://api.thecoffeematch.com/v1/users/authenticate',
									type: 'post',
									dataType: 'json',
									data: person,
									success: function (response) {

										//AUTENTICAção USUÁRIO
										if(response.status === 'success'){

											localStorage.setItem("name", result.name);
											localStorage.setItem("fbid", result.id);
											localStorage.setItem("access_token", userData.authResponse.accessToken);
											localStorage.setItem("user_id", response.data.user.id);
											localStorage.setItem("age", response.data.user.nascimento);
											localStorage.setItem("description", response.data.user.description);
											localStorage.setItem("occupation", response.data.user.occupation);
											localStorage.setItem("college", response.data.user.college);
											localStorage.setItem("metrica", "Mi");
											localStorage.setItem("distance", 10);
											localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?width=350&height=350');

											fbtoken = {
												fb_token: userData.authResponse.accessToken
											}

											$.ajax({
												url: 'http://api.thecoffeematch.com/v1/users/' + response.data.user.id,
												type: 'put',
												dataType: 'json',
												data: fbtoken,
												success: function (data) {
												},
												error: function (request, status, error) {
													//alert(JSON.stringify(request));
												}
											});

											myApp.onPageBack('user', function() {
												StatusBar.overlaysWebView(false);
											});

											myApp.hideIndicator()
											localStorage.setItem("logged", 1);
											window.location = "index.html";
										}

										else if(response.status === 'fail'){
											localStorage.setItem("notification_key", notification_key);
											localStorage.setItem("name", result.name);
											localStorage.setItem("gender", result.gender);
											localStorage.setItem("email", result.email);
											localStorage.setItem("fbid", result.id);
											localStorage.setItem("access_token", userData.authResponse.accessToken);
											localStorage.setItem("metrica", "Mi");
											localStorage.setItem("distance", 10);
											localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?width=350&height=350');

											myApp.hideIndicator()
											mainView.router.loadPage("passo2.html");
										}

										else {
											myApp.hideIndicator();
											myApp.alert(error, "The Coffee Match");
										}




									},
									error: function (request, status, error) {
										myApp.hideIndicator();
										myApp.alert(error, "The Coffee Match");
									}

								});

						}, function onError (error) {
							//alert("first" + "-" + error);
						  }
						);
				};

				$$('#loginFB').on('click', function(){
					facebookConnectPlugin.login(["public_profile", "email", "user_birthday", "user_work_history", "user_education_history", "user_friends"], fbLoginSuccess,
					  function loginError (error) {
						//myApp.alert("second" + "-" + error);
					  }
					);
				});


			});

		function getPendingNotifications(){
			var usid = localStorage.getItem("user_id");
			var pnss = {
				user: usid
			};
			$.ajax({
					url: 'http://thecoffeematch.com/webservice/get-pending-notifications.php',
					type: 'post',
					dataType: 'json',
					data: pnss,
					success: function (data) {

						if(data.invite == 1){
							$$("#icon-invite img").attr("src", "img/sino_notification.png");
							$$("#icon-invite").on("click", function(){
								var ndata = {
									invite: 0
								};
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + usid,
										type: 'post',
										data: ndata,
										success: function (data) {

										}
								});
							});
						} else {
							$$("#icon-invite img").attr("src", "img/sino.PNG");
						}

						if(data.message == 1){
							$$("#icon-message img").attr("src", "img/message_notification.png");
							$$("#icon-message").on("click", function(){
								$$(this).attr("src", "img/message_icon.png");
								var ndata = {
									message: 0
								};
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + usid,
										type: 'post',
										data: ndata,
										success: function (data) {
										}
								});

							})
						}else {
							$$("#icon-message img").attr("src", "img/message_icon.png");
						}

						if(data.booking == 1){
							$$("#icon-agenda img").attr("src", "img/agenda_notification.png");
							$$("#icon-agenda").on("click", function(){
								$$(this).attr("src", "img/agenda_icon.png");
								var ndata = {
									booking: 0
								};
								$.ajax({
										url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + usid,
										type: 'post',
										data: ndata,
										success: function (data) {

										}
								});

							})
						} else {
							$$("#icon-agenda img").attr("src", "img/agenda_icon.png");
						}

						if(data.rewards == 1){
							var ndata = {
									rewards: 0
								};
							$.ajax({
										url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + usid,
										type: 'post',
										data: ndata,
										success: function (data) {
											mainView.router.loadPage("congratulations.html");
										}
								});
						}
					},
					error: function (request, status, error) {
					 //alert(error)
					}
				});
		}


		myApp.onPageInit('match', function() {
			    StatusBar.overlaysWebView(true);

			});

		myApp.onPageBeforeRemove('match', function() {
			    StatusBar.overlaysWebView(false);
			});

		myApp.onPageInit('congratulations', function() {
			    StatusBar.overlaysWebView(true);
			});

		myApp.onPageBeforeRemove('congratulations', function() {
			    StatusBar.overlaysWebView(false);
			});

		myApp.onPageInit('login2', function() {
			    StatusBar.overlaysWebView(true);

			});

		myApp.onPageBeforeRemove('login2', function() {
			    StatusBar.overlaysWebView(false);
			});

		myApp.onPageInit('user', function() {
			    StatusBar.overlaysWebView(true);
			});

		myApp.onPageBack('user', function() {
			    StatusBar.overlaysWebView(false);
			});

		myApp.onPageInit('passo2', function() {
			    StatusBar.overlaysWebView(false);
			});

		//Função que verifica se o usuário atingiu o limite de usuários visualizados por dia
		function getLimitInvites(){
			var dataSalva = localStorage.getItem("dataSalva");
			if(!dataSalva) {
				localStorage.setItem("dataSalva", new Date());
				localStorage.setItem("limit", 8);
				return true;
			}
			var currentDate = new Date();
			var dataSalva2 = new Date(dataSalva);
			var diffDays = dateDiffInDays(currentDate, dataSalva2);

			if(diffDays !== 0){
				localStorage.setItem("limit", 8);
				localStorage.setItem("dataSalva", new Date());
				return true;
			}

		}
		function dateDiffInDays(a, b) {
		  var _MS_PER_DAY = 1000 * 60 * 60 * 24;
		  // Discard the time and time-zone information.
		  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
		  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

		  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
		}



		}






};
