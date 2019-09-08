//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config()
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const SendBird = require("sendbird");

const sb = new SendBird({appId: process.env.APP_ID});

const app= express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "MaryHadALittleLamb",
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

const users=[{
    email: "johnf@gmail.com",
    password: "1234",
    name: "Martin Wnorowski",
    profilePic: "default-pic.jpg",
    desc: "Hi my name is Martin I like to study all the time, and get shit done. come join me on my adventure to build something cool",
    skills: ["js","node","flask","basketweaving","php","cloud","gcp","aws","react"],
    interests: ["cows","walking"],
    links: ["me.dev"],
    connections: ["erikw@gmail.com", "rubenu@gmail.com"]
},
{
    email: "erikw@gmail.com",
    password: "abcd",
    name: "Erik Whitaker",
    profilePic: "default-pic.jpg",
    desc: "Web Dev",
    skills: ["js","flask"],
    interests: ["cows","running"],
    links: ["me.dev"],
    connections: ["johnf@gmail.com"]
},{
    email: "rubenu@gmail.com",
    password: "abcd",
    name: "Ruben Uribe",
    profilePic: "default-pic.jpg",
    desc: "Web Dev",
    skills: ["js","flask"],
    interests: ["cows","running"],
    links: ["me.dev"],
    connections: ["johnf@gmail.com"]
}
];

mongoose.connect("mongodb://localhost:27017/devlinkDB", {useNewUrlParser: true});





const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  // name: String,
  // profilePic: String,
  // desc: String,
  // skills: [],
  // interests: [],
  // links: [],
  // liked: [],
  // connections: []
});

// User1.save();

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/devlink",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
    res.render('home');
});

app.get("/log", function(req,res){
    const contacts = users[users.map(x => x.email ).indexOf("johnf@gmail.com")].connections;
    const persona = users[users.map(x => x.email ).indexOf("johnf@gmail.com")];
    console.log("\n\n\n"+contacts);
    const friends=[];
    contacts.forEach(function(contact){
        const fullContact = users[users.map(x => x.email).indexOf(contact)];
        friends.push(fullContact)
    });
    console.log(friends);
    res.render('loggedin',{persona:persona, friends:friends});

});

app.get("/register", function(req,res){
    res.render('register');
  });

  app.post("/register", function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/log");
        });
      }

    });
  });


  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
  );

  app.get('/auth/google/devlink',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/log');
    });

app.get("/login", function(req,res){
  res.render("login")
});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/log");
        console.log(req.user.username);
      });
    }
  });

});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

// app.get("/connect", function(req,res){
//   currentUser = req.user.username;
//
//   sb.connect(currentUser, function(user, error) {
//     if (error) {
//         return;
//       }
//
//   });
//
//   sb.OpenChannel.createChannel(function(openChannel, error) {
//     if (error) {
//         return;
//     }
// });
//
// });




app.listen(3000,function(){
    console.log("listening on port 3000");
});
