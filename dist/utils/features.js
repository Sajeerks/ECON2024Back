import mongoose from "mongoose";
import { myCache } from "../app.js";
import { productModel } from "../models/productModel.js";
export const connectDB = (uri) => {
    mongoose.connect(uri, {
        dbName: "Ecom2024Type"
    }).then(c => console.log(`mongoose connected to ${c.connection.host}`))
        .catch(e => console.log(e));
};
export const invalidateCache = async ({ product, order, admin, userId, orderId, produtId }) => {
    if (product) {
        const productKeys = ["categories", "allproductsAdmin", "latestProducts",];
        if (typeof product === "string") {
            productKeys.push(`product-${produtId}`);
        }
        if (typeof produtId === "object") {
            produtId.forEach(i => {
                productKeys.push(`product-${i}`);
            });
            // console.log("loggggggggggg");
        }
        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys = ["allOrders", `myorders-${userId}`, `order-${orderId}`];
        myCache.del(orderKeys);
    }
    if (admin) {
        const adminKeys = ["admin-stats", "admin-pie-charts",
            "admin-bar-charts", "admin-line-charts"
        ];
        myCache.del(adminKeys);
    }
};
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await productModel.findById(order.productId.toString());
        if (!product)
            throw new Error("product not found");
        product.stock -= order.quantity;
        await product.save();
    }
};
export const calculatePercentage = (thisMonth, lastMonth) => {
    const percent = ((lastMonth - thisMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
export const getInventories = async (categories, productsCount) => {
    const categoriesCountPromise = categories.map((category) => productModel.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const cartegoryCount = [];
    categories.forEach((category, i) => [
        cartegoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100)
        })
    ]);
    return cartegoryCount;
};
export const getChartData = ({ length, docArr, today, property }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        // console.log({monthDiff});
        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += i[property];
            }
            else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });
    return data;
};
