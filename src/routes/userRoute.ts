import express from "express";
import { createNewUser, getAllUsers ,getUser,deleteUser} from "../controllers/userController.js";
import { adminOnly } from "../midlleware/auth.js";

const  userRouter = express.Router()


userRouter.post("/new", createNewUser)

userRouter.get("/allusers",adminOnly, getAllUsers)

userRouter.get("/:id", getUser).delete("/:id",adminOnly,deleteUser)


export default userRouter
