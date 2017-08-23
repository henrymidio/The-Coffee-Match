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
  }
}

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

this.getLastLogin = function() {
  return _lastLogin;
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
