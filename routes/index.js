var express = require('express');
var bodyParser = require("body-parser");
var formidable = require('formidable');
var fs = require('fs-extra');
var util = require('util');
var path = require('path')

var bcrypt = require('bcryptjs');
var mailer = require('nodemailer');
var http = require('http')
session = require('express-session')
var User = require('../models/User');
var Post = require('../models/Post');



var router = express.Router();

smtpTrans = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: "metal.up.yf@gmail.com",
    pass: "M3t4lUP2020"
  }
});


//Route de connexion à la plateforme
router.get('/', function (req, res, next) {

  res.render('index', {
    title: 'Metal Up',
    image: "../images/logo.png"
  });
});

router.post('/', function (req, res, next) {


  //On récupère l'email et le mot de passe saisi par l'utilisateur
  email = req.body.email
  password = req.body.password


  //On recherche si un document contient l'email saisi précédemment

  User.findOne({
    "email": email
  }).then(function (user) {


    if (user) {
      if (user.active) {

        //Si un email à été trouvé on crypte le mot de passe saisi et on le compare à celui enregistré en base
        bcrypt.compare(password, user.password, function (err, result) {


          //Si les deux coincident 
          if (result) {


            if (email == "chrystel.alinc@gmail.com" || "jury.metalup@gmail.com") {
              role = "administrateur"
            } else {
              role = "user"
            }


            ssn = req.session;
            ssn.Id = user['_id']
            ssn.nom = user["nom"]
            ssn.prenom = user["prenom"]
            ssn.birthdate = user["birthdate"]
            ssn.ville = user["ville"]
            ssn.pays = user["pays"]
            ssn.genre = user["genre"]
            ssn.email = user["email"]
            ssn.friends = user["friends"]
            ssn.FriendsAsk = user["FriendsAsk"]
            ssn.askFriends = user["askFriends"]
            ssn.cheminfichier = user['cheminfichier']
            ssn.role = role


            User.findByIdAndUpdate({
              '_id': user['id']
            }, {
              $set: {
                'statut': true
              }
            }, function (err, user) {
              if (user['statut'] = true) {
                res.redirect('/profil/' + user['_id']);
              }

            })


          } else {
            req.toastr.error('Erreur de mot de passe ou d\'adresse email.', 'Erreur');
            res.redirect('/')
          }
        })
      } else {
        req.toastr.error('Compte pas activé!! Merci de cliquer sur le liens d\'activation dans le mail', 'Erreur')
        res.redirect('/')
      }
    } else {
      req.toastr.error('Erreur de mot de passe ou d\'adresse email', 'Erreur')
      res.redirect('/')
    }

  })

});
// Route donnant accès à la page "Home"
router.get('/home', function (req, res, next) {
  ssn = req.session;

  if (ssn.prenom) {
    var amis = ssn.friends

    function ami() {

      var result = []
      for (i = 0; i < amis.length; i++) {
        element = amis[i].id

        result.push(element)

      }
      return result


    }

    var tableau = ami();
    tableau.push(ssn.Id)


    //Revoir la recherche de post en fonction des amis
    Post.find({
      'authorId': tableau
    }, function (err, posts) {

      if (err) {
        console.log(err)
      }
      res.render('home', {
        'user': ssn,
        'posts': posts
      })

    }).sort({
      'dateFull': -1
    })







  } else {
    res.redirect('/');
  }
});
//Route permettant d'ajouter un post
router.post('/addPost', function (req, res, next) {
  a = req.body

  ssn = req.session;
  champs = []
  Files = []
  if (ssn.prenom) {

    if (req.method.toLowerCase() == 'post') {
      var form = new formidable.IncomingForm();
      form.multiples = false;
      form.maxFileSize = 30 * 1024 * 1024
      form.parse(req, function (err, fields, files) {
        //On récupère les champs du formulaire et/ou le fichier joint.

        champs.push(fields)

        Files.push(files)
      })


      form.on('progress', function (bytesReceived, bytesExpected) {

        var progress = {
          type: 'progress',
          bytesReceived: bytesReceived,
          bytesExpected: bytesExpected
        };

      });


      form.on('end', function (fields, files) {

        //On définit la date du post
        var today = new Date();

        var year = today.getFullYear()
        var day = today.getDate()
        var month = today.getMonth() + 1
        var hour = today.getHours()
        var minutes = today.getMinutes()
        var datePrint = day + "-" + month + "-" + year;

        //Si le fichier a une taille supèrieur à zéro
        if (Files['0']['attachement'].size > 0) {
          util.inspect({
            files: files
          });
          var re = /(?:\.([^.]+))?$/;
          //On récupère l'extension
          var nature = re.exec(Files['0'].attachement['name'])[1];

          //On la compare à une liste d'extensions autorisées
          switch (nature) {
            case 'jpg':
            case 'jpeg':
            case 'png':
              nature = "Image";
              break;
            default:
              nature = "document"
              return
          }
          if (nature != "document") {
            auteur = ssn.prenom + ' ' + ssn.nom
            // On définit le Poste
            Poste = {
              author: auteur,
              authorId: ssn.Id,
              authorAvatar: ssn.cheminfichier,
              date: datePrint,
              hour: hour,
              minutes: minutes,
              dateFull: today,
              content: champs['0'].post,
              extension: nature,
              cheminfichier: Files['0'].attachement['name']
            }
            //On définit le chemin d'accès temporaire
            var temp_path = this.openedFiles[0].path;
            //On définit le nom de fichier
            var file_name = this.openedFiles[0].name;
            // On définit le dossier de stockage du fichier sur le serveur
            var new_location = path.join(__dirname, '../uploads/');
            //On déplace le fichier dans le dossier définit avant
            fs.copy(temp_path, new_location + file_name, function (err) {
              if (err) {
                console.error(err)
              } else {
                //Si le déplacement à réussi on procède à l'insertion en base
                Post.create(Poste, function (err, post) {
                  if (err) throw err;
                  //res.redirect('/home')

                })
              }
            })



          }

        } else {
          console.log("champs" + champs['0'])
          if (champs['0'].link != "undefined") {

            extension = "link";
            link = "https://" + champs['0'].link;


            Poste = {
              author: ssn.prenom,
              authorId: ssn.Id,
              authorAvatar: ssn.cheminfichier,
              date: datePrint,
              hour: hour,
              extension: extension,
              link: link,
              minutes: minutes,
              dateFull: today,
              content: champs['0'].post
            }

            Post.create(Poste, function (err, post) {
              if (err) throw err;
              res.redirect('/home')

            })
          } else {
            Poste = {
              author: ssn.prenom,
              authorId: ssn.Id,
              date: datePrint,
              hour: hour,
              extension: extension,
              minutes: minutes,
              dateFull: today,
              content: champs['0'].post
            }
            Post.create(Poste, function (err, post) {
              if (err) throw err;
              console.log("post sans doc")
              res.redirect('/home')

            })

          }
        }






        return;
      })

    }
  }



});
//Route permettant de commenter un post
router.post('/addComment/:id', function (req, res, next) {
  ssn = req.session
  ssn = req.session;
  champs = []
  Files = []
  if (ssn.prenom) {

    if (req.method.toLowerCase() == 'post') {
      var form = new formidable.IncomingForm();
      form.multiples = false;
      form.maxFileSize = 30 * 1024 * 1024
      form.parse(req, function (err, fields, files) {
        champs.push(fields)
        Files.push(files)


        /* 
          console.log("nature")
          console.log(nature)


            
              
            
              Poste = {
                author:ssn.prenom,
                authorId: ssn.Id,
                date: datePrint,
                hour: hour,
                minutes: minutes,
                dateFull: today,
                content: fields.post,
                extension: nature,
                cheminfichier: files['attachement']['name']
              }*/

        //Post.create(Poste, (err, post) =>{

        // })



      })


      form.on('progress', function (bytesReceived, bytesExpected) {

        var progress = {
          type: 'progress',
          bytesReceived: bytesReceived,
          bytesExpected: bytesExpected
        };

      });


      form.on('end', function (fields, files) {


        var today = new Date();

        var year = today.getFullYear()
        var day = today.getDate()
        var month = today.getMonth() + 1
        var hour = today.getHours()
        var minutes = today.getMinutes()
        var datePrint = day + "-" + month + "-" + year;

        console.log("files")
        console.log(Files)


        if (Files['0'].attachement2.size > 0) {
          util.inspect({
            files: files
          });
          var re = /(?:\.([^.]+))?$/;

          var nature = re.exec(Files['0'].attachement2['name'])[1];


          switch (nature) {

            case 'jpg':
            case 'jpeg':
            case 'png':
              nature = "Image";
              break;

            default:
              nature = "document"
              return
          }
          if (nature != "document") {


            Poste = {
              userName: ssn.prenom,
              userId: ssn.Id,
              imgAuth: ssn.cheminfichier,
              date: datePrint,
              hour: hour,
              minutes: minutes,
              dateFull: today,
              content: champs['0'].post,
              extension: nature,
              cheminfichier: Files['0'].attachement2['name']
            }
            var temp_path = this.openedFiles[0].path;

            var file_name = this.openedFiles[0].name;




            var new_location = path.join(__dirname, '../uploads/');

            fs.copy(temp_path, new_location + file_name, function (err) {
              if (err) {
                console.error(err)
              } else {
                Post.findOneAndUpdate({
                  "_id": req.params.id
                }, {
                  $push: {
                    'comments': {
                      'author': Poste.author,
                      'userId': Poste.userId,
                      'imgAuth': Poste.imgAuth,
                      'date': Poste.date,
                      'hour': Poste.hour,
                      'minutes': Poste.minutes,
                      'dateFull': Poste.dateFull,
                      'content': Poste.content,
                      'extension': Poste.extension,
                      'cheminfichier': Poste.cheminfichier
                    }
                  }
                }, function (err, post) {
                  if (err) throw err;
                  res.redirect('/home')

                })
              }
            })



          }

        } else {
          extension = "Video"

          Poste = {
            author: ssn.prenom,
            userId: ssn.Id,
            imgAuth: ssn.cheminfichier,
            date: datePrint,
            hour: hour,
            minutes: minutes,
            extension: extension,
            link: champs['0'].link,
            dateFull: today,
            content: champs['0'].post
          }

          Post.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $push: {
              'comments': {
                'author': Poste.author,
                'userId': Poste.userId,
                'imgAuth': Poste.imgAuth,
                'date': Poste.date,
                'hour': Poste.hour,
                'minutes': Poste.minutes,
                'dateFull': Poste.dateFull,
                'link': Poste.link,
                'content': Poste.content
              }
            }
          }, function (err, post) {
            if (err) throw err;
            res.redirect('/home')

          })
        }







        return;
      })

    }
  }
})
//Route permettant de rechercher des amis
router.post('/searchFriends', function (req, res, next) {
  ssn = req.session
  if (ssn.prenom) {
    a = req.body


    if (a.friends != "") {
      res.redirect('/resultFriends/' + a.friends)

    }

  } else {
    res.redirect('/')
  }

});
//Route pemrettant d'afficher les résultats de la recherche d'un amis
router.get('/resultFriends/:user', function (req, res, next) {
  ssn = req.session
  if (ssn.prenom) {
    user = req.params.user
    console.log("user : " + user)

    function recherche(name) {
      var result = []
      Pers = name.length
      for (var i = 0; i <= Pers; i++) {
        recherche1 = user
        element = user.substring(i - 1, i).toUpperCase()
        console.log("element" + element)
        var element2 = recherche1.replace(user.substring(i - 1, i), element)
        result.push(element2)


      }
      return result
    }
    Pars = recherche(user)

    if (user != "") {
      User.find({
        'prenom': Pars
      }, {
        'prenom': 1,
        'cheminfichier': 1,
        'nom': 1
      }, function (err, data) {
        if (err) throw err

        res.render('resultFriends', {
          title: "Résultat de la recherche",
          "user": ssn,
          "data": data
        })
      })
    }
  }

});
//Route permettant d'ajouter un ami et de lui envoyer une notification par mail
router.get('/addFriends/:FriendsId', function (req, res, next) {
  ssn = req.session
  if (ssn.prenom) {

    friend = req.params.FriendsId
    User.findOne({
      '_id': ssn.Id
    }, {
      'FriendsAsk': {
        'id': friend
      }
    }, (err, user) => {
      if (user) {
        req.toastr.info('Invitation déjà envoyé');
        res.redirect('/home')
      } else {
        User.findByIdAndUpdate({
          '_id': ssn.Id
        }, {
          $push: {
            'askFriends': {
              'id': friend
            }
          }
        }, function (err, user) {
          if (user) {
            User.findOne({
              '_id': friend
            }, {
              'email': 1
            }, function (err, friend) {

              var ip = req.headers.host

              var mail = {
                from: "metal.up.yf@gmail.com",
                to: friend.email,
                subject: "Notification d'ajout ",
                html: '<h1 style="color: red">Amis</h1>' +

                  '<p> Vous avez une demande d\'ajout en attente</p>' +
                  '<img src="' + ssn.cheminfichier + '" class=\'avatar\'>' +
                  '<p>' + ssn.prenom + '</p>' +
                  '<a href="' + ip + '"/acceptNotif/ssn.Id>Accepter</a>' +

                  '<b> Have fun</b><br>'

              }
              smtpTrans.sendMail(mail, function (error, response) {
                if (error) {
                  throw error
                }

                smtpTrans.close();

                req.toastr.success('Félicitation un email de notification vient d\'être envoyé à votre destinataire. ')
                res.redirect('/home')
              })

            })




            User.findByIdAndUpdate({
              '_id': friend
            }, {
              $push: {
                'FriendsAsk': {
                  'id': ssn.Id
                }
              }
            }, function (err, user) {})
            req.toastr.info('Invitation envoyée')
            res.redirect('/home')

          }
        })

      }
    })
  }
});
//Route permettant d'accéder à la page profil d'un utilisateur ( à voir d'urgence problème visibilité post)
router.get('/profil/:id', function (req, res, next) {
  ssn = req.session
  if (ssn.prenom) {

    var id = req.params.id
    console.log("id" + id)
    Post.find({
      'authorId': id
    }, function (err, post) {
      if (post) {

        User.find({
          '_id': req.params.id
        }, {
          'prenom': 1,
          'nom': 1,
          'genre': 1,
          'ville': 1,
          'pays': 1,
          'friends': 1,
          'cheminfichier': 1,
          'presentation': 1,
          'email': 1,
          'coordonnees': 1,
          'birthdate': 1
        }, function (err, us) {

          if (us) {

            birthdateday = us['0'].birthdate
            year = birthdateday.substring(0, 4)
            month = birthdateday.substring(5, 7)
            day = birthdateday.substring(8, 10)


            function getAge(date) {
              var diff = Date.now() - date.getTime();
              var age = new Date(diff);
              return Math.abs(age.getUTCFullYear() - 1970);
            }
            var Age = getAge(new Date(year, month, day));

            var amis = us['0'].friends

            function ami() {

              var result = []
              for (i = 0; i < amis.length; i++) {
                element = amis[i].id

                result.push(element)

              }
              return result


            }
            Amis = ami()
            User.find({
              '_id': Amis
            }, {
              'prenom': 1,
              'nom': 1,
              '_id': 1,
              'cheminfichier': 1
            }, function (err, frie) {
              if (frie) {
                console.log("amis" + frie)


                res.render('profil', {
                  'user': ssn,
                  'postes': post,
                  'us': us,
                  'friends': frie,
                  'date': Age,
                  'identite': req.params.id
                })
              }
            })
          }


        })
      }

    })
  }


});
//rajouter des amis à  voir{
router.get('/friendAsk', function (req, res, next) {

  ssn = req.session
  Amis = []

  User.findOne({
    '_id': ssn.Id
  }, {
    'FriendsAsk.id': 1
  }, function (err, result) {
    console.log("result" + result)

    if (result.FriendsAsk) {
      var amis = result.FriendsAsk['0']
      console.log("amis" + amis)

      var tableau = Object.values(amis)





      User.find({
        '_id': tableau
      }, {
        '_id': 1,
        'username': 1,
        'cheminfichier': 1,
        'nom': 1,
        'prenom': 1
      }, function (err, user) {

        res.render('friendAsk', {
          'user': ssn,
          'Amis': user
        })
      })
    } else {
      req.toastr.info('Pas de demande d\'ajout en attente')
      res.redirect('/home')
    }




  })




});

