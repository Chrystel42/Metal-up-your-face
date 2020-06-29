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
var Post = require('../models/Post');

var router = express.Router();

router.get('/', function (req, res, next) {
  ssn = req.session
  if( ssn.prenom && ssn.role == "administrateur"){
    
    Post.find({},{'author':1, 'date': 1, 'hour': 1, 'minutes': 1}, (err, posts) =>{
      if(err) throw err

    User.find({}, function(err, users){
      if(err) throw err
     
    
    
    res.render('admin',{'user': ssn, 'users': users,'posts': posts})
  })
})

  }

  
  });
router.get('/deletePost/:id', function(req, res, next){
  ssn = req.session
  if(ssn.prenom){
    var id = req.params.id
    if(id != ""){
      Post.findOneAndRemove({'_id': id}, function(err, result){
        if(err) throw err
        if(result){
          res.redirect('/admin')
        }
      })
    }
  }
})
router.get('/deleteUser/:id', function(req, res, next){
  ssn = req.session
  if(ssn.prenom){
    var id = req.params.id
    if(id != ""){
      User.findOneAndRemove({'_id': id}, function(err, result){
        if(err) throw err
        if(result){
          res.redirect('/admin')
        }
      })
    }
  }else{
    res.redirect('/')
  }
})
router.get('/viewUser/:id', function(req, res, next){
  ssn= req.session
  if(ssn.prenom){
    User.findOne({'_id': req.params.id}, function(err, user){
      console.log("USER")
      console.log(user)
      res.render('user', {'title':'Mise à jour utilisateur', 'pers': user})
    })

  }else{
    res.redirect('/')
  }
})

  module.exports = router;