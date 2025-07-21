import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/authUtilities";
import { redisClient } from "../utils/redisClientUtil";

/**
 * Middleware for restricing API access to logged in users only
 */

interface DecodedObject {
  email: string;
  userId: string;
  fullName: string;
  role: string;
  accountStatus: string;
  schoolId: string | null;
  deviceId: string;
}
interface CustomRequest extends Request {
  userDetails?: DecodedObject;
}

const authenticatedUsersOnly: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    // console.log("Auth header", token);
    // const userAgent = req.useragent;
    // console.log("User-Agent:", userAgent);

    if (!token) {
      return res.status(400).send({
        message: "no-token-present",
        action: "log-user-out"
      });
    }

    const [tokenType, tokenValue] = token.split(" ");

    if (tokenType.toLocaleLowerCase() == "bearer") {
      const userDetails: any = verifyJWT(tokenValue);

      req.userDetails = userDetails as DecodedObject;
      next();
    }
  } catch (error: any) {
    if(error.name === "TokenExpiredError"){
        res.status(401).send({
            errorMessage: "Access token expired",
            action: "request-new-token"
        });
        return;
    }
    next(error);
  }
};

export { authenticatedUsersOnly, DecodedObject, CustomRequest };
