function User() {

  var _id = localStorage.getItem('user_id');
  var _picture  = localStorage.getItem("picture");
  var _name    = localStorage.getItem("name");
  var _birthday = localStorage.getItem("birthday");
  var _occupation = localStorage.getItem("occupation");
  var _college = localStorage.getItem("college");
  var _fbid = localStorage.getItem("fbid");
  var _accessToken = localStorage.getItem("access_token");
  var _age = localStorage.getItem("age");
  var _description = localStorage.getItem("description");
  var _notificationKey = localStorage.getItem("notification_key");
  var _gender = localStorage.getItem("gender");
  var _email = localStorage.getItem("email");
  var _lastLogin = localStorage.getItem("lastLog");
  var _logged = localStorage.getItem("logged");
  var _preferences = {
    metrica: localStorage.getItem("metrica"),
    distance: localStorage.getItem("distance")
  };

this.getID = function() {
  return _id;
}

this.getPicture = function() {
  return _picture;
}

this.getName = function() {
  return _name;
}

this.getBirthday = function() {
  return _birthday;
}

this.getOccupation = function() {
  return _occupation;
}

this.getCollege = function() {
  return _college;
}

this.getFBID = function() {
  return _fbid;
}

this.getAccessToken = function() {
  return _accessToken;
}

this.getAge = function() {
  return _age;
}

this.getDescription = function() {
  return _description;
}

this.getNotificationKey = function() {
  return _notificationKey;
}

this.getGender = function() {
  return _gender;
}

this.getEmail = function() {
  return _email;
}

this.getLastLogin = function(data) {
  return _lastLogin;
}
this.setLastLogin = function() {
  var tzoffset = (new Date()).getTimezoneOffset() * 60000;
  var lastEntry = (new Date(Date.now() - tzoffset)).toISOString().slice(0,19).replace('T', ' ');
  $.post( "http://thecoffeematch.com/webservice/update-entry.php?user_id=" + _id, { last_entry: lastEntry} );
  localStorage.setItem('lastLogin', lastEntry);
}

this.getLogged = function() {
  return _logged;
}

this.getPreferences = function() {
  return _preferences;
}

/*
    FUNÇÕES DE ORDEM PRÁTICA
*/

//Função privada que apenas renderiza os cards de usu´rios
  var renderPeople = function(data) {
  $("#columns").empty();
  for(i = 0; i < data.length; i++){

    if(data[i].distance < 1) {
      data[i].distance = '<1';
    }

    //Monta o DOM
    var line1 = '<figure id="'+data[i].id+'">'
       +'<div class="user-card">'
          +'<div class="row">'
             +'<div class="col-20 user-card open-profile" style="font-size: 12px; #596872; opacity: 0.6">'+data[i].distance+' Mi</div>'
             +'<div class="col-60 user-card user-card-profile open-profile"><img class="img-circle-plus" src="'+data[i].picture+'" /></div>'
             +'<div class="col-22 user-card hide-user" style="color: #596872; opacity: 0.6"><i class="f7-icons">close</i></div>'
          +'</div>'
          +'<div class="figure-body open-profile" style="text-align: center">'
             +'<h4 style="color: #596872; margin-bottom: 0">'+data[i].name+'</h3>'
             +'<p style="color: #596872; margin-top: 5px; font-size: 13px">'+data[i].occupation+'</p>'
          +'</div>'
       +'</div>'
    +'</figure>';
    $("#columns").append(line1);

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
      },error: function (request, status, error) {
        console.log(error);
      }
    });
  }
}

//Realiza a busca por usuários próximos e chama a função que renderiza no DOM
this.searchPeople = function () {
  //Faz request das informações dos users compatíveis
  var dados = {
      requester: _id
    }

  $.ajax({
            url: 'http://api.thecoffeematch.com/v1/users',
            type: 'get',
            dataType: 'json',
            data: dados,
            crossDomain: true,
            success: function (data) {

              //Renderiza no DOM
              renderPeople(data);
              myApp.pullToRefreshDone();

            },error: function (request, status, error) {
              console.log(error)
              myApp.pullToRefreshDone();
            }
    });
}

//Busca no BD se há notificações pendentes e coloca as bolinhas vermelhas nos ícones caso haja pendência
  this.getPendingNotifications = function(){
  var pnss = {
    user: _id
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
            $$(this).find("img").attr("src", "img/sino.PNG");
            var ndata = {
              invite: 0
            };
            $.ajax({
                url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + _id,
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
                url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + _id,
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
                url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + _id,
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
                url: 'http://thecoffeematch.com/webservice/update-pending-notifications.php?user=' + _id,
                type: 'post',
                data: ndata,
                success: function (data) {
                  mainView.router.loadPage("congratulations.html");
                }
            });
        }
      },
      error: function (request, status, error) {
       console.log(error)
      }
    });
}


  this.dislike = function(shown_user_id) {

    var dados = {
      user_id: _id,
      shown_user_id: shown_user_id,
      liked: 0
    }
    $.ajax({
      url: 'http://thecoffeematch.com/webservice/put-like.php',
      type: 'post',
      data: dados
    });
  }

  this.saveProject = function(projeto) {
    $.ajax({
      url: 'http://api.thecoffeematch.com/v1/projects',
      type: 'post',
      data: projeto,
      success: function(data) {
        console.log(data)
        renderNewProject(projeto);
        myApp.hideIndicator();
        myApp.closeModal(".popup-form", true);
      }, error: function (request, status, error) {
        myApp.hideIndicator();
        alert(error)
      }
    });
  }

  this.joinProject = function(project_id) {
    var user_id = _id;
    var dadosJoin = {
      project: project_id,
      joined_user: user_id
    }
    $.ajax({
      url: 'http://api.thecoffeematch.com/v1/users/join_project',
      type: 'post',
      data: dadosJoin,
      success: function(data) {
        console.log(data)
      }, error: function (request, status, error) {
        alert(error)
      }
    });
  }

}
