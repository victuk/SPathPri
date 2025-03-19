import APIResponse from "../types/APIResponse";

const generateResponse = (apiResponse: APIResponse): APIResponse => ({
    payload: apiResponse.payload,
    error: apiResponse.error,
    statusCode: apiResponse.statusCode,
    hasError: apiResponse.hasError
});

export default generateResponse;
