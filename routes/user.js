var express = require('express');
var bodyParser = require("body-parser");
var formidable = require('formidable');
var fs = require('fs-extra');
var util = require('util');
var path = require('path')
var bcrypt = require('bcryptjs');
var mailer = require('nodemailer');
var http = require('http');
session = require('express-session');
var User = require('../models/User');
var Doc = require('../models/Post');

const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: "dbd0txbul",
  api_key: '639339822344681',
  api_secret: '-g4XMeb1xmJfq_eGXRY9pxqIiwc'
})

var router = express.Router();

UserData = [];

smtpTrans = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: "metal.up.yf@gmail.com",
    pass: process.env.METALUP_MDP
  }
});
router.get('/createCount', function (req, res, next) {
  res.redirect('/')
})

//Route permettant de stocker le nouvel utilisateur en base
router.post('/createCount', function (req, res, next) {



  //if (req.url === '/' && req.method.toLowerCase() === 'post') {
  var form = new formidable.IncomingForm();
  Files = []
  Fields = []

  form.parse(req, function (err, fields, files) {
    Fields.push(fields)
    Files.push(files)
  })

  form.on('progress', function (bytesReceived, bytesExpected) {

    var progress = {
      type: 'progress',
      bytesReceived: bytesReceived,
      bytesExpected: bytesExpected
    };
    console.log(progress)

  });

  form.on('end', function (fields, files) {
    console.log(Fields['0'])

    // cloudinary.uploader.upload(
    //   files.path, {
    //     public_id: `user_pictures/${files.filename}`,
    //     tags: `blog`,
    //     invalidate: true
    //   },
    //   // directory and tags are optional
    //   function (err, image) {
    //     if (err) return res.send(err)
    //     console.log('file uploaded to Cloudinary')
    //   })

    User.findOne({
      'email': Fields['0'].email
    }, (err, result) => {
      if (result) {


        req.toastr.error('Utilisateur déjà existant')

        res.redirect('/')
      } else {

        if (Fields['0'].password == Fields['0'].Confpassword) {

          if (Fields['0'].email == "chrystel.alinc@gmail.com" || "jury.metalup@gmail.com") {
            role = "Administrateur"
          } else {
            role = "User"
          }

          /*if(Files['upload'].size >'0'){
              Files.push(files)
          }*/
          var today = new Date();

          var year = today.getFullYear()
          var day = today.getDate()
          var month = today.getMonth()
          var datePrint = day + "-" + month + "-" + year;

          var temp_path = Files['0']['upload']['path'];
          
          var file_name = Files['0']['upload']['name'].toString().split('.')[0];
          var picture_link;
          var userData;
          console.log(Files['0']['upload']['name'])
          console.log(file_name)
          function res_promise() {
            return new Promise((resolve, reject) => {
              cloudinary.uploader.upload(
                temp_path, {
                  public_id: `user_pictures/${file_name}`,
                  tags: `blog`,
                  invalidate: true
                },
                // directory and tags are optional
                function (err, image) {
                  if (err) return res.send(err)
                  console.log('file uploaded to Cloudinary')
                  picture_link = image.url;
                  resolve()
                })
            })
          }
          res_promise().then(() => {
            userData = {
              prenom: Fields['0'].prenom,
              nom: Fields['0'].nom,
              password: Fields['0'].password,
              birthdate: Fields['0'].birthDate,
              email: Fields['0'].email,
              genre: Fields['0'].gender,
              ville: Fields['0'].ville,
              pays: Fields['0'].pays,
              presentation: Fields['0'].presentation,
              statut: 0,
              active: 0,
              role: role,
              cheminfichier: picture_link,
              date: datePrint,
              dateFull: today
            }
            
            User.create(userData, function (err, user) {
                  var ip = req.headers.origin
                  var mail = {
                    from: "metal.up.yf@gmail.com",
                    to: Fields['0'].email,
                    subject: "votre mot de passe sur le réseau social",
                    html: '<h1 style="color: red">Création de compte sur le réseau</h1>' +
  
                      '<p> Votre compte vient d\'être créé sur le réseau. Pour vous connecter, cliquez sur le liens suivants pour activer votre compte: ' + ip + '/user/validateCount/' + user.id + '</p>' +
  
                      '<b> Have fun</b><br>'
  
                  }
                  smtpTrans.sendMail(mail, function (error, response) {
                    if (error) {
                      throw error
                    }
                    console.log("success email")
                    smtpTrans.close();
                    req.toastr.success('Félicitation un email vient de vous être envoyé. Merci de cliquer sur le lien pour activer votre compte')
                    res.redirect('/')
  
  
  
                  })
              })
            })


          //return 
        }
      }

    })




    return


  })

  // }

});
router.get('/validateCount/:id', function (req, res, next) {
  id = req.params.id
  if (id != "") {
    User.findByIdAndUpdate({
      '_id': id
    }, {
      $set: {
        'active': true
      }
    }, function (err, user) {
      if (err) throw err
      res.redirect('/')
    })
  }

})
router.get('/reinit', function (req, res, next) {
  res.render('forgot', {
    'title': 'mot de passe oublié'
  })
})
router.post('/reinit', function (req, res, next) {
  a = req.body

  if (a.email != "") {


    User.findOne({
      'email': a.email
    }, function (err, user) {


      var ip = req.headers.origin
      var mail = {
        from: "metal.up.yf@gmail.com",
        to: user['email'],
        subject: "Réinitialiser le mot de passe sur le réseau",
        html: '<h1 style="color: red">Réinitialiserle mot de passe de compte sur le réseau</h1>' +

          '<p>  Pour réinitialiser le mot de passe veuillez cliquer sur le lien suivant:' + ip + '/user/forgot/' + user.id + '</p>' +

          '<b> Have fun</b><br>'


      }
      smtpTrans.sendMail(mail, function (error, response) {
        if (error) {
          throw error
        } else {
          req.toastr.success('Un email vient de vous être envoyé. Merci de cliquer sur le liens de réinitialisation')
          res.redirect('/')
        }
        smtpTrans.close();


      })
    })


  }
})
router.get('/forgot/:id', function (req, res, next) {
  id = req.params.id

  if (id != "") {
    User.findById({
      '_id': id
    }, function (err, user) {

      res.render('reinit', {
        'user': user
      })
    })
  }

})

