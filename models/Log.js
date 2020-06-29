var mongoose = require('mongoose');




var LogSchema = mongoose.Schema({
    qui: {
        type: String,
        unique: false,
        required: true,
        trim: true
      },
      action:{
        type: String,
        unique: false,
        required: true
      },
      destinataire: {
        type: String,
        unique: false,
        required: true
      },
      date: {
        type: String,
        required: true
      },
      dateFull:{
        type: Date,
        required: true 
      }
});


var Log = mongoose.model("Log", LogSchema);
module.exports = Log;
