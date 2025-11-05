import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { registerValidation, loginValidation } from '../middleware/validation.middleware';
import { authLimiter, registerLimiter } from '../middleware/rateLimiting.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  registerLimiter,
  registerValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;

    logger.info('User registration attempt', { email, phone });

    const result = await authService.register({
      name,
      email,
      phone,
      password,
    });

    logger.info('User registered successfully', { userId: result.user.id, email });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    const result = await authService.login({ email, password });

    logger.info('User logged in successfully', { userId: result.user.id, email });

    return res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const user = await authService.getUserById(userId);

    return res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, but we log it)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('User logged out', { userId: req.userId });

    return res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

export default router;
