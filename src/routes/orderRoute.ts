import express from "express";
import { adminOnly } from "../midlleware/auth.js";
import { singleUpload } from "../midlleware/multer.js";
import { allOrders, createNewOrder, deleteOrder, myOrders,processOrder,singleOrder } from "../controllers/orderController.js";

const  orderRouter = express.Router()

orderRouter.post("/newOrder",singleUpload, createNewOrder)

orderRouter.get("/myorder", myOrders)
orderRouter.get("/allorders",adminOnly, allOrders)
orderRouter.route("/order/:id").get( singleOrder).delete( adminOnly, deleteOrder).put(adminOnly, processOrder)







export default orderRouter
