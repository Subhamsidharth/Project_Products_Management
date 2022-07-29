const userModel = require("../models/userModel");
const emailValidator = require("email-validator");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {uploadFile} =require("../aws/aws")
const saltRounds = 10;
const { isValid, isValidObjectId, isValidRequestBody, isImage, nameRegex, mobileRegex,validateStreet,validateCity,validatePincode } = require("../validators/validator")


//------------------------------------Post Register Api-------------------------------------------------
const createUser = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });

        const { fname, lname, email, phone, password } = data;
        //------------------fname----------
        if (!isValid(fname))
            return res.status(400).send({ status: false, message: "Please enter valid fname. ⚠️" });
        if (!nameRegex.test(fname))
            return res.status(400).send({ status: false, message: "fname should not be Alfanumeric ⚠️" })
        //--------------------lname------------
        if (!isValid(lname))
            return res.status(400).send({ status: false, message: "Please enter some lname. ⚠️", });
        if (!nameRegex.test(lname))
            return res.status(400).send({ status: false, message: "lname should not be Alfanumeric ⚠️" })
        //------------------email------------
        
        if (!(emailValidator.validate(email))) 
        return res.status(400).send({ status: false, message: "Email should be in right format ⚠️" })
    
       
        //------------Phone-------------------
        if (!isValid(phone))
            return res.status(400).send({ status: false, message: "Please enter the phonefield. ⚠️" });
        if (!mobileRegex.test(phone))
            return res.status(400).send({ status: false, message: "please Enter a valid Indian Mobile number ⚠️" })
        //-------------Password----------------
        if (!isValid(password))
            return res.status(400).send({ status: false, message: "Please enter the password. ⚠️" });
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password length is inappropriate, its length must be between 8 and 15 Both value is inclusive", });
        }
       //----------------------------Address--------------------------------------------------
        if (!data.address) {
            return res.status(400).send({ status: false, message: "address required" })
        }
       
        let address=data.address
        if (!data.address || !isNaN(data.address)) {
            return res.status(400).send({ status: false, message: "Valid address is required" })
        }
            try{
              address = JSON.parse(data.address)
            }catch(err){
            //   console.log(err.message)
             return res.status(400).send({status: false,  message: `Address should be in valid object format`})
            }
      
        if (!address.shipping || !address.billing) {
            return res.status(400).send({ status: false, message: "shipping and billing address required" })

        }
        //---------------------------------------------------------------------
        if (!address.shipping.street || !address.billing.street) {
            return res.status(400).send({ status: false, message: "street is  required " })

        }
        if (!address.shipping.city || !address.billing.city) {
            return res.status(400).send({ status: false, message: "city is  required" })

        }
        if (!address.shipping.pincode || !address.billing.pincode) {
            return res.status(400).send({ status: false, message: "pincode is  required " })

        }
        //-------------------------------------------------------------------
        let Sstreet = address.shipping.street
        let Scity = address.shipping.city
        let Spincode = parseInt(address.shipping.pincode)     //shipping
        if (Sstreet) {
            // let validateStreet = /^[a-zA-Z0-9]/
            if (!validateStreet.test(Sstreet)) {
                return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
            }
        }

        if (Scity) {
            // let validateCity = /^[a-zA-Z0-9]/
            if (!validateCity.test(Scity)) {
                return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
            }
        }
        if (Spincode) {
            // let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/     //must not start with 0,6 digits and space(optional)
            if (!validatePincode.test(Spincode)) {
                return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
            }
        }
        let Bstreet = address.billing.street
        let Bcity = address.billing.city                             //billing
        let Bpincode = parseInt(address.billing.pincode)
        if (Bstreet) {
            // let validateStreet = /^[a-zA-Z0-9]/
            if (!validateStreet.test(Bstreet)) {
                return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
            }
        }

        if (Bcity) {
            // let validateCity = /^[a-zA-Z0-9]/
            if (!validateCity.test(Bcity)) {
                return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
            }
        }
        if (Bpincode) {
            // let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/     //must not start with 0,6 digits and space(optional)
            if (!validatePincode.test(Bpincode)) {
                return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
            }
        }
        
        data.address = address
        // console.log(address)

        //-----------------------------------------------------
        // if (!address || typeof address != "object") {
        //     return res.status(400).send({ status: false, message: "Object of address is required. ⚠️" });
        // }
        // if (!address.shipping || typeof address.shipping != "object") {
        //     return res.status(400).send({ status: false, message: "Object shipping address is required...❗", });
        // }
        // if (!address.billing || typeof address.billing != "object") {
        //     return res.status(400).send({ status: false, message: "Object billing address is required...❗", });
        // }
        // if (!isValid(address.shipping.street)) {
        //     return res.status(400).send({ status: false, message: "Street of shipping address is required...❗", });
        // }
        // if (!isValidScripts(address.shipping.street)) {
        //     return res.status(400).send({ status: false, message: "street is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $]. ❗", });
        // }

        // if (!isValid(address.shipping.city)) {
        //     return res.status(400).send({ status: false, message: "City of shipping address is required...❗", });
        // }

        // if (!isValidPincode(address.shipping.pincode)) {
        //     return res.status(400).send({ status: false, message: "Shipping address pincode must be 6 digit number. ❗", });
        // }

        // if (!isValid(address.billing.street)) {
        //     return res.status(400).send({ status: false, message: "Street of billing address is required...❗", });
        // }

        // if (!isValid(address.billing.city)) {
        //     return res.status(400).send({ status: false, message: "City of billing address is required...❗", });
        // }

        // if (!isValidPincode(address.billing.pincode)) {
        //     return res.status(400).send({ status: false, message: "Billing address pincode must be 6 digit number ❗", });
        // }
       
        let files = req.files
        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image ⚠️" });
        }
        if (!isImage(files[0].originalname))
        return res.status(400).send({ status: false, message: "Please enter the Image in a Valid format. ⚠️" });
        let profileImage = await uploadFile(files[0])
        const hash = bcrypt.hashSync(password, saltRounds);

        let checkEmail = await userModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: "This Email is already used. ⚠️" });

        let CheckPhone = await userModel.findOne({ phone: phone });
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique ⚠️" });

       
        let userregister = { fname, lname, email, profileImage, phone, password: hash, address }
        const userData = await userModel.create(userregister);
        return res.status(201).send({ status: true, message: "User created successfully✅🟢", data: userData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//---------------------------------------LogIn----------------------------------------------------------------------------
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
                    exp: Math.floor(Date.now() / 1000) + 3600*24*15
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
        return res.status(500).send({ status: false, message:error.message });
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
            if (userIdParams !== req.userId )
            return res.status(403).send({ Status: false, message: "UserId and token didn't Match. ⚠️" });

      
        const findUserDetail = await userModel.findOne({ _id: userIdParams })
        if (!findUserDetail) return res.status(404).send({ status: false, message: "No User Exist" })

        return res.status(200).send({ status: true, message: "User profile details", data: findUserDetail })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}
//--------------------------------------------------------Update Api-----------------------------------------------------
const updateUser = async function(req, res){                            //validateUser >> authentication >> authorisation >> updateUser
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


module.exports = { createUser, userLogin, getUserDetail,updateUser }
