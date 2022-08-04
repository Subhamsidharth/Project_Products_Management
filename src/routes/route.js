const express = require('express');
const router = express.Router();
const { authorisation, authentication } = require("../middlewares/auth");
const { validateUserPut, validateProduct } = require("../middlewares/validation");
const { createUser, userLogin, getUserDetail, updateUser } = require("../controllers/userController");
const {createProduct,getProductsById,getProductsByQuery,updateProduct,deleteProduct} = require("../controllers/productController");
const {createCart, updateCart, getCart, deleteCart}= require("../controllers/cartController");
const{createOrder,updateOrder} =require("../controllers/orderController");




//APIS for user
router.post("/register", createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserDetail)
router.put('/user/:userId/profile', authentication, validateUserPut, updateUser) //tested: working // ommit authorisation

//------------------------------------------------------------------------------------------------
//APIS for product
router.post("/products", validateProduct,createProduct);
router.get("/products", getProductsByQuery);
router.get("/products/:productId", getProductsById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProduct)

//===============================================================================
router.post("/users/:userId/cart",authentication,createCart)   //only authentication required(TC)
router.put("/users/:userId/cart",authentication,authorisation,updateCart); //authentication + authorisation (TC)
router.get('/users/:userId/cart',authentication,authorisation,getCart);  //authentication + authorisation (TC)
router.delete('/users/:userId/cart',authentication,authorisation,deleteCart) //authentication + authorisation (TC)

//=================================================================================
router.post("/users/:userId/orders",createOrder)

//APIs for order
router.post("/users/:userId/orders",createOrder)     // POST /users/:userId/orders
router.put('/users/:userId/orders',updateOrder)      //PUT /users/:userId/orders

//--------------------------------------------------------------------------
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})  //awesome



module.exports=router;

