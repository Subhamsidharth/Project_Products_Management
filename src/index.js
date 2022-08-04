const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
//const { AppConfig } = require('aws-sdk');



app.use(bodyParser.json()); //express.json();
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer().any());    //without it req.files = undefined , if file missing in req => req.files = []
app.use('/', route);

require("dotenv").config()

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true
})
.then(function(){
  console.log("Mongodb is connected successfully.✔🟢✅");
})
.catch(function(err){
  console.log(err)
})


app.listen(process.env.PORT || 3000, function(){return console.log(`Express is running on port🤣 ${process.env.PORT || 3000}`)});
//dotenv
//.env

/*
updateOrder(assuming cancellable:true)
#inDoc      #inReqBody  #afterResponse

pending     completed   completed       ✔🟢
pending     cancelled   cancelled       possible

completed   cancelled   cancelled       ✔🟢
completed   pending     pending         ?err

cancelled   pending     pending         ?err
cancelled   completed   completed       ?err

is it order api or delivery api? => delivery
is it order api or delivery api? => order, 

*/
//order to delivery