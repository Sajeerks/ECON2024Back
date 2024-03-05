import express from "express";
import { adminOnly } from "../midlleware/auth.js";
import { getAllProducts, createNewProduct, getLatestProducts, getAllCategories, getSingleProduct, updateSingleProduct, deleteSingleProduct, getFilteredRProducts } from "../controllers/productController.js";
import { singleUpload } from "../midlleware/multer.js";
const productRouter = express.Router();
productRouter.post("/newproduct", adminOnly, singleUpload, createNewProduct);
productRouter.get("/allproducts", adminOnly, getAllProducts);
productRouter.get("/latest", getLatestProducts);
productRouter.get("/categories", getAllCategories);
productRouter.get("/all", getFilteredRProducts);
productRouter.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload, updateSingleProduct)
    .delete(adminOnly, deleteSingleProduct);
export default productRouter;
