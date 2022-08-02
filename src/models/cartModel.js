const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({            //POST /users/:userId/cart (Add to cart)

    userId      :{type:ObjectId,    required:true,  unique:true,    ref:'User'},
    items       :[{
       productId:{type:ObjectId,    required:true,  ref:'Product'},
       quantity :{type:Number,      required:true,  default:1},
                }],
    totalPrice  :{type:Number,      required:true},
    totalItems  :{type:Number,      required:true}

}, {timestamps:true});

module.exports = mongoose.model('Cart', cartSchema);

/*
    userId:{ObjectId, refs to User, mandatory, unique},
    items: [{
        productId: {ObjectId, refs to Product model, mandatory},
        quantity: {number, mandatory, min 1}
    }],
    totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
    totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
*/
/*
items: [{
        productId: {
            type: ObjectId,
            ref: 'Product',
            required: true,
        }, 
        quantity: {
            type: Number,
            required: true,
            trim: true,
            min: 1,
        },
        _id:false
    }],

*/