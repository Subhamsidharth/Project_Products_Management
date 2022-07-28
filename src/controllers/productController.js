const productModel=require("../models/productModel")
 //const ObjectId = require('mongoose').Types.ObjectId;
const mongoose=require("mongoose")
//const productModel = require('../models/productModel');
const {isValidObjectId} = require('../validators/validator');
const {uploadFile} =require("../aws/aws")



const updateProduct=async function(req,res){
    try{
        
        let productId=req.params.productId
        let reqData=req.body

        let{title,description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments,isDeleted, ...rest}=req.body
        
        //check body is empty or not
        if(!Object.keys(reqData).length)
        return res.status(400).send({status:false, message:"please enter some data in req.body"})
        //chck any unwanted field
        if(Object.keys(rest).length > 0)
        return res.status(400).send({status:false,message:"please provide valid fields"})
        //check id
         if(!mongoose.Types.ObjectId.isValid(productId))
          return res.status(400).send({status:false,message:"productId is invalid"})
          var regName=/^[a-zA-Z0-9]+/
          if(title &&(!regName.test(title)))return res.status(400).send({status:false,message:"title is invalid"})
        if(description && (!regName.test(description))) 
        return res.status(400).send({status:false,message:"description is invalid"})
        var priceRegx=/^[1-9]\d{0,7}(?:\.\d{1,4})?$/
        if(price &&(!priceRegx,test(price)))
        return res.status(400).send({status:false,message:"price should be valid format"})

        if(isFreeShipping && (!typeof isFreeShipping ==="boolean"))
        return res.status(400).send({status:false,message:"isFreeeShopping shoud be true or false"})

        if(style && (!regName.test(style)))
        return res.status(400).send({status:false,message:"style is invalid"})

        if(installments &&(!priceRegx.test(installments)))
        return res.status(400).send({status:false,message:"price should be number"})
        if(isDeleted && (!typeof isDeleted ==="boolean"))
        return res.status(400).send({status:false,message:"isDeleted shoud be true or false"})
        let availableSize
        if(availableSizes){
         availableSize = availableSizes .toUpperCase().split(",")
         console.log(availableSize)
         for(let i=0; i<availableSizes.length; i++){
            if(!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])){
               return res.status(400).send({status:false,message:`sizes should be ${["S", "XS", "M", "X", "L", "XXL", "XL"]}`})
            }
         }
        }
        reqData.availableSizes=availableSize
        
        var regEx = /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/;    //source:https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
       if(productImage &&(!regEx.test(productImage)))
       return res .status(400).send9({status:false, message:"plz provide valid image"})
       
        let findProductId=await productModel.findById({_id:productId}) 
        //console.log(findProductId)
        if(!findProductId)
         return res.status(404).send({status:false,message:"productId is not present in Db"})

        if(findProductId.isDeleted) return res.status(404).send({status:false,message:"this product is already deleted"})


        // update book
        let updatedData=await productModel.findByIdAndUpdate(productId,reqData,{new:true})
        //console.log(updatedData)
        res.status(200).send({status:true,message:"upadated successfully",data:updatedData})
     }catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
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

module.exports={getProductsById,updateProduct}
