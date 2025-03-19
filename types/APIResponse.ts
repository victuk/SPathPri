import readableStatusCodes from 'readable-http-codes';

type PayloadWithMessage = {
    /**
     * @type {string} string - A human-readable message for the response body
     */
    message: string
};

interface APIResponse {
    /**
     * The request payload object
     */
    payload?: Record<string, any> & PayloadWithMessage;
    /**
     * The request status code
     */
    statusCode: readableStatusCodes.StatusCodes | number,
    /**
     * Whether or not the request failed
     */
    hasError: boolean;
    /**
     * The error object if present
     */
    error?: Error;
};

export default APIResponse;