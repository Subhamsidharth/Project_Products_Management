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
const deleteProduct = async (req, res) => {
    try {
        let ProductId = req.params.productId;
        if (!isValidObjectId(ProductId)) {
            return res.status(400).send({ status: false, message: "Invalid ProductId. ⚠☣" })
        }
        let data = await productModel.findOne({ _id: params, isDeleted: false });
        if (!data) {
            return res.status(404).send({ status: false, message: "This Product Data is already deleted Or Doesn't Exist" });
        }
        let deleteproduct = await productModel.findOneAndUpdate({ _id: params }, { isDeleted: true, deletedAt: Date() }, { new: true });
        return res.status(200).send({ status: true, message: "Deleted Sucessfully. ♻✔", data: deleteproduct });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    }
};

module.exports={getProductsById,deleteProduct}