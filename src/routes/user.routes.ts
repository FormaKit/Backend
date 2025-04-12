import express from "express";
import { UserController } from "../controllers/user.controller";
import { AuthGuard } from "../guards/auth.guard";
import { RoleGuard } from "../guards/role.guard";

const userRoutes = express.Router();
const userController = new UserController();

// Public routes
userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);

// Protected routes
userRoutes.get("/users", userController.getUsers);

export default userRoutes;
