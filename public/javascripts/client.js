/*global io*/
var socket = io();
$('#Login form').submit(function (e) {
    alert("ahahah")
    e.preventDefault();
    var user = {
      username : $('#Login email').val().trim()
    };
    if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
      socket.emit('user-login', user);
      $('body').removeAttr('id'); // Cache formulaire de connexion
      $('#chat input').focus(); // Focus sur le champ du message
    }
  });