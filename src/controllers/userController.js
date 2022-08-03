const userModel = require("../models/userModel");
const emailValidator = require("email-validator");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { uploadFile } = require("../aws/aws")
const saltRounds = 10;
const { isValid, isValidObjectId, isValidRequestBody, isImage, isStreet, isCity, isPincode, isPhone, isFname, isLname, isEmail } = require("../validators/validator")

//==============================================Create User||Post Api==============================================================//
const createUser = async function (req, res) {
    try {                                                                               // >> validator
        let data = req.body;
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });

        const { fname, lname, email, phone, password } = data;
        const error= {};
        if(isFname(fname) !== true) error.fnameError = isFname(fname);
        if(isLname(lname) !== true) error.lnameError = isLname(lname);
        if(isEmail(email) !== true) error.emailError = isEmail(email);
        if(isPhone(phone) !== true) error.phoneError = isPhone(phone);
        if(isPassword(password) !== true) error.PasswordError = isPassword(password);
        if(isStreet(address.shipping.street) !== true) error.fnameError = isFname(fname);
        if(isCity(fname) !== true) error.fnameError = isCity(fname);
        if(isFname(fname) !== true) error.fnameError = isFname(fname);
        if(isFname(fname) !== true) error.fnameError = isFname(fname);
        if(isFname(fname) !== true) error.fnameError = isFname(fname);
        if(isFname(fname) !== true) error.fnameError = isFname(fname);
        if(isFname(fname) !== true) error.fnameError = isFname(fname);



        if (!isValid(fname))                                       //=====Fname=========//
            return res.status(400).send({ status: false, message: "⚠️ Please enter valid fname. " });
        if (isFname(fname))
            return res.status(400).send({ status: false, message: "⚠️ fname should not be Alfanumeric." })
        if (!isValid(lname))                                       //======Lname=========//
            return res.status(400).send({ status: false, message: "⚠️ Please enter some lname.", });
        if (isLname(lname))
            return res.status(400).send({ status: false, message: "⚠️ lname should not be Alfanumeric." })
        if (!isValid(email))                                       //======Email===========//
            return res.status(400).send({ status: false, message: "⚠️ Please enter a Email in the email-Field.", });
        if (!(emailValidator.validate(email)))
            return res.status(400).send({ status: false, message: "⚠️ Email should be in right format." })
        if (!isValid(phone))                                       //=======Phone===========//
            return res.status(400).send({ status: false, message: "⚠️ Please enter the phonefield." });
        if (isPhone(phone))
            return res.status(400).send({ status: false, message: "⚠️ please Enter a valid Indian Mobile number." })
        if (!isValid(password))                                    //=========Password=======//
            return res.status(400).send({ status: false, message: "⚠️ Please enter the password. " });
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "⚠️ Password length is inappropriate, its length must be between 8 and 15 Both value is inclusive.", });
        }
        if (!data.address) {                                        //===========Address==>Shipping Address==>Billing Address
            return res.status(400).send({ status: false, message: "⚠️ Address Required" })
        }
        let address = data.address.trim()
        if (!data.address || !isNaN(data.address)) {
            return res.status(400).send({ status: false, message: "⚠️ Valid address is required" })
        }
        try{
          address = JSON.parse(data.address)
        }catch(err){
         return res.status(400).send({status: false,  message: `⚠️ Address should be in valid object format`})
        }
     
        address = JSON.parse(data.address)
        if (!address.shipping || !address.billing) {
            return res.status(400).send({ status: false, message: "⚠️ shipping and billing address required" })
        }
        if (!address.shipping.street || !address.billing.street) {
            return res.status(400).send({ status: false, message: "⚠️ Street Name is  Required " })
        }
        if (!address.shipping.city || !address.billing.city) {
            return res.status(400).send({ status: false, message: "⚠️ City Name is  Required" })
        }
        if (!address.shipping.pincode || !address.billing.pincode) {
            return res.status(400).send({ status: false, message: "⚠️ Pincode is  Required " })
        }
        let Sstreet = address.shipping.street
        let Scity = address.shipping.city
        let Spincode = parseInt(address.shipping.pincode)     //shipping---->street,city,pincode
        if (Sstreet) {
            if (isStreet(Sstreet)) {
                return res.status(400).send({ status: false, message: " ❗ Please Enter Valid Street Name In Shipping." })
            }
        }
        if (Scity) {
            if (isCity(Scity)) {
                return res.status(400).send({ status: false, message: " ❗ Please Enter Valid City Name In Shipping." })
            }
        }
        if (Spincode) {
            if (isPincode(Spincode)) {
                return res.status(400).send({ status: false, message: " ❗ Please Enter Valid Pincode in Shipping." })
            }
        }
        let Bstreet = address.billing.street
        let Bcity = address.billing.city                          //Billing--->street,city,pincode
        let Bpincode = parseInt(address.billing.pincode)
        if (Bstreet) {
            if (isStreet(Bstreet)) {
                return res.status(400).send({ status: false, message: " ❗ Please Enter Valid Street Name In Shipping" })
            }
        }
        if (Bcity) {
            if (isCity(Bcity)) {
                return res.status(400).send({ status: false, message: "  ❗ Plaese Enter Valid City Name In Shipping" })
            }
        }
        if (Bpincode) {
            if (isPincode(Bpincode)) {
                return res.status(400).send({ status: false, message: " ❗ Plaese Enter Valid Pincode In Shipping" })
            }
        }
        data.address = address

        let files = req.files                                     //======Profile Image========//
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " ⚠️ Please Provide The Profile Image." });
        }
        if (!isImage(files[0].originalname))
            return res.status(400).send({ status: false, message: " ⚠️ Please enter the Image in a Valid format." });
        let profileImage = await uploadFile(files[0])
        const hash = bcrypt.hashSync(password, saltRounds);

        let checkEmail = await userModel.findOne({ email: email });         //======DB call For Uniqueness===//
        if (checkEmail) return res.status(400).send({ status: false, message: " ⚠️ This Email is already used." });

        let CheckPhone = await userModel.findOne({ phone: phone });
        if (CheckPhone) return res.status(400).send({ status: false, message: " ⚠️ phone Number should be Unique." });


        let userregister = { fname, lname, email, profileImage, phone, password: hash, address }
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, message: "User created successfully✅🟢", data: userData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
//====================================Log In=============================================================//
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
                    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 15
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
}


module.exports = { createUser, userLogin, getUserDetail, updateUser }



