const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const userController=require("../controllers/userController")
const authMw= require("../middleware/auth")
const productController=require("../controllers/productController")
=======
const { createUser, userLogin, getUserDetail, updateUser } = require("../controllers/userController")
const productController = require("../controllers/productController")
const { authorisation, authentication } = require("../middleware/auth")
const { validateUserPut } = require("../middleware/validation")
>>>>>>> b1e4441478eab13a2213ec12e745f00b7e2d2280


//APIS for user
router.post("/register", createUser);
router.post("/login", userLogin);
router.get("/user/:userId/profile", authentication, getUserDetail)
// router.put("/user/:userId/profile",authMw.authentication, updateUser)
router.put('/user/:userId/profile', authentication, authorisation, validateUserPut, updateUser)

//------------------------------------------------------------------------------------------------
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



<<<<<<< HEAD
module.exports=router;
=======
module.exports = router;
>>>>>>> b1e4441478eab13a2213ec12e745f00b7e2d2280
