const { default: mongoose } = require("mongoose")
const orderModel = require("../models/orderModel.js")
const userModel = require("../models/userModel.js")
const { isValidRequestBody, isValidObjectId } = require("../validators/validator")
// const createOrder=async function(req,res){
//     try{
//         let userId = req.params.userId
//         let orderData = req.body
//         let{cartId,items,productId,quantity,totalPrice,totalItems,totalQuantity,cancellable,status,deletedAt,isDeleted }=req.body
//         if(!isValidRequestBody(orderData))
//         return res.status(400).send({status:false,message:"body can't be empty ,plz provide data"})
//         if(!isValidObjectId(userId))
//         return res.status(400).send({status:false,message:"Params userId is invalid"})

//       //create order data
//       let data=await orderModel.create(orderData)
//       return res.status(200).send({status:false,data:data})
//     }catch(error){
//         return res.status(500).send({status:false,message:error.message})
//     }
// }


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
        if (!findUserId) return res.status(400).send({ status: false, message: "this userid is not present in DB" })

        let findOrderId = await orderModel.findById({ _id: orderId, isDeleted: false })
        if (!findOrderId) return res.status(400).send({ status: false, message: "this Orderid is not present in DB" })

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
        return res.status(400).send({ status: false, message: `status : ${status} cannot be updated after this status :${findOrderId.status}` })

        let objUpdate = {}
        if (status) objUpdate.status = status

        let updateOrder = await orderModel.findByIdAndUpdate(findOrderId, objUpdate, { new: true })
        return res.status(200).send({ status: true, data: updateOrder })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//module.exports={createOrder ,updateOrder}
module.exports = { updateOrder }