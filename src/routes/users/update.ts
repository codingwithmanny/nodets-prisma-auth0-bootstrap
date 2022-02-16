// Imports
// ========================================================
import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFound } from '../../utils/errorHandlers';
import { buildErrorResponse, buildSuccessResponse } from '../../utils/helpers';
import dictionary from '../../utils/dictionary.json';
import { UPDATE_USER } from './queries';
import Validator from '../../middlewares/validator';
import CheckJwt from '../../middlewares/checkJwt';
import jwtDecode from 'jwt-decode';

// Types
import { AuthToken } from '../auth/me';

// Config
// ========================================================
const router = Router();

// Route
// ========================================================
const UpdateUser = async (req: Request, res: Response) => {
  // Retrieve Auth0 token
  const token: AuthToken | undefined = jwtDecode(
    `${req?.headers?.authorization ?? 'Unknown'}`,
  );

  try {
    const { data } = await UPDATE_USER(
      req.params.id === 'me' ? token?.sub ?? '' : req.params.id,
      req.body,
    );
    if (!data) {
      throw new NotFound(dictionary.USERS.ERROR.READ.NOT_FOUND);
    }

    return res.json(buildSuccessResponse(data));
  } catch (error: any) {
    return res.status(400).json(buildErrorResponse(error?.message ?? error));
  }
};

// Middlewares
// ========================================================
router.put(
  '/:id',
  CheckJwt,
  body('display').optional().isString().isLength({ min: 3 }),
  Validator,
  UpdateUser,
);

// Exports
// ========================================================
export default router;
