const { default: mongoose } = require("mongoose")
const orderModel=require("../models/orderModel.js")
const{isValidRequestBody,isValidObjectId}=require("../validators/validator")
const createOrder=async function(req,res){
    try{
        let userId = req.params.userId
        let orderData = req.body
        let{cartId,items,productId,quantity,totalPrice,totalItems,totalQuantity,cancellable,status,deletedAt,isDeleted }=req.body
        if(!isValidRequestBody(orderData))
        return res.status(400).send({status:false,message:"body can't be empty ,plz provide data"})
        if(!isValidObjectId(userId))
        return res.status(400).send({status:false,message:"Params userId is invalid"})
        
      //create order data
      let data=await orderModel.create(orderData)
      return res.status(200).send({status:false,data:data})
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createOrder}