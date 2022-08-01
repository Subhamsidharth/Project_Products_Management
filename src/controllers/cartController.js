const cartModel = require('../models/cartModel.js');

//POST /users/:userId/cart (Add to cart)
const createCart = async function(req, res){
    try {
        const data = req.body;
        const savedCart = await cartModel.create(data);
        return res.status(201).send({status:false, message:"cart created successfully", data:savedCart});
    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message:err.message});
    }
}


module.exports = {createCart};