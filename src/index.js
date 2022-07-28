const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();


app.use(bodyParser.json()); //express.json();
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer().any());    //without it req.files = undefined , if file missing in req => req.files = []
app.use('/', route);



const string = "mongodb+srv://ibrahimDatabase1:8Nh3Y1Pj0ck4ubUC@cluster0.otjog5i.mongodb.net/group70Database?retryWrites=true&w=majority";
mongoose.connect(string, {useNewUrlParser:true}).then(()=> console.log("mongoDB is connected")).catch((err)=> console.log(err));


app.listen(process.env.PORT || 3000, function(){return console.log(`Express is running on port ${process.env.PORT || 3000}`)});