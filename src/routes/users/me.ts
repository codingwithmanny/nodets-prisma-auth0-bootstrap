// Imports
// ========================================================
import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import { request } from 'undici';
import { buildSuccessResponse } from '../../utils/helpers';
// import dictionary from '../../utils/dictionary.json';
import CheckJwt from '../../middlewares/checkJwt';
import { BadRequest } from '../../utils/errorHandlers';
import { CREATE_USER, QUERY_USERS } from './queries';

// Config
// ========================================================
dotenv.config();
const router = Router();

// Route
// ========================================================
const ReadMe = async (req: Request, res: Response) => {
  try {
    const { body, statusCode } = await request(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: req.headers.authorization,
        },
      },
    );

    if (statusCode !== 200) throw new BadRequest('Could not reach server.');

    // Auth0 user data
    const auth0User = await body.json();

    // Find if user exists
    let data = null;
    const { data: queryUsers } = await QUERY_USERS({
      query: auth0User?.sub,
      findBy: 'providerId',
    });

    // If not create the user
    if (queryUsers.length === 0) {
      const { data: createUser } = await CREATE_USER({
        firstName: auth0User?.name,
        lastName: auth0User?.name,
        email: auth0User?.email,
        providerId: auth0User?.sub,
      });
      data = createUser;
    } else {
      // If exists return that user
      data = queryUsers.find((user) => user.providerId === auth0User?.sub);
    }

    return res.json(buildSuccessResponse(data));
  } catch (error) {
    throw new BadRequest(error?.message || error || 'Unknown error.');
  }
};

// Middlewares
// ========================================================
router.get('/me', CheckJwt, ReadMe);

// Exports
// ========================================================
export default router;
