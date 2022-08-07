const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const productModel = require("../models/productModel")

const { isValid, isValidObjectId, isValidRequestBody, isImage, priceRegex } = require("../validators/validator")
const { default: mongoose } = require("mongoose")


function isId(x) {
    if (!x) return "this id is missing in input";
    if (typeof x !== "string") return "this id must be in string format";
    if (!mongoose.Types.ObjectId.isValid(x)) return "entered id is not a valid id";
    return true;
};

//tested=> all ok
const createCart = async function (req, res) {
    try {

        const userId = req.params.userId;
        let { items, productId, quantity, cartId } = req.body; //by items or by productId
        if (!quantity) quantity = 1;

        function isItems(items) {
            if (!Array.isArray(items)) return "items value should be an array";
            if (!items[0]) return "items value is missing";
            if (Object.keys(items[0]).length === 0) "items value should be an Object with atleast productId as a key";
            if (!items[0].productId) return "enter product id in items"
            else productId = items[0].productId;
            if (!items[0].quantity) quantity = 1
            else quantity = items[0].quantity;
            return true
        }

        if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "can't create cart with empty body" });
        const inputError = {};
        if (isId(userId) !== true) inputError['userId'] = isId(userId);
        if (items && (isItems(items) !== true)) inputError['items'] = isItems(items);
        if (isId(productId) !== true) inputError['productId'] = isId(productId);
        if (cartId && (isId(cartId) !== true)) inputError['cartId'] = isId(cartId);
        if (quantity && (!(Number(quantity) > 0) || (parseInt(quantity) != quantity))) inputError['quantity'] = "quantity must be >= 1 & an integer type";
        if (Object.keys(inputError).length > 0) return res.status(400).send({ status: false, message: { inputError } });

        quantity = Number(quantity)
        const user = await userModel.findById(userId).lean();
        if (!user || user.isDeleted) return res.status(404).send({ status: false, message: "user does not exist" })

        const productDoc = await productModel.findById(productId);
        if (!productDoc || productDoc.isDeleted) return res.status(404).send({ status: false, message: "product does not exists" })
        const price = productDoc.price;

        const cart = await cartModel.findOne({ userId: userId }).lean();
        //checking for existing cart //must do be another update way
        let totalPrice; let totalItems;
        if (cart) {
            items = cart.items;
            let productExistAtIndex;
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) { productExistAtIndex = i; break }
            }
            if (productExistAtIndex !== undefined) {
                items[productExistAtIndex].quantity += quantity;
                totalItems = cart.totalItems
            } else {
                items.push({ productId, quantity });
                totalItems = cart.totalItems + 1;
            };
            totalPrice = cart.totalPrice + price * quantity;

            const cartData = { items, totalPrice, totalItems };
            const savedCart = await cartModel.findByIdAndUpdate(cart._id, { $set: cartData }, { new: true }).populate({ path: 'items.productId', select: { title: 1, price: 1, productImage: 1 } }).lean()      //.populate({path:'users', options:{strictPopulate:false}});

            return res.status(200).send({ status: true, message: "product added to cart successfully", data: savedCart });

        } else {  //create new cart
            items = [{ productId, quantity }];
            totalPrice = price * quantity;
            totalItems = 1;
            const cartData = { userId, items, totalPrice, totalItems };

            let savedCart = await cartModel.create(cartData);      //"cartModel.create(...).populate is not a function", "cartModel.create(...).lean is not a function"
            savedCart = await cartModel.findById(savedCart._id).populate({ path: 'items.productId', select: { title: 1, productImage: 1, price: 1 } }).lean();
            return res.status(201).send({ status: true, message: "cart created successfully", data: savedCart });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err.message });
    }
}
//--------------------------------Update Cart || Put Api---------------------------------------------------//
// ### PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
// - Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
// - Get cart id in request body.
// - Get productId in request body.
// - Get key 'removeProduct' in request body. 
// - Make sure that cart exist.
// - Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist.
// - Get product(s) details in response body.
// - Check if the productId exists and is not deleted before updating the cart.

