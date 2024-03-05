import express from "express";
import { adminOnly } from "../midlleware/auth.js";
import { applyDiscount, deleteCoupon, getAllCoupons, newCoupon,createPaymentIntent } from "../controllers/paymentController.js";
import { singleUpload } from "../midlleware/multer.js";

const  paymentRoute = express.Router()


paymentRoute.post("/createpaymentintent",singleUpload, createPaymentIntent)
paymentRoute.post("/newCoupon",adminOnly,singleUpload, newCoupon)
paymentRoute.get("/discount",  applyDiscount)

paymentRoute.get("/coupon/all",  getAllCoupons)


paymentRoute.delete("/coupon/:id",  deleteCoupon)


export default paymentRoute