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

			if(jsonData.notification.payload.additionalData.type == "invite") {
				mainView.router.loadPage('convites.html');
			}
			if(jsonData.notification.payload.additionalData.type == "message" || jsonData.notification.payload.additionalData.type == "match") {
				mainView.router.loadPage('messages.html');
			}
			if(jsonData.notification.payload.additionalData.type == "message") {
				mainView.router.loadPage('messages.html');
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

		//Variável que verifica se o usuário está logado
		logged = localStorage.getItem("logged");

		//Verifica se usuário está logado
		if(logged == null){
			  myApp.onPageInit('index', function() {
				mainView.router.loadPage('login2.html');
			}).trigger();
		} else {
      usuario = new User();
			usuario.setLastLogin();
      configSidePanel();
		}

    //Primeiramente seta todos os eventos do index no DOM
    setIndexEvents();

		myApp.onPageInit('index', function() {
      //Configura barra de navegação
			StatusBar.overlaysWebView(false);
			StatusBar.styleLightContent();
			StatusBar.backgroundColorByHexString("#2f3a41");

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
            if(!requester) {return false}
            myApp.pullToRefreshTrigger('.pull-to-refresh-content');
					},
					error: function (request, status, error) {
            var requester = localStorage.getItem('user_id');
            if(!requester) {return false}
            myApp.pullToRefreshTrigger('.pull-to-refresh-content');
					}
				});
			}, function(){
				myApp.alert('It was not possible to find your location. Check it out on settings.', 'The Coffee Match');
			});

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
                    $("#proximas-ul").empty();
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

     myApp.onPageInit('starbucks-map', function(){
      myApp.showTab('#tab1');
 			StatusBar.overlaysWebView(false);
 			var latLng = new google.maps.LatLng(latitude, longitude);
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
                     $("#map-ul").empty();
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
 										$("#map-ul").append(line1);

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
 								}
 							});


 		 });



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
