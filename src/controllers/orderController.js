const { default: mongoose } = require("mongoose")
const orderModel = require("../models/orderModel.js")
const userModel = require("../models/userModel.js")
const cartModel=require("../models/cartModel")
const {isValid,isValidObjectId,isValidRequestBody,isBoolean} = require("../validators/validator")

// ### POST /users/:userId/orders
// - Create an order for the user
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get cart details in the request body
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the order document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

const createOrder = async (req, res)=>{
    try {
        const userId = req.params.userId
        let Body = req.body

        if (!(isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "userId is not valid" });;
        }
        const user = await userModel.findOne({ _id: userId })
        if (!user) {
           return res.status(400).send({ status: false, msg: "User not found" })
        }
      //----------------------Authorisation----------------------------------------------
        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please provide The Body" });
        }
        let { cartId, cancellable } = Body
        if (!(isValidObjectId(cartId))) {
            return res.status(400).send({ status: false, message: "cartId is not valid" });;
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide The cartId" });
        }
        if(cancellable){
        if (!isValid(cancellable)) {
            return res.status(400).send({ status: false, message: "kuch vi vejoge kya" });
        }
        if (!isBoolean(cancellable)) {
            return res.status(400).send({ status: false, message: "Status should be among 'True' & 'false'" });
        }}

        const cartDetails = await cartModel.findOne({ _id: cartId })
        if (!(cartDetails.userId == userId)) {
            return res.status(400).send({ status: false, message: "This Cart does not belong to You" });

        }

        if (!cartDetails) {
            return res.status(400).send({ status: false, message: "cart not present" });
        }

        const totalItems = cartDetails.items.length
        var totalQuantity = 0;
        for (let i in cartDetails.items) {totalQuantity += cartDetails.items[i].quantity}
        const orderData = {
            userId: userId,
            items: cartDetails.items,
            totalPrice: cartDetails.totalPrice,
            totalItems: totalItems,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            }
        const order = await orderModel.create(orderData)
        return res.status(201).send({ status: true, msg: "Your Order Has Been Placed", data: order })
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


const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let { status, orderId } = req.body

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "orderId is invalid" })

        if (status && (!["pending", "completed", "cancelled"].includes(status)))
            return res.status(400).send({ status: false, message: `status should be in ${["pending", "completed", "cancelled"]}` })

        let findUserId = await userModel.findById({ _id: userId })
        if (!findUserId) return res.status(404).send({ status: false, message: "this userid is not present in DB" })

        let findOrderId = await orderModel.findById({ _id: orderId, isDeleted: false })
        if (!findOrderId) return res.status(404).send({ status: false, message: "this Orderid is not present in DB" })

        if (userId != findOrderId.userId) return res.status(404).send({ status: false, message: "this order is not belongs to the params user" })

        function checkStatus(existStatus, cancValue, reqStatus) {
            if (cancValue == true) {
                if (existStatus === "pending" && ["cancelled", "completed"].includes(reqStatus)) return true
                if (existStatus === "completed" && (reqStatus === "cancelled")) return true
            }
            if (cancValue == false && existStatus === "pending" && (reqStatus === "completed")) return true
            return false
        }

        if (!checkStatus(findOrderId.status, findOrderId.cancellable, status))
        //return res.status(400).send({ status: false, message: `status : ${status} cannot be updated after this status :${findOrderId.status}` })
        return res.status(400).send({ status: false, message: "invalid to update"})
        let objUpdate = {}
        if (status) objUpdate.status = status

        let updateOrder = await orderModel.findByIdAndUpdate(findOrderId, objUpdate, { new: true })
        return res.status(200).send({ status: true, data: updateOrder })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {createOrder,updateOrder}



