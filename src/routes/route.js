const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController")


//APIS for user
router.post("/register", userController.createUser)




module.exports=router;