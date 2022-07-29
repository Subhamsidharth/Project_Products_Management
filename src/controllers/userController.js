const userModel = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {uploadFile} = require('../aws/aws.js');
const { default: mongoose } = require('mongoose');
const {isImage}  = require('../validators/validateUser.js');



//------------------------------1st User API : POST/register---------------------------------------//
/*- Create a user document from request body. Request body must contain image. Upload image to S3 bucket and save it's public url in user document. Save password in encrypted format. (use bcrypt) */

const createUser = async function(req,res){ //validations remaining
    try {
        // const {fname, lname, email, phone, password, address} = req.body;
        // const data = {fname, lname, email, phone, password, address};
        const data = req.body
        
        //s3 link
        const arrFiles = req.files;                                                                        
        if(!arrFiles || arrFiles.length===0) return res.status(400).send({status:false, message:"mandatory image file is not found"});
        const imageUrl = await uploadFile(arrFiles[0]);
        data.profileImage = imageUrl;
       
        //bcrypt password
        // const hash = await bcrypt.hash(req.body.password, 10)  //without await line24 Promise { <pending> }, it is asynchronous
        const hash = await new Promise((resolve, reject)=>{
            bcrypt.hash(req.body.password, 10, function(err, hash){
                if(err) reject(err);
                console.log(hash);
                resolve(hash)
            })
        });

        req.body.password = hash;
        console.log(data);//use rest operator to collect address keys in object.
        const savedData = await userModel.create(data);
        return res.status(201).send({status:true, message:"User created successfully", data:savedData})

    } catch (error) {
        console.log(error);
        return res.status(500).send({status:false, message:error.message})
    }
}

const login = async function(req, res){ //all done
    try {
        const {email, password} = req.body;
        const msg = {};
        if(!email) msg["email error"] = "please enter your email";
        if(!password) msg["password error"] = "please enter your password";
        if(Object.keys(msg).length >0) return res.status(400).send({status:false, message:msg});

        const user = await userModel.findOne({email});  //or, ({email:email})
        if(!user) return res.status(404).send({status:false, message:"user not exists, click on SignUp to create new account"});

        const comparison = await bcrypt.compare(password, user.password);
        if(comparison === false) return res.status(401).send({status:false, message:"email or password is incorrect"});
        if(comparison === true) console.log("password matched");//

        const token = jwt.sign({userId: user._id, project:"productManagement", group:70}, "secretCode70", {expiresIn:"72h"} );
        const decode = jwt.verify(token, "secretCode70");
        const iat = new Date((decode.iat)*1000).toLocaleString();
        const exp = new Date((decode.exp)*1000).toLocaleString();
        console.log({iat, exp});

        res.setHeader("Bearer", token);
        return res.status(200).send({status:true, message:"user login successful", data:{userId:decode.userId, token}})
    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message: err.message})
    }
}


//----------------------------------------------------------API 3=> GET /user/:userId/profile (Authentication required)-------------------------------------------//
const getProfile = async function(req, res){        //authentication >> getProfile
    try{
        //retrieve userId
        const userId = req.params.userId;
        if(!userId) return res.status(400).send({status:false, message:"enter user id in url"})// handled by postman as well
        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false, message:"enter a valid user id in url path"})

        //authorisation
        const loggedInUserId = req.token.userId;
        if(loggedInUserId !== userId) return res.status(400).send({status:false, message:`user with id = ${loggedInUserId} is not allowed to view the profile of user with id = ${userId}`});

        //get data, response
        const profile = await userModel.findById(userId).select({__v:0});
        if(!profile) return res.status(404).send({status:false, message:"user profile not found"}); //not necessary
        return res.status(200).send({status:true, message:"User profile details", data:profile})

    }catch(err){
        console.log(err);
        return res.status(500).send({status:false, message:err.message})
    }
}


//---------------------------------------------API 4=>PUT /user/:userId/profile (Authentication and Authorization required)---------------------------------------//

const updateUser = async function(req, res){                            // authentication >> authorisation >>validateUser >> updateUser
    const data = req.body;
    const userId = req.params.userId


    const objUpdate = req.objUpdate;
    const arrFiles = req.files;      
    if(arrFiles && arrFiles.length !== 0){
        if(!isImage(arrFiles[0].originalname)) return res.status(400).send({status:false, message: "invalid format of the profile image"});
        const imageUrl = await uploadFile(arrFiles[0]);
        objUpdate.profileImage = imageUrl;
    }
    if(data.password){
        const newPassword = await bcrypt.create(data.password, 10)
        objUpdate.password = newPassword;
    };                                                                    

    if(Object.keys(objUpdate).length === 0) return res.status(400).send({status:false, message:"cannot process the update with empty data"})
    
    const updatedData = await userModel.findOneAndUpdate({_id:userId},{$set:objUpdate},{new:true});
    return res.status(200).send({status:true, message:"User profile updated", data:updatedData})
}

module.exports = {createUser, login, getProfile, updateUser}