router.post('/forgot/:id', function (req, res, next) {
  a = req.body
  b = req.params.id
  console.log("password")
  console.log(a.password)
  console.log("confirmation password")
  console.log(a.confPassword)

  if (a.password == a.confPassword) {
    bcrypt.hash(a.password, 10, function (err, hashe) {
      User.findByIdAndUpdate({
        '_id': b
      }, {
        $set: {
          'password': hashe
        }
      }, function (err, user) {
        if (err) {
          throw err
        }
        if (user) {
          req.toastr.info('Mot de passe mis à jour')
          res.redirect('/')
        }

      })
    })
  }


  /*if(a.password == a.confPassword){
    console.log("user")
    
    bcrypt.hash(a.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      a.password = hash;
      console.log(hash)
      
     
    })
    console.log(hash)
    User.findByIdAndUpdate({'_id': b},{$set:{'password': hash}, function(err, user){
      
    }})
    res.redirect('/')*/
  /*User.findByIdAndUpdate({'_id': b},{$set:{'password': hash}, function(err, user){
    console.log(user)
  }})
  console.log(hash)
  res.redirect('/')*/


  /* }else{
     res.redirect('/user/forgot/'+b)
   }*/

})

//Route permettant de se déconnecter
router.get('/logout', function (req, res, next) {
  ssn = req.session
  if (ssn.prenom) {

    var today = new Date();


    var year = today.getFullYear()
    var day = today.getDate()
    var month = today.getMonth() + 1
    var hour = today.getHours()
    var minutes = today.getMinutes()
    var datePrint = day + "-" + month + "-" + year;
    // delete session object
    User.findOneAndUpdate({
      '_id': ssn.Id
    }, {
      "statut": false,
      'derniereDéco': today
    }, function (err, user) {
      if (err) {
        throw (err)
      }

      req.session.destroy(function (err) {
        if (err) {
          throw (err);
        } else {
          res.redirect('/');
        }
      });
    })
    //res.redirect('/')

  } else {
    res.redirect('/');
  }

});

