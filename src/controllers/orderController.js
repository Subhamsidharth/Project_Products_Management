const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const {isValid,isValidObjectId,isValidRequestBody,isValidStatus} = require("../validators/validator")


module.exports.createOrder = async (req, res)=>{
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
        let { cartId, cancellable, status } = Body
        if (!(isValidObjectId(cartId))) {
            return res.status(400).send({ status: false, message: "cartId is not valid" });;
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide The cartId" });
        }
        if (!isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide The status" });
        }
        if (!isValidStatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        }

        const cartDetails = await cartModel.findOne({ _id: cartId })
        if (!(cartDetails.userId == userId)) {
            return res.status(400).send({ status: false, message: "This Cart does not belong to You" });

        }

        if (!cartDetails) {
            return res.status(400).send({ status: false, message: `cart not present` });
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
            status: status

        }
        const order = await orderModel.create(orderData)
        return res.status(201).send({ status: true, msg: "Your Order Has Been Placed", data: order })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}

