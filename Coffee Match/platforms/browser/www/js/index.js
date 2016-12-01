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
        //facebookConnectPlugin.browserInit("1647443792236383");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		
		var logged = localStorage.getItem("user_id");
		
		//Verifica se usuário está logado
		if(logged == null){
			
			myApp.onPageInit('index', function() {
				mainView.router.loadPage('login.html');
			}).trigger();
		} 
		
		
		myApp.onPageInit('index', function() {
				
		//Configura barra de navegação
		StatusBar.overlaysWebView(false);
		StatusBar.styleLightContent();
		StatusBar.backgroundColorByHexString("#8D7A4B");
		
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
			
			$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-user-list.php',
								type: 'post',
								dataType: 'json',
								data: dados,
								crossDomain: true,
								success: function (data) {							
									
									var position = data.length - 1;
									localStorage.setItem("shown_user_id", data[position].id);
									
									var classe;
									for(i = 0; i < data.length; i++){
										
										if (i == data.length - 1){
											classe = "current";
										} else {
											classe = "next";
										}
									
																	
								    //Monta o DOM
									var line1 = "<li class="+classe+" id="+data[i].id+">"
												+ "<a href='user.html' class='no-animation'>"
												+ "<img class='img' src="+data[i].picture+" />"
												+ "</a>"
												+ "<p class='username'><b>"+data[i].name+"</b>, "+data[i].age+"</p>"
												+ "<p class='college'>"+data[i].college+"</p>"
												+ "<p class='friends'><img src='img/nicolas.jpg' /><img src='img/fulana.png' /></p>"
												+ "<div class='like'></div><div class='dislike'></div>"
												+ "</li>";		
									$("#user-list").append(line1);
									}
																
									/**
									 * jTinder initialization
									 */
									$("#tinderslide").jTinder({
										
									});
								}								
							});
		
		
		myApp.onPageInit('starbucks-map', function(){
			
			var latLng = new google.maps.LatLng(latitude, longitude);
			var mapOptions = {
				center: latLng,
				zoom: 13,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map(document.getElementById('map'), mapOptions);
			
			//Marker da localização do user
			var marker = new google.maps.Marker({
				position: latLng,
				map: map
			});
			
			$.ajax({
								url: 'http://thecoffeematch.com/webservice/get-starbucks-map.php',
								type: 'get',
								dataType: 'json',
								success: function (data) {
									//Renderiza markers no mapa
									for(i in data) {
										var pin = data[i];		
										var lat = pin.lat;
										var lng = pin.lng;
										
										var coordenadas = new google.maps.LatLng(lat, lng);
										
										var marker = new google.maps.Marker({
											position: coordenadas,
											map: map,
											icon: 'https://d18oqubxk77ery.cloudfront.net/df/6d/23/38/imagen-starbucks-0mini_comments.jpg',
											title: pin.name
										});
									}
								}
							});
			
			
		});
		
		myApp.onPageInit('starbucks-proximas', function(){
			StatusBar.overlaysWebView(false);
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
									//Renderiza markers no mapa
									for(i in data) {
										
																				
										var line1 = "<li class='item-content'>"
												+ "<div class='item-media'>"
												+ "<img class='icon icons8-Settings-Filled' src='img/starbucks-logo.gif'  style='border-radius: 100%; margin-top: 5px; width: 60px; height: 60px'>"
												+ "</div>"
												+ "<div class='item-inner'>"
												+ "<a href='#' class='item-link starbucks' id="+data[i].id+">"
												+ "<div class='item-title'><span id='proximas-name'>"+data[i].name+"</span><br>"
												+ "<span class='subtitle'><span id='proximas-street'>"+data[i].street+"</span>, <span id='proximas-num'>"+data[i].num+"</span> - <span id='proximas-distance'></span></span></div></div></a></li>";		
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
									
									$('.starbucks').on('click touch', function(){
				
										var starbucks = $(this).attr("id");
										var metaData = {
											  match: localStorage.getItem("match"),
											  starbucks: starbucks
										  }
										  
											  $.ajax({
																			url: 'http://thecoffeematch.com/webservice/set-starbucks.php',
																			type: 'post',
																			data: metaData,
																			success: function (data) {
																				myApp.alert("Starbucks selecionada!!!", "");
																				
																			}
												});
			});
									
								}
							});
							
			
			
			
		});
	}).trigger();
		
		
		

		
		myApp.onPageInit('login', function() {
			    
				
				//facebookConnectPlugin.browserInit("1647443792236383");	
				
				var fbLoginSuccess = function (userData) {
				 facebookConnectPlugin.api("/me?fields=id,first_name,email", ["public_profile","email"],
					  function onSuccess (result) {
						  /*
						    facebookConnectPlugin.getAccessToken(function(token) {
								console.log(token)
								localStorage.setItem("token", token);
								
							 });
							 */
						    var person = {
								fbid: result.id,
								name: result.first_name,
								email: result.email,
								picture: 'https://graph.facebook.com/' + result.id + '/picture?type=large'
							}
							
						  //Chamada ajax para registrar/autenticar usuário
						  $.ajax({
								url: 'http://thecoffeematch.com/webservice/register.php',
								type: 'post',
								dataType: 'json',
								data: person,
								success: function (data) {
									//alert(data.code);
									if(data.code == 1){
										
										//Armazena localmente os dados e redireciona para HOME
										localStorage.setItem("name", result.first_name);
										localStorage.setItem("fbid", result.id);
										localStorage.setItem("user_id", data.user_id);
										localStorage.setItem("age", data.age);
										localStorage.setItem("description", data.description);
										localStorage.setItem("occupation", data.occupation);
										localStorage.setItem("college", data.college);
										localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?type=large');
										
										mainView.router.loadPage("index.html");
										
									} 
									if(data.code == 2){
										
										//Armazena localmente os dados e redireciona para PASSO 1
										localStorage.setItem("name", result.first_name);
										localStorage.setItem("user_id", data.user_id);
										localStorage.setItem("fbid", result.id);
										localStorage.setItem("picture", 'https://graph.facebook.com/' + result.id + '/picture?type=large');
										
										mainView.router.loadPage('passo1.html');
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
					facebookConnectPlugin.login(["public_profile", "email", "user_friends"], fbLoginSuccess,
					  function loginError (error) {
					  	
						myApp.alert(error);
					  }
					);
				});
				
				
			});
			
				
		myApp.onPageInit('user', function() {
			    StatusBar.overlaysWebView(true);
				
			});
		
		myApp.onPageBeforeRemove('user', function() {
			    StatusBar.overlaysWebView(false);		
			});
			
			myApp.onPageInit('match', function() {
			    StatusBar.overlaysWebView(true);
	
			});
		
		myApp.onPageBeforeRemove('match', function() {
			    StatusBar.overlaysWebView(false);		
			});
		}
		
		
	
		
		
		
};
