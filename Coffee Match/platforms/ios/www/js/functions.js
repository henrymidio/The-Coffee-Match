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

function setIndexEvents() {
  //Evento que expande projeto
  $(document.body).on('click', '.open-card', function () {
      $$('.floating-button').addClass('none');
      var project_id = $(this).attr('id');
      localStorage.setItem("project_id", project_id);
      mainView.router.loadPage("project.html");
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
    var self = $(this);
    myApp.confirm('Você não poderá visualizar este perfil novamente', '', function () {
     self.parent().closest('figure').fadeOut(500,function(){
        $(this).css({"visibility":"hidden",display:'block'}).slideUp();
        var suid = $(this).attr('id');
        usuario.dislike(suid)
      });
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

  // Pull to refresh content
  $(document).on('ptr:refresh', '.pull-to-refresh-content', function (e) {
    usuario.searchPeople();
    usuario.getPendingNotifications();
    $("#tab2").empty();
    retrieveProjects();
  });

  //Evento que deleta chips
  $(document.body).on('click', '.chip-delete', function (e) {
    e.preventDefault();
    var chip = $$(this).parents('.chip');
    chip.remove();
  });

  //Evento de criação de novo projeto
  $(document.body).on('click', '.save-project', function (e) {
    myApp.showIndicator();
    var projectName        = $('#project-name').val();
    var projectCategory    = $('#project-category').find(":selected").text();
    var projectDescription = $('#project-description').val();
    var projectSkills = $('.project-skill').map(function() {
        return $(this).text();
    }).get();
    //projectSkills.join(',')

    var projeto = {
      name: projectName,
      category: projectCategory,
      description: projectDescription,
      looking_for: projectSkills,
      owner: usuario.getID(),
      image: 'https://careers.adage.com/images/310/default/why-advertising-urgently-needs-more-weird-or-the-dark-side-of-agency-culture-_201705302125483.png'
    };

    /*
    if(projectCategory == 'Advertising, Content & Media') {
      projeto.image = 'http://instratmedia.com/wp-content/uploads/2016/01/Social-media-advertising-trends-2014.jpg';
    }
    if(projectCategory == 'Health') {
      projeto.image = 'http://hlknweb.tamu.edu/sites/hlknweb.tamu.edu/files/styles/main_page_photo/public/health%20check.jpg?itok=aAKbZUcC';
    }
    if(projectCategory == 'Fintech') {
      projeto.image = 'http://magodomercado.com/wp-content/uploads/2014/08/como-investir-na-bolsa-de-valores.jpg';
    }
    */
    //Valida os inputs
    if(projectName < 1 || projectCategory < 1 || projectDescription < 1 || projectSkills < 1) {
      alert("Preencha todos os campos");
      myApp.hideIndicator();
      return false;
    } else {
      usuario.saveProject(projeto);
    }

  });

}

function renderNewProject(projeto, fromBD) {
  var projectDate = new Date(projeto.created.replace(/\s/, 'T'));
  projectDate = formatDate(projectDate);
  var skills = '';
  var icon = '<i class="f7-icons color-gray">chevron_right</i>';

  if(fromBD) {
    projeto.looking_for = projeto.looking_for.split(",");
  }
    projeto.looking_for.forEach(function(entry) {
      skills += '<div class="chip" style="margin-right: 3px">'
                +'<div class="chip-label">'+entry+'</div>'
                +'</div>';
    });

    //Verifica se já deu join no projeto para marcar o check
    try {
      projeto.joined_users.forEach(function(entry) {
          if(entry.joined_user == usuario.getID()) {
            icon = '<i class="f7-icons" style="color: #00aced">check</i>';
          }
      });
    } catch(error) {

    }


    var shortDescription = projeto.description.replace(/^(.{90}[^\s]*).*/, "$1");; //replace with your string.


  //Monta o DOM dos chips
  var line = '<div id="'+projeto.id+'" class="card demo-card-header-pic open-card">'
     +'<div style="background-image:url('+projeto.image+')" valign="center" class="card-header color-white no-border">'
     +'<p class="project-name">'+projeto.name+'<br><span style="font-size: 15px">'+projeto.category+'</span></p>'
     +'<div class="project-owner">'
           +'<img src="'+projeto.owner_picture+'" />'
           +'<span style="font-size: 13px; text-shadow: 1px 1px 2px #000000; margin-left: 3px">'+projeto.owner_name+'</span>'
        +'</div>'
     +'</div>'
     +'<p class="color-gray" style="padding: 8px 15px; padding-top: 0">'
        +'<small>Posted on '+projectDate+'</small>'
        +'<a href="#" style="float: right">'+icon+'</a>'
     +'</p>'
     +'<div class="card-content">'
        +'<div class="card-content-inner">'
           +'<p class="project-description">'+shortDescription+'...</p><hr>'
           +'<p class="color-gray"><i class="f7-icons" style="font-size: 12px; margin-right: 3px">search</i> Looking for</p>'
           +'<div class="skills" style="margin-top: -10px">'
           +skills
           +'</div>'
        +'</div>'
     +'</div>'
  +'</div>';
 $("#tab2").prepend(line);

 $('#ctb').toggleClass('invisible');
 $('.tabs-animated-wrap').height('auto')
 cleanProjectForm();
}

function cleanProjectForm() {
    $('#project-name').val('');
    $('#project-category option:eq(0)').prop('selected', true)
    $('#project-description').val('');
    $('.container-chip').empty()
  }

function configSidePanel() {
  var pic = usuario.getPicture();
  $$(".profile-photo").attr("src", pic);
  $$("#name").html(usuario.getName());
  $$("#age").html(usuario.getAge());
}

function retrieveProjects() {
  $.ajax({
    url: 'http://api.thecoffeematch.com/v1/projects',
    type: 'get',
    dataType: 'json',
    success: function (data) {

      for(i in data) {
        //console.log(data[i])
        renderNewProject(data[i], true);
      }
    }
  });
}
