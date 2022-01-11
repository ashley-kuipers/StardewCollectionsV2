const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require("ejs")
const _ = require("lodash")

// get default data
const myModule = require('./sample-data/item-data.js');
const collectionsItemData = myModule.collectionsItemData;
const commCenterItemData = myModule.commCenterItemData;

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

async function main() {
  // connect to database
  // const uri = String(process.env.MONGODB_URI)
  const uri = 'mongodb+srv://admin:XmFolEM6Bc1aCPtm@webdevtests.dljay.mongodb.net'
  await mongoose.connect(uri + '/stardewcollections?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

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
    name: String,
    password: String,
    goal:{
      communityCenter:[itemSchema],
      collections:[itemSchema],
      hidden:[itemSchema]
    }
  })
  const User = mongoose.model("User", userSchema)

  // declare variables
  let goalItems = []

  app.get("/", function(req,res){
    const error = req.query.error
    if (error === "username"){
      res.render("index.ejs", {
        message:"That username does not exist. Please try again or create new user"
      })
    } else if (error === "password-match") {
      res.render("index.ejs", {
        message:"That password does not match our records. Please try again."
      })
    } else {
      res.render("index.ejs", {
        message:""
      })
    }
  })

  app.post("/signin", function(req,res){
    const usernameEntered = req.body.username.toLowerCase()
    const passwordEntered = req.body.password

    // go through sign in procedure, get user data
    User.findOne({name: usernameEntered}, (err, userData) => {
      let error=""
      if (userData) {
        // if they exist, check password
        if(passwordEntered === userData.password){
          // if password matches, get data
          userInfo = userData
        } else {
          error="password-match"
        }
      } else {
        error="username"
      }

      if (error===""){
        res.redirect("/user/"+ usernameEntered + "/goal")
      } else {
        res.redirect("/?error=" + encodeURIComponent(error))
      }
    })
  })

  app.get("/user/:user/goal", function(req,res){
    const username = req.params.user
    const usernameTitle = _.upperFirst(req.params.user)
    res.render("choose-goal.ejs", {
      username:username,
      usernameTitle:usernameTitle
    })
  })

  app.get("/user/:user/goal/:goal", function(req,res){
    const username = req.params.user
    const goal = req.params.goal

    if (goal === "comm-center"){
      goalItems = userInfo.goal.communityCenter
    } else if (goal === "collections") {
      goalItems = userInfo.goal.collections
    } else {
      goalItems = userInfo.goal.hidden
    }

    // get category list
    let categories = []
    for(item of goalItems){
      categories.push({
        title:item.category,
        link:item.categoryLink
      })
    }
    categories = [...new Map(categories.map(v => [JSON.stringify([v.title,v.link]), v])).values()]

    // send categories and buttons to template
    res.render("collections.ejs", {
      categories: categories,
      items:goalItems,
      username: username,
      goal:goal
    })
  })

  app.get("/test", function(req,res){
    res.render("test.ejs")
  })

  app.post("/user/:user/:goal/save", function(req,res){
    const username = req.params.user
    const goal = req.params.goal
    const changes = JSON.parse(req.body.changes)


    for (const change of changes){
      //look up item in database and update checked status (ONLY SAVING LAST ITEM IT SEES)
      User.findById(userInfo._id, function(err, user) {
        var doc = user.goal[goal];
        var doc2 = doc.id(change._id);
        doc2.checked = change.checked
        user.save()
        console.log("saved:" + doc2.link)
      })
      // find changed button in userInfo and update checked value, then redirect back
      for (item of goalItems){
        if (item.link === change.link){
          item.checked = change.checked
        }
      }
    }
    // database update working but takes forever, need to find workaround like on the to do list one with the array
    res.redirect("/user/" + username + "/goal/" + goal)
  })

  app.post("/:user/back", function(req,res){
    username = req.params.user
    res.redirect("/user/" + username + "/goal")
  })

  app.get("/create-user", function(req,res){
    const createUserError = String(req.query.error);
    let error = ""
    switch (createUserError) {
      case "user-exists":
        error = "Username already exists. Please choose a new one."
        break;
      case "password-length":
        error = "Password length too short. Please try again."
        break;
      case "password-match":
        error = "Passwords do not match. Please try again."
        break;
      default:
        error = ""
    }

    res.render("create-user.ejs", {
      message: error
    })
  })

  app.post("/create-user", function(req, res) {
      const newUsername = req.body.newUsername.toLowerCase()
      const newPassword = req.body.newPassword
      const confirmPassword = req.body.confirmPassword

      User.findOne({
        name: newUsername
      }, (err, userData) => {
        if (userData) {
          // user already exists, try again
          const userAlreadyExists = encodeURIComponent("user-exists")
          res.redirect("/create-user/?error=" + userAlreadyExists)
          //better way to organize this (put errors in one variable and redirect there after. don't feel like doing it now though)
          console.log("Username already exists")
        } else {
          // if passwords match
          if (newPassword === confirmPassword) {
            // if password length greater than 8 characters
            if (newPassword.length >= 8) {
              //create new user
              const newUser = new User({
                name: newUsername,
                password: newPassword,
                goal:{
                  communityCenter:commCenterItemData,
                  collections:collectionsItemData
                }
              })
              newUser.save()
              console.log("New user '" + newUsername + "' created")
              res.redirect("/?newUser=" + newUsername + "&created=success")

            } else {
              const passwordLength = encodeURIComponent("password-length")
              res.redirect("/create-user/?error=" + passwordLength)
              console.log("Password too short")
            }

          } else {
            const passwordsDontMatch = encodeURIComponent("password-match")
            res.redirect("/create-user/?error=" + passwordsDontMatch)
            console.log("Passwords Don't Match")
          }
        }
      })
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
