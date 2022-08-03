/*
const test = async function(){
    const pass = bcrypt.hashSync("12345", 10);
    // const pass = await bcrypt.hash("12345", 10);
    const comparison = await bcrypt.compare("12346", pass);


    console.log(pass);
    console.log(comparison);
    return "jhjh"
}

test()

//-----------------------------------BEAUTYIFUL MESSAGES ---------------------------//
 // console.log(address)

        //-----------------------------------------------------
        // if (!address || typeof address != "object") {
        //     return res.status(400).send({ status: false, message: "Object of address is required. ⚠️" });
        // }
        // if (!address.shipping || typeof address.shipping != "object") {
        //     return res.status(400).send({ status: false, message: "Object shipping address is required...❗", });
        // }
        // if (!address.billing || typeof address.billing != "object") {
        //     return res.status(400).send({ status: false, message: "Object billing address is required...❗", });
        // }
        // if (!isValid(address.shipping.street)) {
        //     return res.status(400).send({ status: false, message: "Street of shipping address is required...❗", });
        // }
        // if (!isValidScripts(address.shipping.street)) {
        //     return res.status(400).send({ status: false, message: "street is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $]. ❗", });
        // }

        // if (!isValid(address.shipping.city)) {
        //     return res.status(400).send({ status: false, message: "City of shipping address is required...❗", });
        // }

        // if (!isValidPincode(address.shipping.pincode)) {
        //     return res.status(400).send({ status: false, message: "Shipping address pincode must be 6 digit number. ❗", });
        // }

        // if (!isValid(address.billing.street)) {
        //     return res.status(400).send({ status: false, message: "Street of billing address is required...❗", });
        // }

        // if (!isValid(address.billing.city)) {
        //     return res.status(400).send({ status: false, message: "City of billing address is required...❗", });
        // }

        // if (!isValidPincode(address.billing.pincode)) {
        //     return res.status(400).send({ status: false, message: "Billing address pincode must be 6 digit number ❗", });
        // }
       
        1
        2 2
        3 3 3
        4 4 4 4

        const updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        let { productId, cartId, removeProduct } = req.body

        productId = productId
        cartId = cartId
        removeProduct = removeProduct

        if (!cartId) {
            return res.status(400).send({ status: false, message: "cartId be must required..." })
        }
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId must be required..." })
        }
        if (!removeProduct && removeProduct != 0 ) {
            return res.status(400).send({ status: false, message: "removeProduct key must be required..." })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Not a valid cartId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Not a valid ProductId" })
        }

        if (!(removeProduct == "1" || removeProduct == "0")) {
            return res.status(400).send({ status: false, message: "removeProduct value only can be 0 or 1" })
        }

        const cartInDB = await cartModel.findOne({ _id: cartId })
       
        if (!cartInDB) {
            return res.status(404).send({ status: false, message: "cartId does not exist" })
        }

        const productInDB = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productInDB) {
            return res.status(404).send({ status: false, message: "productId does not exist" })
        }

        const productIdInCart = await cartModel.findOne({ userId: userId, "items.productId": productId })

        if (!productIdInCart) {
            return res.status(404).send({ status: false, message: "productId does not exist in this cart" })
        }
        let { items } = cartInDB
        let getPrice = productInDB.price

        for (let i = 0; i < items.length; i++) {
            if (items[i].productId == productId) {

                let totelProductprice = items[i].quantity * getPrice

                if (removeProduct == 0 || (items[i].quantity == 1 && removeProduct == 1)) {

                    const removeCart = await cartModel.findOneAndUpdate({ userId: userId },
                        {
                            $pull: { items: { productId: productId } },
                            $inc: {
                                totalPrice: - totelProductprice,
                                totalItems: - 1
                            }
                        },
                        { new: true })

                    return res.status(200).send({ status: true, message: 'sucessfully removed product from cart', data: removeCart })

                }

                const product = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": -1, totalPrice: -getPrice } }, { new: true })

                return res.status(200).send({ status: true, message: 'sucessfully decrease one quantity of product', data: product })
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}
//---
   if (address[0] != "{" || address[address.length - 1] != "}") {
            return res.status(400).send({ status: false, message: "⚠️ adress should be valid object" })
        }
*/