const updateCart = async (req, res) => { //tested=> pending, need rectification
    try {
        const userId = req.params.userId
        const Body = req.body
        let { productId, removeProduct, cartId } = Body
        if (!userId) {
            return res.status(400).send({ status: false, message: "userid is required" })
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid user id" })
        }
        if (cartId && !mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "Invalid CartId" })
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "Invalid ProductId" })
        }
      
        let user = await userModel.findById({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, message: "user dont exist" });
        }
        //cart Id validation
        if (!isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "No Data For Update" })
        }
       
        if(!removeProduct) return res.status(400).send({staus:false, message:"removeProduct is missing"});
        if(removeProduct!=0 && removeProduct!=1) return res.status(400).send({staus:false, message:"removeProduct must be 1 or 0"});



        const findCart = await cartModel.findOne({ userId: userId })
        
        if(cartId && (cartId!=findCart._id))
        return res.status(404).send({ status: false, message: "This CartId is not releted to the Provided UserId " });
        if (!findCart || findCart.items.length === 0) {
            return res.status(400).send({ status: false, message: `cart does not exist` })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: "Product does not Exist in the Product Collection." })
        }

        if (removeProduct == 1) {
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId == productId) {
                    const updatedPrice = findCart.totalPrice - product.price
                    findCart.items[i].quantity = findCart.items[i].quantity - 1
                    // console.log("abc")

                    if (findCart.items[i].quantity > 0) {
                        const Data = await cartModel.findOneAndUpdate({ userId:userId }, { items: findCart.items, totalPrice: updatedPrice }, { new: true })
                        return res.status(200).send({ status: true, message: "Success", data: Data })
                    }
                    else {
                        const totalItems1 = findCart.totalItems - 1
                        findCart.items.splice(i, 1)

                        const data = await cartModel.findOneAndUpdate({userId:userId }, { items: findCart.items, totalItems: totalItems1, totalPrice: updatedPrice }, { new: true })
                        return res.status(200).send({ status: true, message: "Success", data: data })

                    }
                }

            }    
        }
        if (removeProduct == 0) {
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId == productId) {
                    const updatedPrice = findCart.totalPrice - (product.price * findCart.items[i].quantity)
                    const TotalItems = findCart.totalItems - 1
                    findCart.items.splice(i, 1)
                    const result = await cartModel.findOneAndUpdate({ userId:userId }, { items: findCart.items, totalItems: TotalItems, totalPrice: updatedPrice }, { new: true })
                    return res.status(200).send({ status: true, message: "Success", data: result })

                }
            }
        }
        return res.status(404).send({ status: false, message: "This product is not inside the cart" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error })
    }
}

//tested=> all ok
const getCart = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, mesage: "UserId required" })

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, mesage: "invalid userId" })
        }
        // AUTHORISATION
        // if (userId !== req.userId) {
        //    return res.status(401).send({ status: false, msg: "Unauthorised access" })
        // }

        const userExist = await userModel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, message: "User doesn't exist" })

        const findCart = await cartModel.findOne({ userId: userId }).populate({ path: 'items.productId', select: { title: 1, price: 1, productImage: 1 } })                //
        if (!findCart) return res.status(404).send({ status: false, message: "No cart found" })
        if (findCart.items.length == 0) return res.status(404).send({ status: false, message: "This user has no cart collection" })

        return res.status(200).send({ status: true, message: "Success", data: findCart });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message });

    }
}

//tested=> all ok
const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).send({ status: false, message: "invalid userId" });

        //
        let checkUserId = await userModel.findById({ _id: userId })
        if (!checkUserId) return res.status(404).send({ status: false, message: "This user id is not present in DB" })

        let cartExist = await cartModel.findOne({ userId: userId })

        if (!cartExist) return res.status(404).send({ status: false, message: "No cart is available for this UserId" })

        if (cartExist.items.length === 0)
            return res.status(404).send({ status: false, message: "This cart is already deleted" })

        let updateCart = await cartModel.findByIdAndUpdate(cartExist, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })
        return res.status(204).send({ status: true, message: "successfully deleted", data: updateCart })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { createCart, updateCart, getCart, deleteCart };

/*
find(...).
  populate({
    path: 'fans',
    match: { age: { $gte: 21 } },
    // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    select: 'name -_id'
  }).
  exec();
*/
/*
model.findOne({}, undefined, { populate: {path: 'fooo', options: {strictPopulate: false}}, option: {strictPopulate: false}, })
*/
