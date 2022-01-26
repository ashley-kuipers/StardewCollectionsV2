require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require("ejs")
const _ = require("lodash")
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

// get default data
const dataModule = require('./sample-data/item-data.js');
const collectionsItemData = dataModule.collectionsItemData;
const commCenterItemData = dataModule.commCenterItemData;

// start express server
const app = express()
app.set('view engine', 'ejs')

// use body-parser
app.use(bodyParser.urlencoded({
  extended: true,
  parameterLimit:100000000
}))

// helps it use our css
app.use(express.static("public"))

// for sessions
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

async function main() {
  // connect to database
  const url = process.env.DATABASE;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // models and schema
  const itemSchema = new mongoose.Schema({
    itemName: String,
    link:String,
    imagePath: String,
    checked: Boolean,
    category: String,
    categoryLink:String,
    title1: String,
    info1: String,
    title2: String,
    info2: String,
    title3: String,
    info3: String,
    title4: String,
    info4: String
  })
  const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    goals:[
      {
        link:String,
        name:String,
        items:[itemSchema]
      }
    ]
  })
  userSchema.plugin(passportLocalMongoose)
  const User = mongoose.model("User", userSchema)


  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())

  // declare variables
  let goalItems = []

  app.get("/", function(req,res){
    if(req.isAuthenticated()){
      res.redirect("/goal")
    } else {
      res.render("index.ejs",{
        message:""
      })
    }
  })
  app.post("/login", (req,res)=>{
    const user = new User({
      username:req.body.username,
      password:req.body.password
    })
    req.login(user, (err)=>{
      if(err){
        console.log(err)
        res.redirect("/")
      } else {
        passport.authenticate("local")(req,res,()=>{
          res.redirect("/goal")
        })
      }
    })
  })

  app.get("/goal", (req,res)=>{
    if(req.isAuthenticated()){
      res.render("choose-goal.ejs")
    } else {
      res.redirect("/")
    }
  })

  app.route("/create-user")
    .get((req,res)=>{
      res.render("create-user.ejs", {
        message: ""
      })
    })
    .post((req,res)=>{
      if(req.body.password === req.body.confirmPassword && req.body.password.length > 7){
        User.register({username:req.body.username}, req.body.password, (err, user)=>{
          if(err){
            console.log(err);
            res.redirect("/create-user") // add error message
          } else {
            const goals=[
              {
                link:"community-center",
                name:"Community Center",
                items:commCenterItemData
              },
              {
                link:"collections",
                name:"Collections",
                items:collectionsItemData
              }
            ]
            user.goals=goals
            user.save()
            passport.authenticate("local")(req,res,()=>{
              res.redirect("/goal")
            })
          }
        })
      } else {
        res.redirect("/create-user") // add error message
      }
    })

  app.route("/goal/:goal")
    // display collection page
    .get((req,res)=>{
      if(req.isAuthenticated()){
        User.findOne({_id:req.user._id}, (err, user)=>{
          for (const goal of user.goals){
            if(req.params.goal === goal.link){
              // get categories list
              let categories = []
              for(item of goal.items){
                categories.push({
                  title:item.category,
                  link:item.categoryLink
                })
              }
              categories = [...new Map(categories.map(v => [JSON.stringify([v.title,v.link]), v])).values()]
              res.render("collections.ejs", {
                categories: categories,
                goal:goal
              })
            }
          }
        })
      } else {
        res.redirect("/")
      }
    })
    // save pressed button changes
    .post((req,res)=>{
      if(req.isAuthenticated()){
        const changes = JSON.parse(req.body.changes)
        //look up item in database and update checked status
        User.findOne({_id:req.user._id}, (err, user)=>{
          const currentGoal = user.goals.id(req.body.goalDBId)
          for (const item of currentGoal.items){
            for(const change of changes){
              if (change.itemName === item.itemName){
                item.checked = change.checked
              }
            }
          }
          user.save()
          res.redirect("/goal/" + req.params.goal)
        })
      } else {
        res.redirect("/")
      }
    })

  app.post("/back", function(req,res){
    res.redirect("/goal")
  })

  app.get("/about", function(req,res){
    res.render("about.ejs")
  })
} // end of main




main().catch((err) => console.log(err));



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port " + port);
});
