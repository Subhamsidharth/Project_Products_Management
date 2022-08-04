const userModel = require("../models/userModel");
const emailValidator = require("email-validator");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {uploadFile} =require("../aws/aws")
const { isValid, isValidObjectId, isValidRequestBody, isImage,isStreet,isCity, isPincode, isPhone,isFname,isLname} = require("../validators/validator");
const {isEmail, isPassword, removeSpaces, trimAndUpperCase } = require('../validators/validateUser');
const {isImageFile } = require('../validators/validateProduct');

//==============================================Create User||Post Api==============================================================//
const createUser = async function (req, res) {
    try {
        let { fname, lname, email, phone, password, address } = req.body;
        let files = req.files;

        if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });

        const error = {};   //missing ProfileImage
        if(isImageFile(files) !== true) error.ProfileError = isImageFile(files); 
        if(isFname(fname) !== true) error.FnameError = isFname(fname); 
        if(isLname(lname) !== true) error.lnameError = isLname(lname); 
        if(isEmail(email) !== true) error.emailError = isEmail(email); 
        if(isPhone(phone) !== true) error.phoneError = isPhone(phone); 
        if(isPassword(password) !== true) error.passwordError = isPassword(password); 

        try{address = JSON.parse(address);
        }catch(err){return res.status(400).send({status:false, message:"please send addresss in proper format so that JSON parsing can be performed"})}

        if(!address.shipping) error.shippingError = "enter the mandatory shipping address";
        if(!address.billing) error.billingError = "enter the mandatory billing address";
        if(address.shipping && (isStreet(address.shipping.street) !== true)) error.ShippingstreetError = isStreet(address.shipping.street); 
        if(address.shipping && (isCity(address.shipping.city) !== true)) error.ShippingcityError = isCity(address.shipping.city); 
        if(address.shipping && (isPincode(address.shipping.pincode) !== true)) error.ShippingpincodeError = isPincode(address.shipping.pincode); 
        if(address.billing && (isStreet(address.billing.street) !== true)) error.billingstreetError = isStreet(address.billing.street); 
        if(address.billing && (isCity(address.billing.city) !== true)) error.billingcityError = isCity(address.billing.city); 
        if(address.billing && (isPincode(address.billing.pincode) !== true)) error.billingpincodeError = isPincode(address.billing.pincode); 

        if(Object.keys(error).length > 0) return res.status(400).send({status:false, message:{error}})
        fname = trimAndUpperCase(fname);
        lname = trimAndUpperCase(lname);
        email = removeSpaces(email);
        phone = removeSpaces(phone);

        let profileImage = await uploadFile(files[0])

        const hash = bcrypt.hashSync(password, 10); // para1:password, para2:saltRound

        let checkEmail = await userModel.findOne({ email: email });         //======DB call For Uniqueness===//
        if (checkEmail) return res.status(400).send({ status: false, message: " ⚠️ This Email is already used." });

        const lastTenNum = phone.slice(phone.length-10);
        let CheckPhone = await userModel.findOne({phone: new RegExp(lastTenNum + '$')});
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique ⚠️" });

        let userregister = { fname, lname, email, profileImage, phone, password: hash, address }
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, message:"User created successfully" , data: userData });       //"User created successfully✅🟢"
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};



//---------------------------------------LogIn----------------------------------------------------------------------------
const userLogin = async (req, res) => {
    try {                                                                    // >> Validator
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
                        exp: Math.floor(Date.now() / 1000) + 3600*24*15
                    }, process.env.JWT_SK)
                    res.setHeader('Authorization', 'Bearer ' + generatedToken)
                    return res.status(200).send({
                        "status": true,
                        message: "User login successfull",                      //" user loggedIn Succesfully ✔🟢"
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
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
};
//======================================Get User Api===============================================//
// Allow an user to fetch details of their profile.
// Make sure that userId in url param and in token is same
const getUserDetail = async function (req, res) {                             // >> Validator

    try {
        let userIdParams = req.params.userId

        if(!userIdParams || !userIdParams.trim()) return res.status(400).send({status:false, message:"enter userId in url path"});
        if (!isValidObjectId(userIdParams))
            return res.status(400).send({ status: false, message: "⚠️ User Id is Not Valid" })
        if (userIdParams !== req.userId)
            return res.status(403).send({ Status: false, message: "⚠️ UserId and token didn't Match." });


        const findUserDetail = await userModel.findOne({ _id: userIdParams })
        if (!findUserDetail) return res.status(404).send({ status: false, message: "🚫❗ No User Exist" })

        return res.status(200).send({ status: true, message: "Yahooo...User profile detail found♻. 🟢", data: findUserDetail })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}
//=========================================Update User Api====================================================================//
const updateUser = async function (req, res) {                            //validateUser >> authentication >> authorisation >> updateUser
    try {
        const data = req.body;
    const userId = req.params.userId

    const objUpdate = req.objUpdate;
    const arrFiles = req.files;
    if (arrFiles && arrFiles.length !== 0) {
        if (!isImage(arrFiles[0].originalname)) return res.status(400).send({ status: false, message: "⚠️ invalid format of the profile image" });
        const imageUrl = await uploadFile(arrFiles[0]);
        objUpdate.profileImage = imageUrl;
    }
    if (data.password) {
        const newPassword = await bcrypt.create(data.password, 10)
        objUpdate.password = newPassword;
    };

    if (Object.keys(objUpdate).length === 0) return res.status(400).send({ status: false, message: "⚠️ cannot process the update with empty data" })

    const updatedData = await userModel.findOneAndUpdate({ _id: userId }, { $set: objUpdate }, { new: true });
    return res.status(200).send({ status: true, message: "User profile updated.✔🟢✔", data: updatedData })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }      
}


module.exports = { createUser, userLogin, getUserDetail, updateUser }


