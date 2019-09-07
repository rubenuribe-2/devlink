//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app= express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/devlinkDB", {useNewUrlParser: true});

const userSchema = {
  email: String,
  // password: String,
  // name: String,
  // profilePic: String,
  // desc: String,
  // skills: [],
  // interests: [],
  // links: [],
  // liked: [],
  // connections: []
};

const User = mongoose.model("User", userSchema);

const User1 = new User({
  email: "yaw yeet"
});

User1.save();





app.get("/",function(req,res){
    res.render('home');
});















app.listen(3000,function(){
    console.log("listening on port 3000");
});
