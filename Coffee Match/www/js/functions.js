function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "March",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();

  return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

function getUserList(requester) {

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
              $("#columns").empty();
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
                    myApp.hideIndicator();
                    myApp.pullToRefreshDone();
                    //alert(JSON.stringify(request));
                    console.log(error)
                  }
                });
              }

              myApp.hideIndicator();
              myApp.pullToRefreshDone();

              getPendingNotifications();

            },error: function (request, status, error) {
              myApp.hideIndicator();
              myApp.pullToRefreshDone();
              //alert(JSON.stringify(request));
              console.log(error)
            }
          });

}

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
       console.log(error)
      }
    });
}
