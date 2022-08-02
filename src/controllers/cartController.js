const { default: mongoose, isValidObjectId } = require('mongoose');
const cartModel = require('../models/cartModel.js');
const userModel = require('../models/userModel.js');

//POST /users/:userId/cart (Add to cart)
function isId(x){
    if(!x) return "this id is missing in input";
    if(typeof x !== "string") return "this id must be in string format";
    if(!mongoose.Types.ObjectId.isValid(x)) return "entered id is not a valid id";
    return true; 
};

const createCart = async function(req, res){
    try {

        const userId = req.params.userId;
        let {items, productId, quantity, cartId} = req.body; //by items or by productId
        if(!quantity) quantity=1;
        
        function isItems(items) {                                             
            if(!Array.isArray(items)) return "items value should be an array";          
            if(!items[0]) return "items value is missing";
            if(Object.keys(items[0]).length === 0) "items value should be an Object with atleast productId as a key";   
            if(!items[0].productId) return "enter product id in items"
            else productId = items[0].productId;
            if(!items[0].quantity) quantity = 1
            else quantity = items[0].quantity;
            return true
        }

        const inputError={};
        if(isId(userId) !== true) inputError['userId'] = isId(userId);
        if(items && (isItems(items) !== true)) inputError['items'] = isItems(items);
        if(isId(productId) !== true) inputError['productId'] = isId(productId);
        if(cartId && (isId(cartId) !== true)) inputError['cartId'] = isId(cartId);
        if(quantity && (!(Number(quantity)>0) || (parseInt(quantity) != quantity)) ) inputError['quantity'] = "quantity must be >= 1 & an integer type";
        if(Object.keys(inputError).length > 0) return res.status(400).send({status:false, message:{inputError}});
       
        const user = await userModel.findById(userId).lean();
        if(!user || user.isDeleted) return res.status(404).send({status:false, message:"user does not exist"}) 

        const productDoc = await productModel.findById(productId);                                               
        if(!productDoc || productDoc.isDeleted) return res.status(404).send({status:false, message:"product does not exists"})
        const price = productDoc.price;

        const cart = await cartModel.findOne({userId:userId});                                                               
         //checking for existing cart //must do be another update way
        let totalPrice; let totalItems;
        if(cart){    
            items = cart.items;                                                 
            let productExistAtIndex;
                for(let i=0; i<items.length; i++){  
                    if(items[i].productId.toString() === productId){productExistAtIndex = i; break}
                }
            if(productExistAtIndex !== undefined) {
                items[productExistAtIndex].quantity += quantity;
                totalItems = cart.totalItems
            }else{
                items.push({productId, quantity});
                totalItems = cart.totalItems + 1;
            };                                     
            totalPrice = cart.totalPrice + price*quantity;

            const cartData = {items, totalPrice, totalItems};                  
            const savedCart = await cartModel.findByIdAndUpdate( cart._id, {$set: cartData}, {new:true}).populate({path:'items.productId', select:{title:1, price:1, productImage:1}})      //.populate({path:'users', options:{strictPopulate:false}});

            return res.status(200).send({status:true, message:"product added to cart successfully", data:savedCart});
            
        }else{  //create new cart
            items = [{productId, quantity}];
            totalPrice = price*quantity;
            totalItems = 1;
            const cartData = {userId, items, totalPrice, totalItems};                  

            let savedCart = await cartModel.create(cartData);      //"cartModel.create(...).populate is not a function", "cartModel.create(...).lean is not a function"
            savedCart = cartModel.findById(savedCart._id).populate({path:'items.productId', select:{title:1, productImage:1, price:1}});                         
            return res.status(201).send({status:true, message:"cart created successfully", data:savedCart});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message:err.message});
    }
}

const getCart = async (req,res ) => {
    try {
        let userId = req.params.userId

        if(!userId) return res.status(400).send({status: false, mesage: "UserId required"})

        if(!isValidObjectId(userId)){
            return res.status(400).send({status: false, mesage: "invalid userId"})
        }
        
        const findCart  = await cartModel.findOne({userId : userId})
        if(!findCart ) return res.status(404).send({status: false, message: "No cart found"}) 
        
        if(findCart.items.length == 0) return res.status(404).send({status: false, message: "This user has no cart collection"}) 

        return res.status(200).send({status:true, message:"Success", data: findCart});
    } catch (error) {
        console.log(error);
        return res.status(500).send({status:false, message:error.message});
        
    }
}

const deleteCart=async function(req,res){
    try{
        let userId=req.params.userId
        if(!mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).send({status:false,message:"invalid userId"})
        let checkUser=await userModel.findById({userId:userId})
        if(checkUser) return res.status(404).send({status:false,message:"No user present in DB"})
        
        let cartExist = await cartModel.findOne({userId:userId})
        if(!cartExist) return res.status(404).send({status:false,message:"No cart is available for this UserId"})
        
        if(cartExist.items.length === 0)
        return res.status(404).send({status:false, message:"This cart is already deleted"})

        let updateCart=await cartModel.findByIdAndUpdate(cartExist,{$set:{items:[],totalItems:0,totalPrice:0}},{new:true}) 
        return res.status(204).send({status:true,message:"successfully deleted",data:updateCart})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }

}
//  Deletes the cart for the user.
// - Make sure that cart exist.
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - cart deleting means array of items is empty, totalItems is 0, totalPrice is 0.

module.exports = {createCart,deleteCart,getCart};