// Route permettant de refuser l'ajout comme ami
router.get('/refuseNotif/:id', function (req, res, next) {
  id = req.params.id

  User.findByIdAndUpdate({
    '_id': ssn.Id
  }, {
    $unset: {
      'FriendsAsk': {
        'id': id
      }
    }
  }, function (err, user) {
    if (user) {
      User.findByIdAndUpdate({
        '_id': id
      }, {
        $unset: {
          'askFriends': {
            'id': ssn.Id
          }
        }
      }, function (err, user) {
        if (user) {
          res.redirect('/friendAsk')
        }


      })

    }
  })




})
// Route permettant d'accepter l'ajout comme ami
router.get('/acceptNotif/:id', function (req, res, next) {
  id = req.params.id

  User.findByIdAndUpdate({
    '_id': ssn.Id
  }, {
    $unset: {
      'FriendsAsk': {
        'id': id
      }
    }
  }, function (err, user) {
    if (user) {
      User.findOneAndUpdate({
        '_id': ssn.Id
      }, {
        $push: {
          'friends': {
            'id': id
          }
        }
      }, function (err, pos) {
        if (pos) {
          User.findByIdAndUpdate({
            '_id': id
          }, {
            $unset: {
              'askFriends': {
                'id': id
              }
            }
          }, function (err, user) {
            if (user) {
              User.findOneAndUpdate({
                '_id': id
              }, {
                $push: {
                  'friends': {
                    'id': ssn.Id
                  }
                }
              }, function (err, pas) {
                if (pas) {



                  res.redirect('/friendAsk')

                }
              })
            }

          })

        }

      })
    }
  })


})
//Route permettant de supprimer un commentaire sur 
router.get('/DelCom/:ComId/:PostId/profil', function (req, res, next) {


  Post.findOneAndUpdate({
    '_id': req.params.PostId
  }, {
    $pull: {
      'comments': {
        '_id': '' + req.params.ComId + ''
      }
    }
  }, function (err, post) {
    if (post) {
      console.log("Page")
      console.log(req.url)
      res.redirect('/profil/' + ssn.Id)
    }
  })
})
router.get('/DelCom/:ComId/:PostId/home', function (req, res, next) {


  Post.findOneAndUpdate({
    '_id': req.params.PostId
  }, {
    $pull: {
      'comments': {
        '_id': '' + req.params.ComId + ''
      }
    }
  }, function (err, post) {
    if (post) {
      console.log("Page")
      console.log(req.url)
      res.redirect('/home')
    }
  })
})
router.get('/DelCom/:PostId/home', function (req, res, next) {


  Post.findOneAndUpdate({
    '_id': req.params.PostId
  }, {
    $pull: {
      'comments': {
        '_id': '' + req.params.ComId + ''
      }
    }
  }, function (err, post) {
    if (post) {
      console.log("Page")
      console.log(req.url)
      res.redirect('/home')
    }
  })
})
router.get('/DelPost/:PostId/home', function (req, res, next) {


  Post.findOneAndRemove({
    '_id': req.params.PostId
  }, function (err, post) {
    if (post) {
      console.log("Page")
      console.log(req.url)
      res.redirect('/home')
    }
  })
})
router.get('/DelPost/:PostId/profil', function (req, res, next) {


  Post.findOneAndRemove({
    '_id': req.params.PostId
  }, function (err, post) {
    if (post) {
      console.log("Page")
      console.log(req.url)
      res.redirect('/profil/' + ssn.Id)
    }
  })
})
router.get('/ListFriends/:id', function (req, res, next) {
  ssn = req.session

  if (ssn.prenom) {
    if (ssn.Id == req.params.id) {
      Amis = []

      User.findOne({
        '_id': ssn.Id
      }, {
        'friends.id': 1
      }, function (err, result) {

        if (result.friends) {
          var amis = result.friends

          function ami() {

            var result = []
            for (i = 0; i < amis.length; i++) {
              element = amis[i].id

              result.push(element)

            }
            return result


          }

          var tableau = ami();
          console.log("tableau")
          console.log(tableau)
          User.find({
            '_id': tableau
          }, {
            '_id': 1,
            'prenom': 1,
            'cheminfichier': 1
          }, function (err, user) {

            res.render('ListFriends', {
              'user': ssn,
              'Amis': user
            })
          })
        } else {
          req.toastr.info('Pas d\'amis')
          res.redirect('/home')
        }




      })
    }


  }
})
//Route permettant de supprimer un ami de sa liste d'amis
router.get('/delFriends/:id', function (req, res, next) {
  ssn = req.session
  console.log(req.params.id)

  User.findOneAndUpdate({
    '_id': ssn.Id
  }, {
    $pull: {
      'friends': {
        'id': '' + req.params.id + ''
      }
    }
  }, function (err, friend) {
    if (friend) {

      User.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $pull: {
          'friends': {
            'id': '' + ssn.Id + ''
          }
        }
      }, function (err, up) {
        if (up) {
          res.redirect('/ListFriends/' + ssn.Id)
        }
      })

    }
  })
})







module.exports = router;