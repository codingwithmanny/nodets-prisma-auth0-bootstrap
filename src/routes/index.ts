// Imports
// ========================================================
import { Router } from 'express';
import Users from './users';
import Auth from './auth';

// Config
// ========================================================
const router = Router();

// Routes
// ========================================================
router.use('/users', Users);
router.use('/auth', Auth);

// Exports
// ========================================================
export default router;
