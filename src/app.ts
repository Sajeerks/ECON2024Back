
import  express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
// import path from 'path'
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
// const __dirname = path.dirname(__filename); 



import userRouter from "./routes/userRoute.js";
import { connectDB } from "./utils/features.js";
import { errorMIddleware } from "./midlleware/error.js";
import productRouter from "./routes/productRoute.js";
import NodeCache from "node-cache";
import orderRouter from "./routes/orderRoute.js";
import morgan from 'morgan'
import paymentRoute from "./routes/paymentRoute.js";
import statsRoute from "./routes/statsRoute.js";
import Stripe from "stripe";
import cors from 'cors'

config({
    path:"./.env"
})

connectDB(process.env.MONGO_DB_URI!)

const port  = process.env.PORT! 

export const stripe = new Stripe(process.env.STRIPE_API_KEY!)

export const myCache = new NodeCache()

const app =express()
app.use(express.json())
app.use(morgan("dev"))
app.use(cors())

app.get("/hoem", (req, res)=>{
    res.send('all working masha allah')
})


app.use("/api/v1/user", userRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/payment", paymentRoute)
app.use("/api/v1/dashboard", statsRoute)






// console.log(__dirname);
// console.log(path.join(__dirname,"../uploads"));
// app.use("/uploads", express.static(path.join(__dirname,"../uploads")))
app.use("/uploads", express.static("uploads"));

app.use(errorMIddleware)


app.listen(port, ()=>{
    console.log(`server is running in port http://localhost:${port}`);
})




