
import express from 'express';
import { authenticateToken } from '../controllers/auth.controller.js';
import { getRoutes, getPublicTransportRoutes } from '../controllers/routing.controller.js';

const router = express.Router();

// driving & walking routes provided by openrouteservice
router.post('/', authenticateToken, getRoutes);

// transit routes provided by MOTIS
router.post('/public-transport', authenticateToken, getPublicTransportRoutes);

export default router;