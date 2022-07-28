const express = require('express');
const router = express.Router();
//const userController=require("../controllers/userController")
//const authMw= require("../middleware/auth")
//const productController=require("../controllers/productController")
const { createUser, userLogin, getUserDetail, updateUser } = require("../controllers/userController")
const productController = require("../controllers/productController")
const { authorisation, authentication } = require("../middleware/auth")
const { validateUserPut } = require("../middleware/validation")



//APIS for user
router.post("/register", createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserDetail)
// router.put("/user/:userId/profile",authMw.authentication, updateUser)
router.put('/user/:userId/profile', authentication, authorisation, validateUserPut, updateUser)

//------------------------------------------------------------------------------------------------
//APIS for product
router.post("/products", productController.createProduct)

router.get("/products/:productId", productController.getProductsById)

//APIs for product
router.put("/products/:productId",productController.updateProduct)




//--------------------------------------------------------------------------
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})



module.exports=router;
//module.exports = router;
