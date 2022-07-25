const userModel = require("../models/userModel");
// const emailValidator = require("email-validator");
//--------------------------Regex------------------------------------------------------
let nameRegex = /^[.a-zA-Z\s,-]+$/
// let linkRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let mobileRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/



const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const createUser = async function (req, res) {
    try {
        let data = req.body;
        if (!Object.keys(data).length)
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body." });

        const { fname, lname, email, profileImage, phone, password, address } = data;

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

        // if (!isValid(profileImage))
        //     return res.status(400).send({ status: false, message: "Please enter the profileImage. ⚠️" });
        // if (!linkRegex.test(profileImage))
        //     return res.status(400).send({ status: false, message: "Please enter a valid URL. ⚠️" })

        if (!isValid(phone))
            return res.status(400).send({ status: false, message: "Please enter the phonefield. ⚠️" });
        if (!mobileRegex.test(phone))
            return res.status(400).send({ status: false, message: "please Enter a valid Indian Mobile number ⚠️" })

        if (!isValid(password))
            return res.status(400).send({ status: false, message: "Please enter the password. ⚠️" });
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password length is inappropriate, its length must be between 8 and 15 Both value is inclusive", });}

        if (!isValid(address))
            return res.status(400).send({ status: false, message: "Please enter the adressfield. ⚠️" });

        if (Object.keys(data).includes('address')) {
            if (typeof address !== "object") return res.status(400).send({ status: false, message: "address should be an object. ⚠️" })
        }

        let checkEmail = await userModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: "This Email is already used. ⚠️" });

        let CheckPhone = await userModel.findOne({ phone: phone });
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique ⚠️" });

        let userCreated = await userModel.create(data);
        return res.status(201).send({ status: true, message: "User created successfully", data: userCreated });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createUser }