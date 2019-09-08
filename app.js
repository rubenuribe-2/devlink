//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app= express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.set('origins', '*:*');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate');

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
    desc: "Hi my name is Martin I like to get shit done. come join me on my adventure to build something cool",
    skills: ["js","node","flask","basketweaving","php","cloud","gcp","aws","react"],
    interests: ["smoking","chorizo and egg"],
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
    interests: ["cows","eating"],
    links: ["me.dev"],
    connections: ["johnf@gmail.com"]
}
];

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

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render('home');
});
app.get("/log", function(req,res){
    const contacts = users[users.map(x => x.email ).indexOf("johnf@gmail.com")].connections;
    const persona = users[users.map(x => x.email ).indexOf("johnf@gmail.com")];
    const friends=[];
    contacts.forEach(function(contact){ 
        const fullContact = users[users.map(x => x.email).indexOf(contact)];
        friends.push(fullContact)
    });
    res.render('loggedin',{persona:persona, friends:friends});
    
    const server=io.of('/').on('connection',function(socket){
        console.log(`connected to ${socket.id}`);
        socket.on('discover',function(id,user){
            console.log(`discover requested by ${id}`);



            //parse and remove connections


            socket.emit('discover',users);//send the data that is needed for discover
        });
        socket.on('profile',function(id,profile){
            console.log(`profile requested by ${id} for ${profile}`);
            //change to mongoose
            const sendProfile=users[users.map(x=>x.email).indexOf(profile)];




            //get the profile data for the given person
            socket.emit('profile',sendProfile);//send the profile data
        });
        socket.on('message',function(id,message){
            console.log(`message requested by ${id}`);
            //send the user they want to talk to
            socket.to(id).emit('message');//send the data that is needed for message
        });
    });
    

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








http.listen(process.env.PORT || 3000, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Server Started");
    }
});







// app.listen(3000,function(){
//     console.log("listening on port 3000");
// });
