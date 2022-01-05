const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require("ejs")
const _ = require("lodash")

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
  const url = `mongodb+srv://admin:XmFolEM6Bc1aCPtm@webdevtests.dljay.mongodb.net/stardewcollections?retryWrites=true&w=majority`
  await mongoose.connect(url, {
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
    items:[itemSchema]
  })
  const User = mongoose.model("User", userSchema)

  // declare variables

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
        res.redirect("/user/"+ usernameEntered + "/choose")
      } else {
        res.redirect("/?error=" + encodeURIComponent(error))
      }
    })
  })

  app.get("/user/:user/choose", function(req,res){
    const username = req.params.user
    res.render("choose-goal.ejs", {
      username:username
    })
  })

  app.get("/user/:user/collections", function(req,res){
    const username = req.params.user
    User.findOne({name: username}, (err, userData) => {
      userInfo = userData
      console.log("Data updated")
    })
    // get category list
    let categories = []
    for(item of userInfo.items){
      categories.push({
        title:item.category,
        link:item.categoryLink
      })
    }
    categories = [...new Map(categories.map(v => [JSON.stringify([v.title,v.link]), v])).values()]

    res.render("collections.ejs", {
      categories: categories,
      items:userInfo.items,
      username: username
    })
  })

  app.get("/test", function(req,res){
    res.render("test.ejs")
  })

  app.post("/user/:user/collections/save", function(req,res){
    const username = req.params.user
    const changes = JSON.parse(req.body.changes)
    for (change of changes){
      //look up item in database and update checked status
      User.findById(userInfo._id, function(err, user) {
      var doc = user.items.id(change.databid);
      console.log(doc)
      doc.checked = change.checked
      user.save()
    })
    }

    // database update working, just not updating on the page since we only refresh the data when the user logs in
    res.redirect("/user/" + username + "/collections")
  })

} // end of main




main().catch((err) => console.log(err));

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
