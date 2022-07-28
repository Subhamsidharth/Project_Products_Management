const productModel = require('../models/productModel')

const mongoose = require("mongoose")
const {uploadFile} =require("../aws/aws")

const { isValid, isValidObjectId, isValidRequestBody, isImage, priceRegex} = require("../validators/validator")


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
        // if (!(files.productImage)) return res.status(400).send({ status: false, message: "ProductImage is mandatory" })
        
        //_Validation_\\
        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Please enter valid Title. ⚠️" });

        if (!isValid(description))
            return res.status(400).send({ status: false, message: "Please enter valid description. ⚠️" });
            
        if(!priceRegex.test(price))
            return res.status(400).send({ status: false, message: "Please enter valid price. ⚠️" });

        if (currencyId !== "INR")
           return res.status(400).send({ status: false, message: "currencyId should be in INR. ⚠️" })

        if (currencyFormat !== "₹")
           return res.status(400).send({ status: false, message: "currencyFormat should be in ₹. ⚠️" })

        if (!isValid(style))
           return res.status(400).send({ status: false, message: "Please enter valid style. ⚠️"})
      
        if((availableSizes) == 0 ) {
            return res.status(400).send({status: false, message: "Please enter atleast one size. ⚠️"})
        }

        if(availableSizes[0]==="[") availableSizes = availableSizes.substring(1,availableSizes.length-1)
        availableSizes = availableSizes.toUpperCase().split(',').map(x=> x.trim())
        // availableSizes = JSON.parse(availableSizes)
        availableSizes = [...new Set(availableSizes)];
        let check = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for(let i=0;i<availableSizes.length; i++){
            if(!check.includes(availableSizes[i])){
                return res.status(400).send({status: false, message: 'Size should be only in uppercase - S, XS, M, X, L, XXL, XL. ⚠️'})
            
            }
        }

       //---Duplicate_Validation---\\
        let duplicateTitle = await productModel.findOne({ title: title })
        if(duplicateTitle) return res.status(409).send({ status: false, message: "This title already exist" })

        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image ⚠️" });
        }
        if (!isImage(files[0].originalname))
        return res.status(400).send({ status: false, message: "Please enter the Image in a Valid format. ⚠️" });
        let productImage = await uploadFile(files[0])

        // console.log(profileImage)
        let sendData = {title, description, price, currencyId, currencyFormat, 
            productImage,isFreeShipping, style, availableSizes, installments }

        const createdDoc = await productModel.create(sendData)
        return res.status(201).send({ status: true, message: "Success", data: createdDoc })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//-------------------------------------------------------------getProduct---------------------------------
const getProductsById = async (req, res) => {
    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid productId" });
        }

        let Product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!Product) {
            return res.status(404).send({ status: false, msg: "No Product Found" });
        }
        return res.status(200).send({ status: true, message: 'Product found successfully', data: Product });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}
//-----------------------------------------------------DeleteApi--------------------------------------------------

module.exports={ createProduct, getProductsById}

