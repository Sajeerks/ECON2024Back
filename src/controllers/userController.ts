import { Response, Request, NextFunction } from "express";
import { userModel } from "../models/userModel.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "../midlleware/error.js";

export const createNewUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, role, _id, dob } = req.body;

    let user = await userModel.findById(_id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
      });
    }

    if (!name || !email || !photo || !gender || !role || !_id || !dob) {
      return next(new ErrorHandler("please enter all fields", 400));
    }

    user = await userModel.create({
      name,
      email,
      photo,
      gender,
      role,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
    let users = await userModel.find();

    if (!users) {
      return next(new ErrorHandler("users not found", 404));
    }
    return res.status(201).json({
      success: true,
      users,
      message: `all users fetched  `,
    });
  }
);


export const getUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      let user = await userModel.findById(req.params.id);
  
      if (!user) {
        return next(new ErrorHandler(`user with id -${req.params.id}  not found`, 404));
      }
      return res.status(201).json({
        success: true,
        user,
        message: `user fetched `,
      });
    }
  );
  


  export const deleteUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      let user = await userModel.findById(req.params.id);
  
      if (!user) {
        return next(new ErrorHandler(`user with id -${req.params.id}  not found`, 404));
      }
     await user.deleteOne()
    //  await userModel.findByIdAndDelete(req.params.id);
  
      return res.status(201).json({
        success: true,
    
        message: `user with id -${req.params.id} deleted successfully`,
      });
    }
  );
  
  