const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
var multer = require('multer')


const app = express();
//const multer= require("multer");
//const { AppConfig } = require('aws-sdk');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(multer().any())

mongoose.connect('mongodb+srv://RinkiPradhan:moShtmwBC2cEopn2@cluster0.xs93j.mongodb.net/Group70Database', {
  useNewUrlParser: true
})
.then(function(){
  console.log("Mongodb is connected successfully.✔🟢✅");
})
.catch(function(err){
  console.log(err)
})

app.use('/', route);

app.listen(process.env.PORT || 3000, function(){
  console.log('Your app is running at port✔✔✅', process.env.PORT || 3000);
})