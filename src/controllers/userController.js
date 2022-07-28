const userModel = require("../models/userModel");
// const emailValidator = require("email-validator");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const aws = require("aws-sdk");
const saltRounds = 10;
//--------------------------Regex------------------------------------------------------
let nameRegex = /^[.a-zA-Z\s,-]+$/
let emailRegex = /^[a-zA-Z]{1}[A-Za-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let mobileRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
//-------------------------------AWS--------------------------------------------------------

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "Group70/" + file.originalname, //HERE 
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}


//-------------------------------------Validate--------------------------------------------------------
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidScripts = function (title) {
    const scriptRegex = /^(?![0-9]*$)[A-Za-z0-9\s\-_,\.;:()]+$/
    return scriptRegex.test(title)
}
const isValidPincode = function (pincode) {
    if (!pincode || pincode.toString().trim().length == 0 || pincode.toString().trim().length != 6) return false;
    if (isNaN(Number(pincode.toString().trim()))) return false
    return true;

}
//------------------------------------Post Register Api-------------------------------------------------
const createUser = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });

        const { fname, lname, email, phone, password, address } = data;

        if (!isValid(fname))
            return res.status(400).send({ status: false, message: "Please enter valid fname. ⚠️" });
        if (!nameRegex.test(fname))
            return res.status(400).send({ status: false, message: "fname should not be Alfanumeric ⚠️" })

        if (!isValid(lname))
            return res.status(400).send({ status: false, message: "Please enter some lname. ⚠️", });
        if (!nameRegex.test(lname))
            return res.status(400).send({ status: false, message: "lname should not be Alfanumeric ⚠️" })

        if (!isValid(email))
            return res.status(400).send({ status: false, message: "Please enter the email. ⚠️" });
        if (!emailRegex.test(email))
            return res.status(400).send({ status: false, message: " Email should be in right format ⚠️" })

        if (!isValid(phone))
            return res.status(400).send({ status: false, message: "Please enter the phonefield. ⚠️" });
        if (!mobileRegex.test(phone))
            return res.status(400).send({ status: false, message: "please Enter a valid Indian Mobile number ⚠️" })

        if (!isValid(password))
            return res.status(400).send({ status: false, message: "Please enter the password. ⚠️" });
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password length is inappropriate, its length must be between 8 and 15 Both value is inclusive", });
        }
        if (!address || typeof address != "object") {
            return res.status(400).send({ status: false, message: "Object of address is required. ⚠️" });
        }
        if (!address.shipping || typeof address.shipping != "object") {
            return res.status(400).send({ status: false, message: "Object shipping address is required...❗", });
        }
        if (!address.billing || typeof address.billing != "object") {
            return res.status(400).send({ status: false, message: "Object billing address is required...❗", });
        }
        if (!isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Street of shipping address is required...❗", });
        }
        if (!isValidScripts(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "street is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $]. ❗", });
        }

        if (!isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "City of shipping address is required...❗", });
        }

        if (!isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping address pincode must be 6 digit number. ❗", });
        }

        if (!isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Street of billing address is required...❗", });
        }

        if (!isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "City of billing address is required...❗", });
        }

        if (!isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing address pincode must be 6 digit number ❗", });
        }
        let files = req.files
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image ⚠️" });
        }
        let profileImage = await uploadFile(files[0])
        const hash = bcrypt.hashSync(password, saltRounds);

        let checkEmail = await userModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: "This Email is already used. ⚠️" });

        let CheckPhone = await userModel.findOne({ phone: phone });
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique ⚠️" });


        let userregister = { fname, lname, email, profileImage, phone, password: hash, address }
        console.log(userregister)
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, message: "User created successfully✅🟢", data: userData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err });
    }
};

//---------------------------------------LogIn-------------------------------------------------------------------------
const userLogin = async (req, res) => {
    try {
        const body = req.body
        const { email, password } = body
        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please provide The Credential To Login. ❗" });
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide The Email-id. 🛑❌" });
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide The password. 🛑❌" });;
        }
        let user = await userModel.findOne({ email: email });
        if (user) {
            const Passwordmatch = bcrypt.compareSync(body.password, user.password);
            if (Passwordmatch) {
                const generatedToken = jwt.sign({
                    userId: user._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 3600
                }, 'group70')
                res.setHeader('Authorization', 'Bearer ' + generatedToken)
                return res.status(200).send({
                    "status": true,
                    Message: " user loggedIn Succesfully ✔🟢",
                    data: {
                        userId: user._id,
                        token: generatedToken,
                    }
                });
            } else {
                res.status(401).send({ status: false, message: "Password Is Inappropriate. ❗" });
            }
        } else {
            return res.status(400).send({ status: false, message: "Invalid credentials. ❗" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//------------------------------------------------GetApi-----------------------------------------------
// Allow an user to fetch details of their profile.
// Make sure that userId in url param and in token is same
const getUserDetail = async function (req, res) {

    try {
        let userIdParams = req.params.userId

        if (!isValidObjectId(userIdParams))
            return res.status(400).send({ status: false, message: "User Id is Not Valid" })

        const loggedInUserId = req.token.userId;
        if (loggedInUserId !== userId) return res.status(400).send({ status: false, message: `user with id = ${loggedInUserId} is not allowed to view the profile of user with id = ${userId}` });

        const findUserDetail = await userModel.findOne({ _id: userIdParams })
        if (!findUserDetail) return res.status(404).send({ status: false, message: "No User Exist" })

        return res.status(200).send({ status: true, message: "User profile details", data: findUserDetail })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}
//--------------------------------------
// const getProfile = async function(req, res){        //authentication >> getProfile
//     try{
//         //retrieve userId
//         const userId = req.params.userId;
//         if(!userId) return res.status(400).send({status:false, message:"enter user id in url"})// handled by postman as well
//         if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false, message:"enter a valid user id in url path"})

//         //authorisation
//         const loggedInUserId = req.token.userId;
//         if(loggedInUserId !== userId) return res.status(400).send({status:false, message:`user with id = ${loggedInUserId} is not allowed to view the profile of user with id = ${userId}`});

//         //get data, response
//         const profile = await userModel.findById(userId).select({__v:0});
//         if(!profile) return res.status(404).send({status:false, message:"user profile not found"}); //not necessary
//         return res.status(200).send({status:true, message:"User profile details", data:profile})

//     }catch(err){
//         console.log(err);
//         return res.status(500).send({status:false, message:err.message})
//     }
// }
//-------------------------------------------------------


module.exports = { createUser, userLogin, getUserDetail }
