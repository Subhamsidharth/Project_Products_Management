const productModel = require('../models/productModel');
const {isValidObjectId} = require('../validators/validator');




//-------------------------------------------------------------getProduct---------------------------------
const getProductsById = async (req, res) => {
    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid productId" });
        }

        let Product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!Product) {
            return res.status(404).send({ status: false, msg: "No Product Found" });
        }
        return res.status(200).send({ status: true, message: 'Product found successfully', data: Product });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}
//-----------------------------------------------------DeleteApi--------------------------------------------------

module.exports={getProductsById}