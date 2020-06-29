var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');



var messageSchema = mongoose.Schema({
    author:{
        type:String,
        required: true
    },
    content:{
        type:String
    },
    destinataire:{
        type: String,
        required: true

    }


})

var Message = mongoose.model("Message", messageSchema);
module.exports = Message;