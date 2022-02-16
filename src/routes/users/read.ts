// Imports
// ========================================================
import { Router, Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFound } from '../../utils/errorHandlers';
import { buildSuccessResponse } from '../../utils/helpers';
import dictionary from '../../utils/dictionary.json';
import { QUERY_USERS } from './queries';
import Validator from '../../middlewares/validator';

// Config
// ========================================================
const router = Router();

// Route
// ========================================================
const ReadUser = async (req: Request, res: Response) => {
  const { data } = await QUERY_USERS({
    query: req.params.id,
    findBy: 'display',
  });

  if (data?.length === 0) {
    throw new NotFound(dictionary.USERS.ERROR.READ.NOT_FOUND);
  }

  return res.json(buildSuccessResponse(data[0]));
};

// Middlewares
// ========================================================
router.get('/:id', ReadUser);

// Exports
// ========================================================
export default router;
