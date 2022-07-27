const productModel = require('../models/productModel')

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
    if(typeof value === "number") return false;
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

//------------------------------------Post createProduct Api-------------------------------------------------
const createProduct = async (req, res) => {

    try {

        let files = req.files
        let data = req.body
        let {
            title, description, price, currencyId, currencyFormat, 
            isFreeShipping, style, availableSizes, installments } = data

        //---Mandatory_Field---\\
        if (!isValidRequestBody(data)){
        return res.status(400)
        .send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });
        }
        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
        if (!description) return res.status(400).send({ status: false, message: "Description is mandatory" })
        if (!price) return res.status(400).send({ status: false, message: "Price is mandatory" })
        if (!currencyId) return res.status(400).send({ status: false, message: "CurrencyId is mandatory" })
        if (!currencyFormat) return res.status(400).send({ status: false, message: "CurrencyFormat is mandatory" })
        if (!productImage) return res.status(400).send({ status: false, message: "ProductImage is mandatory" })
        
        //_Validation_\\
        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Please enter valid Title. ⚠️" });

        if (!isValid(description))
            return res.status(400).send({ status: false, message: "Please enter valid description. ⚠️" });

        // if (!/([0-9]{0,2}((.)[0-9]{0,2}))$/.test(price) || (price) !== Number )
        //     return res.status(400).send({ status: false, message: "Please enter valid price. ⚠️" });

        if (currencyId !== "INR")
           return res.status(400).send({ status: false, message: "currencyId should be in INR. ⚠️" })

        if (currencyFormat !== "₹")
           return res.status(400).send({ status: false, message: "currencyFormat should be in ₹. ⚠️" })

        if (!isValid(style))
           return res.status(400).send({ status: false, message: "Please enter valid style. ⚠️"})
               

        //---Duplicate_Validation---\\
        let duplicateTitle = await productModel.findOne({ title: title })
        if(duplicateTitle) return res.status(409).send({ status: false, message: "This title already exist" })

        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image ⚠️" });
        }
        let productImage = await uploadFile(files[0])
        console.log(product)
        let sendData = {title, description, price, currencyId, currencyFormat, productImage,
            isFreeShipping, style, availableSizes, installments }

        const createdDoc = await productModel.create(sendData)
        return res.status(201).send({ status: true, message: "Success", data: createdDoc })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}
// {"shipping":{"street":"22BakerSt.","city":"Gowtham","pincode":"110110"}
// ,"billing":{"street":"22BakerSt.","city":"Gowtham","pincode":"110110"}}

// price: {
//     type: Number,
//     required: true,
//     trim: true
//     // valid number/ decimal        // price: {number, mandatory, valid number/decimal},
// },

// productImage: {
//     type: String,
//     required: true // s3 link
// },



// ## Products API (_No authentication required_)
// ### POST /products
// - Create a product document from request body.
// - Upload product image to S3 bucket and save image public url in document.
// - __Response format__
//   - _**On success**_ - Return HTTP status 201. Also return the product document.
//    The response should be a JSON object like [this](#successful-response-structure)
// status: true,
// message: 'Success',
// data: {
// }
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. \
//   The response should be a JSON object like [this](#error-response-structure)

module.exports = { createProduct }