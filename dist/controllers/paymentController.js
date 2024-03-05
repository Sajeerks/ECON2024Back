import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "../midlleware/error.js";
import { couponModel } from "../models/couponModel.js";
import { stripe } from "../app.js";
export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount) {
        return next(new ErrorHandler(`please enter the amount`, 400));
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr"
    });
    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    });
});
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    console.log(req.body);
    if (!coupon || !amount) {
        return next(new ErrorHandler(`please enter all field for craeating coupon`, 400));
    }
    await couponModel.create({
        code: coupon,
        amount,
    });
    return res.status(201).json({
        success: true,
        message: `new coupon --${coupon}  created successfully   `,
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await couponModel.findOne({ code: coupon });
    if (!discount)
        return next(new ErrorHandler("no discount found invalid coupon code ", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
        message: `discount found successfully  `,
    });
});
export const getAllCoupons = TryCatch(async (req, res, next) => {
    const allcoupons = await couponModel.find({});
    return res.status(200).json({
        success: true,
        allcoupons,
        message: `allcoupons found successfully  `,
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const coupon = await couponModel.findByIdAndDelete(req.params.id);
    if (!coupon)
        return next(new ErrorHandler(`coupon widh id-${req.params.id} not found `, 404));
    //   await coupon.deleteOne()
    return res.status(200).json({
        success: true,
        // message: `coupon widh id-${req.params.id}  deleted successfully  `,
        message: `coupon widh id-${coupon?.code}  deleted successfully  `,
    });
});
