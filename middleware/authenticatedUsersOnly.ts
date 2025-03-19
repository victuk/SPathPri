import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/authUtilities";

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
}
interface CustomRequest extends Request {
    userDetails?: DecodedObject;
  }

const authenticatedUsersOnly: RequestHandler = (req:CustomRequest, res:Response, next:NextFunction) => {
    try {
        const token = req.headers.authorization;

        if(!token) {
            return res.status(401).send({
                message: "no-token-present"
            });
        }

        const [tokenType, tokenValue] = token.split(" ");

        if(tokenType.toLocaleLowerCase() == "bearer") {
            
            const userDetails = verifyJWT(tokenValue);

            req.userDetails  = userDetails as DecodedObject;
            next();
        }

    } catch (error) {
        next(error);
    }
}


export {
    authenticatedUsersOnly,
    DecodedObject,
    CustomRequest
};