const express = require('express');
const router = express.Router();
const { authorisation, authentication } = require("../middlewares/auth");
const { validateUserPut, validateProduct } = require("../middlewares/validation");
const { createUser, userLogin, getUserDetail, updateUser } = require("../controllers/userController");
const productController = require("../controllers/productController");
const {createCart, updateCart, getCart, deleteCart}= require("../controllers/cartController");




//APIS for user
router.post("/register", createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserDetail)
router.put('/user/:userId/profile', authentication, authorisation, validateUserPut, updateUser) //tested: working

//------------------------------------------------------------------------------------------------
//APIS for product
router.post("/products", validateProduct, productController.createProduct);
router.get("/products", productController.getProductsByQuery);
router.get("/products/:productId", productController.getProductsById)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteProduct)

//===============================================================================
router.post("/users/:userId/cart",createCart)
router.put("/users/:userId/cart",authentication,authorisation,updateCart);
router.get('/users/:userId/cart',getCart);
router.delete('/users/:userId/cart',deleteCart)



//--------------------------------------------------------------------------
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})  //awesome



module.exports=router;

