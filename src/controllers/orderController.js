const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const {isValid,isValidObjectId,isValidRequestBody,isBoolean} = require("../validators/validator");
const { default: mongoose } = require("mongoose")


// ### POST /users/:userId/orders
// - Create an order for the user
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get cart details in the request body
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the order document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

const createOrder = async (req, res)=>{ //authentication >> authotrisation >> createOrder
    try {
        const userId = req.params.userId
        let { cartId, cancellable } = req.body

        if (!isValidRequestBody(req.body))  return res.status(400).send({ status: false, message: "can't proceed the request with empty body" });
        const error = {};
        if(!mongoose.Types.ObjectId.isValid(userId))                              error['userId error']      =       "userId is not valid" ;
        if (!isValid(cartId))                                                     error['cartId error']      =       "Please provide The cartId" 
        if (cartId && !(mongoose.Types.ObjectId.isValid(cartId)))                 error['cartId error']      =       "cartId is not valid" ;
        if (cancellable && !["true", "false", true, false].includes(cancellable)) error['cancellable error'] =       "cancellable value should be a Boolean";
        if(Object.keys(error).length > 0) return res.status(400).send({status:false, message:error})

        const user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(400).send({ status: false, msg: "User not found" });
        
        const cart = await cartModel.findOne({ _id: cartId });
        if (!cart || !cart.items.length)  return res.status(404).send({ status: false, message: "cart does not exist with the provided cartId" })
        if (cart.userId.toString() !== userId)  return res.status(403).send({ status: false, message: `you(${userId}) are not permitted to make order in others(${cart.userId}) cart`});

        const totalItems = cart.items.length
        let totalQuantity = 0;
        for (let i in cart.items) {totalQuantity += cart.items[i].quantity}
        const orderData = {userId: userId, items: cart.items, totalPrice: cart.totalPrice, totalItems: totalItems, totalQuantity: totalQuantity, cancellable: cancellable}

        let order = await orderModel.create(orderData);
        order = await orderModel.findById(order._id).populate({path:'items.productId', select:{title:1, price:1, productImage:1}})
        await cartModel.updateOne({_id:cart._id}, {$set:{items:[], totalItems:0, totalPrice:0}})    //cart empty
        return res.status(201).send({status: true, msg: "Your Order Has Been Placed", data: order})
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}



// ## PUT /users/:userId/orders
// - Updates an order status
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get order id in request body
// - Make sure the order belongs to the user
// - Make sure that only a cancellable order could be canceled. Else send an appropriate error message and response.


const updateOrder = async function (req, res) { //authentication >> authotrisation >> updateOrder
    try {
        let userId = req.params.userId
        let { status, orderId } = req.body

        if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })
        if(!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "orderId is invalid" });
        if(!status) return res.status(400).send({status:false, message:"please enter the status to update"})

        const arr = ["pending", "completed", "cancelled"]
        if(status && (!arr.includes(status))) return res.status(400).send({ status: false, message: `status should be in ${arr}`})

        let findUserId = await userModel.findById({ _id: userId })
        if (!findUserId) return res.status(404).send({ status: false, message: "this userid is not present in DB" })

        let findOrderId = await orderModel.findById({ _id: orderId, isDeleted: false })
        if (!findOrderId) return res.status(404).send({ status: false, message: "this Orderid is not present in DB" })
        if (userId != findOrderId.userId) return res.status(404).send({ status: false, message: "this order is not belongs to the params user" })

        function checkStatus(existStatus, cancValue, reqStatus) {
            if (cancValue == true) {
                if (existStatus === "pending" && ["cancelled", "completed"].includes(reqStatus)) return true
                // if (existStatus === "completed" && (reqStatus === "cancelled")) return true  //after discussion with friends
            }
            if (cancValue == false && existStatus === "pending" && (reqStatus === "completed")) return true
            return false
        }

        if (!checkStatus(findOrderId.status, findOrderId.cancellable, status)) return res.status(400).send({ status: false, message: `status : ${status} cannot be updated after this status :${findOrderId.status}`})

        // let objUpdate = {}
        // if (status) objUpdate.status = status // not required

        let updateOrder = await orderModel.findByIdAndUpdate(findOrderId._id, status, { new: true })
        return res.status(200).send({ status: true, message:"Success", data: updateOrder })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




module.exports = {createOrder,updateOrder}



