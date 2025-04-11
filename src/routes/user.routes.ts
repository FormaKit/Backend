import express from "express";
import { UserController } from "../controllers/user.controller";

const userRoutes = express.Router();
const userController = new UserController();
// Public routes

userRoutes.post("/register", userController.register.bind(userController));
userRoutes.post("/login", userController.login);

export default userRoutes
