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


module.exports.createOrder = createOrder;

/*
updateOrder(assuming cancellable:true)
#inDoc      #inReqBody  #afterResponse

pending     completed   completed       ✔🟢
pending     cancelled   cancelled       ?possible

completed   cancelled   cancelled       ✔🟢
completed   pending     pending         ?err

cancelled   pending     pending         ?err
cancelled   completed   completed       ?err
*/

// function checkStatus(existStatus, cancValue, reqStatus){
//     if(cancValue == true){
//         if(existStatus === "pending"){
//             if(reqStatus === "pending") return false
//             else return true
//         }
//         if(existStatus === "completed"){
//             if(reqStatus === "cancelled") return true
//             else return false
//         }
//         return false    
//     }
//     if(cancValue == false){
//         if(existStatus === "pending" && (reqStatus === "completed")) return true
//         else return false
//     }
// }

//after re.body
// if(cancellable === "true") cancellable = true;
// if(cancellable === "false") cancellable = false;

function checkStatus(existStatus, cancValue, reqStatus){
    if(cancValue == true){
        if(existStatus === "pending" && ["cancelled", "completed"].includes(reqStatus)) return true
        if(existStatus === "completed" && (reqStatus === "cancelled")) return true
    }       
    if(cancValue == false && existStatus === "pending" && (reqStatus === "completed")) return true
     return false
}

// if(!checkStatus(order.status, order.cancellable, status)) return res.status(400).send({status:false, message:`status : ${status} cannot be updated after this status :${order.status}`})
console.log(checkStatus( "pending", true, "completed",));
console.log(checkStatus( "pending", true, "pending",));
console.log(checkStatus( "cancelled", true, "pending",));
console.log(checkStatus( "pending", false, "completed",));
console.log(checkStatus( "pending", false, "pending",));
console.log(checkStatus( "cancelled", false, "pending",));
console.log(checkStatus( "pending", true, "cancelled",));



console.log("false" == false)
console.log("true" == true)
let cancellable = "false"

console.log(cancellable, typeof cancellable)