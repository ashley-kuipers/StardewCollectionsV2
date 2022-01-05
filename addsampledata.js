const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");


const myModule = require('./sample-data/item-data.js');
const collectionsItemData = myModule.collectionsItemData;
const commCenterItemData = myModule.commCenterItemData;


// start express server
const app=express();
app.set('view engine', 'ejs');

// user body-parser to use database url?
app.use(bodyParser.urlencoded({extended: true}));

// helps it use our css
app.use(express.static("public"))

async function main(){
  const url = `mongodb+srv://admin:XmFolEM6Bc1aCPtm@webdevtests.dljay.mongodb.net/stardewcollections?retryWrites=true&w=majority`;
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
    name: String,
    password: String,
    goal:{
      communityCenter:[itemSchema],
      collections:[itemSchema]
    }
  })

  const User = mongoose.model("User", userSchema)

//USERNAME PAGE
  app.get("/", function(req,res){
    const test = new User({
      name:"test",
      password:"password",
      goal:{
        communityCenter:commCenterItemData,
        collections:collectionsItemData
      }
    })
    test.save()

    console.log("data saved")

    res.render("index.ejs", {
      message:"Sample data saved."
    })
  })

} // end of main







main().catch((err) => console.log(err));

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
