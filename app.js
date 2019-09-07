//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate');

const app= express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const users=[{
    email: "johnf@gmail.com",
    password: "1234",
    name: "John Feris",
    profilePic: "howdy.jpg",
    desc: "Computer Scientist",
    skills: ["js","node"],
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
]

mongoose.connect("mongodb://localhost:27017/devlinkDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
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

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render('home');
});

app.get("/log", function(req,res){

    const contacts = users[users.map(x => x.email ).indexOf("johnf@gmail.com")].connections;
    console.log("\n\n\n"+contacts);
    const friends=[];
    contacts.forEach(function(contact){
        const fullContact = users[users.map(x => x.email).indexOf(contact)];
        friends.push(fullContact)
    });
    console.log(friends);




    res.render('loggedin',{persona:"johnf@gmail.com", friends:friends});

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
      });
    }
  });
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(3000,function(){
    console.log("listening on port 3000");
});
