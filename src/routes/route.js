const express = require('express');
const router = express.Router();
const {validateUserPut} = require('../middlewares/commonMiddlewares.js');
const {authentication, authorisation} = require('../middlewares/auth.js');
const {createUser, login, getProfile, updateUser} = require('../controllers/userController.js');


router.post('/register', createUser);
router.post('/login', login );
router.get('/user/:userId/profile', authentication, getProfile);
router.put('/user/:userId/profile', authentication, authorisation, validateUserPut, updateUser)




module.exports = router;