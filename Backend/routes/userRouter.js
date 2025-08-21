import express from "express";
import { register, login, logout, adminRegister, deleteProfile, getUser, updateUser } from "../controllers/userController.js";
import userMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

//  Register a new user
userRouter.post("/register", register);

// Login user
userRouter.post("/login", login);

//  Logout user (adds token to Redis blocklist)
userRouter.post("/logout", userMiddleware, logout);

//admin
userRouter.post("/adminregister", userMiddleware, adminRegister);

// Get current user profile
userRouter.get("/me", userMiddleware, getUser);

// Update current user profile
userRouter.patch("/update", userMiddleware, updateUser);

//  delete user
userRouter.post("/delete", userMiddleware, deleteProfile);

userRouter.get('/check' , userMiddleware, ( (req,res)=>{
    const reply ={
        username:req.user.username,
        email:req.user.email,
        _id:req.user._id
    }
    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
} ))


export default userRouter;
