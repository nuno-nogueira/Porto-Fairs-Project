
import express from 'express';
import { authenticateToken } from '../controllers/auth.controller.js';
import { getRoutes } from '../controllers/routing.controller.js';

const router = express.Router();

router.post('/', authenticateToken, getRoutes);

export default router;