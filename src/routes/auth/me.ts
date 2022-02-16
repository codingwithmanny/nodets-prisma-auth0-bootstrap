// Imports
// ========================================================
import { Router, Request, Response } from 'express';
import { NotFound } from '../../utils/errorHandlers';
import { buildSuccessResponse } from '../../utils/helpers';
import dictionary from '../../utils/dictionary.json';
import { request } from 'undici';
import CheckJwt from '../../middlewares/checkJwt';
import jwtDecode from 'jwt-decode';
import { QUERY_USERS, CREATE_USER } from '../users/queries';

// Types
export interface AuthToken {
  iss: string;
  sub: string;
  auth: string[];
  iat: number;
  exp: number;
  azp?: string;
  scrope?: string;
}

// Config
// ========================================================
const router = Router();
const providerIdRegex = new RegExp('^auth0\\|[\\w]+$', 'g');

// Route
// ========================================================
const Me = async (req: Request, res: Response) => {
  // Data to be returned
  let user = null;

  // Retrieve Auth0 token
  const token: AuthToken | undefined = jwtDecode(
    `${req?.headers?.authorization ?? 'Unknown'}`,
  );

  // See if user exists in current database
  const { data: queryUsers } = await QUERY_USERS({
    query: token?.sub,
    findBy: 'providerId',
  });

  user = queryUsers?.[0] ?? null;

  // User doesn't exist, create
  if (queryUsers.length === 0 && providerIdRegex) {
    const { body } = await request(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `${req?.headers?.authorization ?? 'Unknown'}`,
        },
      },
    );

    const json = await body.json();

    const { data: createdUser } = await CREATE_USER({
      providerId: token?.sub,
      name: json.name,
    });

    user = createdUser;
  }

  // User doesn't exist and/or provider Regex isn't valid
  if (!user) {
    throw new NotFound(dictionary.USERS.ERROR.READ.NOT_FOUND);
  }

  return res.json(buildSuccessResponse(user));
};

// Middlewares
// ========================================================
router.get('/me', CheckJwt, Me);

// Exports
// ========================================================
export default router;
