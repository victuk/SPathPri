import { RequestHandler, Request, Response, NextFunction } from "express";
import {CustomRequest} from "../middleware/authenticatedUsersOnly";

const roleBasedAccess = (role: string[]) => {
    return function (req: CustomRequest, res: Response, next: NextFunction) {
        try {
            
            if(role.includes(req.userDetails?.role as string)) {
                next();
            } else {
                res.status(403).send({
                    message: `Unauthorized request: Only ${role.map(s => s + "s").join(", ")} can take this action.`
                });
            }
            
        } catch (error) {
            next(error);
        }
    };
  }

export default roleBasedAccess;