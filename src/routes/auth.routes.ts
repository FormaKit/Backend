import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthGuard } from '../guards/auth.guard';

const authRoutes = express.Router();
const authController = new AuthController();
const authGuard = new AuthGuard();

// Public routes
authRoutes.post('/auth/login', authController.login.bind(authController));
authRoutes.post('/auth/register', authController.register.bind(authController));

// Apply auth guard to all routes below this
authRoutes.use(authGuard.canActivate.bind(authGuard));

authRoutes.get('/auth/me', authController.getCurrentUser.bind(authController));
authRoutes.get('/auth/sessions', authController.getSessions.bind(authController));

authRoutes.post('/auth/logout', authController.logout.bind(authController));
authRoutes.post('/auth/logout-all', authController.logoutAll.bind(authController));
authRoutes.post('/auth/logout-others', authController.logoutOthers.bind(authController));

authRoutes.post('/auth/change-password', authController.changePassword.bind(authController));

export default authRoutes;
