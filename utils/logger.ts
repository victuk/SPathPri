import winston = require('winston');
import expressWinston = require('express-winston');
import { Request, Response } from 'express';

const _logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console()
    ],
});

const log = (params: string) => {
    _logger.log('info', params);
}

const middleware = expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.cli(),
    ),
    meta: true,
    msg: "HTTP  ",
    expressFormat: true,
    colorize: true,
    ignoreRoute: (_: Request, __: Response) => {
        // log(`${JSON.stringify(req.headers)} ${(new Date)}`);

        return false;
    },
});

const logger = {
    log,
    middleware
};

export default logger;