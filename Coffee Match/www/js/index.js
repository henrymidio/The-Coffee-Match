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
				mainView.router.loadPage('combinacoes.html');
			}
 		};
		
		var notificationReceivedCallback = function(json) {
			if(json.payload.rawPayload.custom.a.type == "invite") {
				$$("#icon-invite").attr("src", "img/sino02.PNG");
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
		//Variável que armazena a quantidade de vezes que foram carregadas as starbucks
		localStorage.removeItem("starCount")
		localStorage.setItem("message", "Hey! It seems we have similar interests. Lets have a coffee at Starbucks?!");
		
		//Variável que testa se o usuário está logado
		var logged = localStorage.getItem("user_id");
		
		if(localStorage.getItem("contador") == null){
				localStorage.setItem("contador", 8);
			}
			
		if(localStorage.getItem("lastLog") == null){
				localStorage.setItem("lastLog", new Date());
			}
		
		//Verifica se usuário está logado
		if(logged == null){
			
			myApp.onPageInit('index', function() {
				mainView.router.loadPage('login2.html');
			}).trigger();
		} 
		
		
		myApp.onPageInit('index', function() {
			
			//Verifica quando foi o último login para limitar número de usuários na listagem
			var curDate  = new Date();
			var lastLog  = localStorage.getItem("lastLog");
			
			if(curDate > lastLog){
				localStorage.setItem("contador", 8);
				localStorage.setItem("lastLog", curDate);
			} 
			localStorage.setItem("contador", 8);
			//Evento de envio do convite
		$$('.invite').on('click', function () {
			
			myApp.prompt("Hi, Let's have a coffee to talk about...", "The Coffee Match", function (value) {
				localStorage.setItem("message", value);
				if(value.length == 0){
					localStorage.setItem("message", "Hey! It seems we have similar interests. Lets have a coffee at Starbucks?!");
				}
				$("#tinderslide").jTinder('like');
			});
			
		});
		$$('.nope').on('click', function () {
				$("#tinderslide").jTinder('dislike');
		});
		$$('.yep').on('click', function () {
				$("#tinderslide").jTinder('like');
		});
		
		//Configura barra de navegação
		StatusBar.overlaysWebView(false);
		StatusBar.styleLightContent();
		StatusBar.backgroundColorByHexString("#2f3a41");
		
		var pic = localStorage.getItem("picture");
			
		$$(".search-effect").attr("src", pic);
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
					
				}
			});
		}, function(){
			alert('Não foi possível encontrar a sua localização');
		});
		
		/* INÍCIO DA BUSCA PROS OUTROS USER */
		
		//Armazena as preferencias em variaveis
		
		
		//Faz request das informações dos users compatíveis
		var dados = {
				user_id: localStorage.getItem('user_id'),
				distance: localStorage.getItem('distance')
			}
			localStorage.setItem("preview", localStorage.getItem('user_id'));
			$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								dataType: 'json',
								data: dados,
								crossDomain: true,
								success: function (data) {		
									
									var metrica = localStorage.getItem("metrica");
									metrica = metrica ? metrica : "Km";
									
									var position = data.length - 1;
									localStorage.setItem("shown_user_id", data[position].id);
									
									var classe;
									for(i = 0; i < data.length; i++){
										
										if (i == data.length - 1){
											classe = "current";
										} else {
											classe = "next";
										}
									
									var skill1 = data[i].skill1 ? "<span class='tag'>"+data[i].skill1+"</span>" : "";
									var skill2 = data[i].skill2 ? "<span class='tag'>"+data[i].skill2+"</span>" : "";
									var skill3 = data[i].skill3 ? "<span class='tag'>"+data[i].skill3+"</span>" : "";
									var skill4 = data[i].skill4 ? "<span class='tag'>"+data[i].skill4+"</span>" : "";
									var skill5 = data[i].skill5 ? "<span class='tag'>"+data[i].skill5+"</span>" : "";
																	
								    //Monta o DOM
									var line1 = "<li class="+classe+" id="+data[i].id+"><a href='user.html' data-animate-pages='false' class='no-animation'>"
												+ "<div class='text-center' style='background: url(img/background_profile.png); margin: -10px; padding-bottom: 1px'>"
												+ "<div class='row'>"
												+ "<div class='col-25' style='padding-top: 55px'><span style='color: #00d173' id='distance'>10</span><br><p class='subcol' id='distance'>"+metrica+"</p></div>"
												+ "<div class='col-50'><img class='img' src="+data[i].picture+" /></div>"
												+ "<div class='col-25' style='padding-top: 55px'><span style='color: #00d173'>"+data[i].age+"<br><p class='subcol'>Age</span></p></div>"
												+ "</div>"
												+ "<p class='username'>"+data[i].name+"</p>"
												+ "<p class='college'>"+data[i].college+"</p>"
												+ "<p class='college' style='margin-top: -15px; font-size: 14px'>"+data[i].occupation+"</p>"
												+ "</div><br>"
												+ "<p class='friends' style='margin-top: -15px; color: #2f3a41'><img style='vertical-align: middle; width: 22px; height: 22px' src='img/skills.png' /> <span style='line-height:22px;'><b>My Skills</b></span></p>"
												+ "<div class='skills' style='margin-top: -15px; margin-left: 20px'>"+skill1+skill2+skill3+skill4+skill5+"</div><br>"
												+ "<p class='friends' style='margin-top: -25px; color: #2f3a41'><img style='vertical-align: middle; width: 22px; height: 22px' src='img/tellme.png' /> <span style='line-height:22px;'><b>About My Projects & Ideas</b></span></p>"
												+ "<p class='friends' style='color: #2f3a41; margin-top: -10px; margin-left: 24px'>"+data[i].description+"</p>"
												+ "<div class='like'></div><div class='dislike'></div>"
												+ "</div>"
												+ "</a></li>";		
									$("#user-list").append(line1);
									}
									$$(".buttons-row").toggleClass("none visivel");
									
									/**
									 * jTinder initialization
									 */
									$("#tinderslide").jTinder({
										
									});
								}								
							});
						
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
									var metrica = localStorage.getItem("metrica");
									//Renderiza markers no mapa
									for(i in data) {
										
																				
										var line1 = "<li class='item-content' style='padding-left: 8px'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src='img/starbucks-logo.png'  style='margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='#' class='item-link starbucks'  style='text-overflow: ellipsis' id="+data[i].id+">"
												+ "<div class='item-title'><span id='proximas-name'><b>"+data[i].name+"</b><span id='proximas-distance' style='color: #00d173'> - "+data[i].distance+ " " + metrica + " </span></span><br>"
												+ "<span class='subtitle'><span id='proximas-street'>"+data[i].street+"</span>, <span id='proximas-num'>"+data[i].num+"</span></span></div></div></a></li>";		
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
			var latLng      = new google.maps.LatLng(latitude, longitude);	
			
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
				 facebookConnectPlugin.api("/me?fields=id,name,email", ["public_profile","email"],
					  function onSuccess (result) {
						  
						  var person = {
								fbid: result.id,
								notification_key: notification_key,
								name: result.name,
								email: result.email,
								picture: 'https://graph.facebook.com/' + result.id + '/picture?width=350&height=350'
							}
						 							
							
							
						  //Chamada ajax para registrar/autenticar usuário
						  $.ajax({
								url: 'http://thecoffeematch.com/webservice/register.php',
								type: 'post',
								dataType: 'json',
								data: person,
								success: function (data) {
									
									//AUTENTICA USUÁRIO
									if(data.code == 1){
										
										localStorage.setItem("name", result.name);
										localStorage.setItem("fbid", result.id);
										localStorage.setItem("user_id", data.user_id);
										localStorage.setItem("age", data.age);
										localStorage.setItem("description", data.description);
										localStorage.setItem("occupation", data.occupation);
										localStorage.setItem("college", data.college);
										localStorage.setItem("metrica", "Km");
										localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?width=350&height=350');
										
										//mainView.router.loadPage("index.html");
										window.location = "index.html";
									} 
									
									//CADASTRA USUÁRIO
									if(data.code == 2){
										
										localStorage.setItem("name", result.name);
										localStorage.setItem("user_id", data.user_id);
										localStorage.setItem("fbid", result.id);
										localStorage.setItem("metrica", "Km");
										localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?width=350&height=350');
										
										mainView.router.loadPage('passo2.html');
									}
									
								
									
									
								},
								error: function (request, status, error) {
									alert(request.responseText);
								}
								
							});
						  
						
					  }, function onError (error) {
						alert(error);
					  }
					);
				};		
				
				$$('#loginFB').on('click', function(){		
					facebookConnectPlugin.login(["public_profile", "email"], fbLoginSuccess,
					  function loginError (error) {
					  	
						myApp.alert(error);
					  }
					);
				});
				
				
			});
			
				
					
		myApp.onPageInit('match', function() {
			    StatusBar.overlaysWebView(true);
	
			});
		
		myApp.onPageBeforeRemove('match', function() {
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
		
		}
		
		
	
		
		
		
};
