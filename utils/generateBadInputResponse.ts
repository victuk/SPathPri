import APIResponse from "../typings/APIResponse";
import * as statusCodes from 'readable-http-codes';

const generateBadInputResponse = (error: Error): APIResponse => ({
    payload: {
        message: error.message
    },
    error: error,
    statusCode: statusCodes.BAD_REQUEST,
    hasError: true
});

export default generateBadInputResponse;
