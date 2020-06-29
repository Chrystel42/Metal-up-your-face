var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');



var postSchema = mongoose.Schema({
    author: {
        type: String,
        required: true,
        
      },
      authorId: {
        type: String,
        required: true
      },
      authorAvatar:{
        type: String,
        required: true
      },
      date:{
        type: String,
        required: true
      },
      hour:{
        type: String,
        required: true
      },
      minutes:{
        type: String,
        required: true
      },
      dateFull:{
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      cheminfichier: {
        type: String
      },
      extension: {
        type: String
      },
      link:{
        type:String
      },
      comments: [
        {
          author : {
            type: String,
            required: true
          },
          userId : {
            type: String,
            required: true
          },
          imgAuth:{
            type: String,
            required: true

          },
          date:{
            type: String,
            required: true
          },
          hour:{
            type: String,
            required: true
          },
          minutes:{
            type: String,
            required: true
          },
          datFull:{
            type: String,
            required: true
          },
          content: {
            type: String,
            unique: false,
          },
          cheminfichier: {
            type: String
          },
          extension: {
            type: String
          },
          link:{
            type:String
          },

        }
      ]
      
});


var Post = mongoose.model("Post", postSchema);
module.exports = Post;
