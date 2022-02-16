// Imports
// ========================================================
import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFound } from '../../utils/errorHandlers';
import { buildSuccessResponse } from '../../utils/helpers';
import dictionary from '../../utils/dictionary.json';
import { QUERY_USERS, CREATE_USER } from './queries';
import Validator from '../../middlewares/validator';

// Config
// ========================================================
const router = Router();

// Route
// ========================================================
const CreateUser = async (req: Request, res: Response) => {
  const { data } = await CREATE_USER(req.body);

  return res.json(buildSuccessResponse(data));
};

// Middlewares
// ========================================================
router.post(
  '/',
  body('firstName').isString().isLength({ min: 2 }),
  body('lastName').isString().isLength({ min: 2 }),
  body('email').isString().isEmail(),
  body('email').custom(async (value: string) => {
    const { data } = await QUERY_USERS({ query: value });
    if (data.length > 0) {
      return Promise.reject(dictionary.USERS.ERROR.CREATE.DUPLICATE);
    }
    return true;
  }),
  Validator,
  CreateUser,
);

// Exports
// ========================================================
export default router;
