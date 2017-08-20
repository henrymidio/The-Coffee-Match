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
                myApp.hideIndicator();
                myApp.pullToRefreshDone();
                myApp.alert('We are sorry! There’s no one registered near you. Come back later and try again.', 'The Coffee Match');
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

  //Seta pull refresh
  // Pull to refresh content
  var ptrContent = $$('.pull-to-refresh-content');
  var requester = localStorage.getItem('user_id');
  // Add 'refresh' listener on it
  ptrContent.on('ptr:refresh', function (e) {

      getUserList(requester)

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
