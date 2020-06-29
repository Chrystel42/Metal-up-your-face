const express = require("express"),
  flash = require("connect-flash");
require("dotenv").config(),
  //,session = require('express-session')
  (cookieParser = require("cookie-parser")),
  (toastr = require("express-toastr"));
var createError = require("http-errors");
let exec = require("child_process").exec;
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var http = require("http");
var formidable = require("formidable");
var User = require("./models/User");
var Post = require("./models/Post");
//var server = app.listen(80);
//Bonjour

var mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);
var db = mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
});

mongoose.connection.on("error", function () {
  console.log("Erreur de connexion à la base de données");
});
mongoose.connection.on("open", function () {
  console.log("Connexion réussie à la base de données");
});

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

//app.set('trust proxy', 1) // trust first proxy
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true,
});
var sharedsession = require("express-socket.io-session");

app.use(session);
io.use(
  sharedsession(session, {
    autoSave: true,
  })
);

var UsersOnline = [];
io.on("connection", (socket) => {
  var session = socket.handshake.session;
  var date = Date();
  //statistiques affichées en page d'accueil
  if (!session.Id) {
    Post.countDocuments({}, function (err, doc) {
      socket.emit("nbreDoc", doc);
    });
    User.countDocuments({}, function (err, resultat) {
      socket.emit("nbreUserOnline", resultat);
    });
  } else {
    console.log("Session friends" + session.FriendsAsk);

    user = {
      name: session.prenom,
      ID: session.Id,
      socketId: socket.id,
    };

    UsersOnline.push(user);

    function ami() {
      var a = session.friends;
      for (property1 in a) {
        result = [];
        //console.log(` ${a[property1].id}`);
        for (property2 in UsersOnline) {
          if (` ${UsersOnline[property2].ID}` == ` ${a[property1].id}`) {
            friend = {
              id: ` ${UsersOnline[property2].ID}`,
              username: ` ${UsersOnline[property2].name}`,
              socketId: ` ${UsersOnline[property2].socketId}`,
            };
            result.push(friend);
          }
        }
        return result;
      }
    }
    amis = ami();
    socket.broadcast.emit("amisOnline", amis);

    Post.find({}, {
        author: 1,
        date: 1,
        hour: 1,
        minutes: 1,
        authorId: 1,
      },
      function (err, side) {
        console.log("side" + side);
        socket.emit("PostOnLine", side);
      }
    );
    User.find({}, {
        _id: 1,
        prenom: 1,
        nom: 1,
        statut: 1,
        email: 1,
      },
      function (err, use) {
        socket.emit("UserRecap", use);
      }
    );
  }
});
app.use(flash());

// Load express-toastr
// You can pass an object of default options to toastr(), see example/index.coffee
app.use(toastr());

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.static(__dirname + "/uploads"));
app.use(express.static(__dirname + "/public"));

/*app.use(fileUpload());*/

var indexRouter = require("./routes/index");
//var adminRouter = require('./routes/admin');
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");

app.use(function (req, res, next) {
  res.locals.toasts = req.toastr.render();
  next();
});

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
//app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
console.log(Date());

console.log("Starting..........");
try {
  server.listen(process.env.PORT || 80, function () {
    console.log("serveur à l'écoute sur 80");
  });
} catch (error) {
  console.log(error);
}


module.exports = server;