//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const PassportLocalMongoose = require("passport-local-mongoose");

const homeStartingContent = "This is a blogging website built using mainly ExpressJs, MongoDB and core javascript. HTML and CSS are also added wherever required. This website is protected by authentication system which uses sessions and cookies using Passport.js. ";
const aboutContent = "WordPress started in 2003 when Mike Little and Matt Mullenweg created a fork of b2/cafelog. The need for an elegant, well-architected personal publishing system was clear even then. Today, WordPress is built on PHP and MySQL, and licensed under the GPLv2. It is also the platform of choice for over 43% of all sites across the web.The WordPress open source project has evolved in progressive ways over time — supported by skilled, enthusiastic developers, designers, scientists, bloggers, and more. WordPress provides the opportunity for anyone to create and share, from handcrafted personal anecdotes to world-changing movements. People with a limited tech experience can use it “out of the box”, and more tech-savvy folks can customize it in remarkable ways.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const termsContent = "Like most website operators, WordPress.org collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. WordPress.org’s purpose in collecting non-personally identifying information is to better understand how WordPress.org’s visitors use its website. From time to time, WordPress.org may release non-personally-identifying information in the aggregate, e.g., by publishing a report on trends in the usage of its website.WordPress.org also collects potentially personally-identifying information like Internet Protocol (IP) addresses. WordPress.org does not use IP addresses to identify its visitors, however, and does not disclose such information, other than under the same circumstances that it uses and discloses personally-identifying information, as described below.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://${process.env.user}:${process.env.password}@cluster0.v7qiaaj.mongodb.net/test`);


const random = (length = 8) => {
  // Declare all characters
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Pick characers randomly
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
}); 

userSchema.plugin(PassportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = {
  _id: String,
  title: String,
  content: String
}; 

const Post = mongoose.model("Post", postSchema);

app.get("/home", function(req,res){

  Post.find({}, function(err, posts){
    if(req.isAuthenticated()){
      res.render("home", {home_Content: homeStartingContent, posts: posts});
    }
    else{
      res.redirect("/login");
    }
  });
});

app.get("/compose", function(req,res){

  Post.find({}, function(err, posts){
    if(req.isAuthenticated()){
    res.render("compose");
    }
    else{
      res.redirect("/login");
    }
  });
});

app.post("/compose", function(req, res){
  if(req.body.postID) {
    Post.findOneAndUpdate({_id: req.body.postID}, {
      _id: req.body.postID,
      title: req.body.postTitle,
      content: req.body.postBody
    }, function(err){
      if(!err){
        res.redirect("/home");
      } else {
        console.log(err);
        res.redirect("/home");
      }
    });
  } else {
    const post = new Post ({
      _id: random(),
      title: req.body.postTitle,
      content: req.body.postBody
    });
  
    post.save(function(err){
      if(!err){
        res.redirect("/home");
      } else {
        console.log(err);
        res.redirect("/home");
      }
    });
  }
  
});

app.post("/delete", function(req, res){
  Post.findOneAndDelete({_id: req.body.postID}, function(err) {
    res.redirect("/home");
  })
});

app.get("/edit/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("edit", {
      title: post.title, content: post.content, _id: post._id
    });
  });
})

app.get("/find/:postId", function(req, res){

  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){

    res.render("post", {
      title: post.title, content: post.content, _id: post._id
    });
  });

});

app.get("/Terms&Conditions", function(req,res){
  Post.find({}, function(err, posts){
    if(req.isAuthenticated()){
      res.render("Terms&Conditions", {terms_Content: termsContent});
    }
    else{
      res.redirect("/login");
    }
  });
  
});

app.get("/about", function(req,res){
  Post.find({}, function(err, posts){
    if(req.isAuthenticated()){
      res.render("about", {about_Content: aboutContent});
    }
    else{
      res.redirect("/login");
    }
  });
  
});

app.get("/contact", function(req,res){
  Post.find({}, function(err, posts){
    if(req.isAuthenticated()){
      res.render("contact", {contact_Content: contactContent});
    }
    else{
      res.redirect("/login");
    }
  });
  
});

app.get("/", function(req, res){
  res.render("home_security");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
