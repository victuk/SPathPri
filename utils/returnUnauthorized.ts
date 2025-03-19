import { RequestHandler, Request, Response, NextFunction } from 'express';
import * as statusCodes from 'readable-http-codes';
import expressUserAgent from 'express-useragent';

/**
 * Request handler for bouncing unauthorized API access
 * 
 * @param {Request} req
 * @param {Response} res
 * 
 */
const returnUnauthorized: RequestHandler = (req: Request, res: Response, _: NextFunction) => {

    const statusCode = statusCodes.UNAUTHORIZED;
    const errorMessage = 'Unauthorized access, authentication credentials are required!!!';

    const userAgent = expressUserAgent.parse(req.headers['user-agent'] ?? '');

    if (req.xhr || (!userAgent.isMobile && !userAgent.isDesktop && !userAgent.isBot)) {

        return res
            .status(statusCode)
            .json({
                statusCode,
                message: errorMessage
            });
    }

    return res
        .status(statusCode)
        .send(errorMessage);

}

export default returnUnauthorized;