//Route permettant la mise à jours de l'utilisateur
router.post('/update/:id', function (req, res, next) {
  a = req.params

  var form = new formidable.IncomingForm()




  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log(err)
    }

    util.inspect({
      fields: fields,
      files: files
    });



    if (files['upload'].size == 0) {
      console.log("pas de fichier")

      user = {
        username: fields.username,
        presentation: fields.presentation,
        birthdate: fields.birthdate,
        email: fields.email,
        coordonnees: fields.coordonnees

      }

      User.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          'username': user.username,
          'presentation': user.presentation,
          'birthdate': user.birthdate,
          'email': user.email,
          'coordonnees': user.coordonnees
        }
      }, function (err, user) {
        if (user) {
          res.redirect('/profil/' + req.params.id)
        }
      })
    } else {

      user = {
        username: fields.username,
        presentation: fields.presentation,
        birthdate: fields.birthdate,
        email: fields.email,
        cheminfichier: files['upload']['name']

      }


      User.findOneAndUpdate({
        '_id': req.params.id
      }, {
        $set: {
          'username': user.username,
          'presentation': user.presentation,
          'birthdate': user.birthdate,
          'email': user.email,
          'coordonnees': user.coordonnees,
          'cheminfichier': user.cheminfichier
        }
      }, function (err, user) {
        if (user) {

          var temp_path = files['upload'].path;

          var file_name = files['upload'].name;

          var new_location = path.join(__dirname, '../uploads/');

          fs.copy(temp_path, new_location + file_name, function (err) {
            if (err) {
              console.error(err)
            } else {
              console.log("success")
              res.redirect('/profil/' + req.params.id)



            }
          })

        }
      })

    }
  })


  /*form.on('progress', function (bytesReceived, bytesExpected) 
              {
      
                var progress = 
                {
                  type: 'progress',
                  bytesReceived: bytesReceived,
                  bytesExpected: bytesExpected
                };
                
                
              });*/
  /*form.on('end', function (fields, files) {
    
    console.log(Fichiers[0]['upload'].name)
    if (Fichiers = ""){
      User = {
        'username': Formulaire[0].username,
        'presentation': Formulaire[0].presentation,
        'birthdate': Formulaire[0].birthdate,
        'coordonnees': Formulaire[0].coordonnees
      }
      User.findOneAndUpdate({'_id': req.params.id}, {$set:{'username': user.username, 'presentation': user.presentation, 'birthdate':user.birthdate, 'email':user.email, 'coordonnees': user.coordonnees }}, function(err, user){
        if (user){
          console.log("user1")
          console.log(user)

        }
      })

    }else{

      user = {
        'username': Formulaire[0].username,
        'presentation': Formulaire[0].presentation,
        'birthdate': Formulaire[0].birthdate,
        'coordonnees': Formulaire[0].coordonnees,
        'cheminfichier': Fichiers[0].upload['name']
        
      }
    console.log("user")
    console.log(user)


            
      var temp_path = this.openedFiles[0].path;
      
      var file_name = this.openedFiles[0].name;
      
      var new_location = path.join(__dirname, '../uploads/'); 
    
      fs.copy(temp_path, new_location + file_name, function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log("success")
          res.redirect('/profil/'+ req.params.id)
          
         
          
        }
      })
       
      return 
    }
  })*/



})





module.exports = router;