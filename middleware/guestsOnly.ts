import { RequestHandler } from 'express';
import getCurrentUserFromRequest from '../utils/getCurrentUserFromRequest';
import returnUnauthorized from '../utils/returnUnauthorized';
/**
 * Middleware for restricing API access to guests only
 */
const guestsOnly: RequestHandler = (req, res, next) => {
  const cognitoUser = getCurrentUserFromRequest(req);

  if (cognitoUser && !cognitoUser.isLoggedIn) {
      return true;
  }

  return returnUnauthorized(req, res, next);
};

export default guestsOnly;
