import { Request, Response, NextFunction, Handler } from "express";
import APIResponse from "../typings/APIResponse";
import logger from './logger';
import * as statusCodes from 'readable-http-codes';
import generateResponse from "./generateResponse";

const safeRequestHandler = (
    handlerFN: (req: Request, res: Response<APIResponse>, next?: NextFunction) => Promise<Response<APIResponse>>
) => async (
    req: Request,
    res: Response<APIResponse>,
    next?: NextFunction
) => {
        try {
            return await handlerFN(req, res, next);
        } catch (error) {
            logger.log((error as Error).message);

            return res
                .status(statusCodes.INTERNAL_SERVER_ERROR)
                .json(generateResponse({
                    hasError: true,
                    statusCode: statusCodes.INTERNAL_SERVER_ERROR,
                    error,
                    payload: {
                        message: (error as Error).message
                    }
                }));
        }
    }


export default safeRequestHandler;