import { Request } from 'express';
import { APIGatewayProxyEvent } from 'aws-lambda';

interface AuthorizationTokenHolder {
    authorizationToken?: string
};

type APITokenAndAuthorizationTokenHolder = APIGatewayProxyEvent & AuthorizationTokenHolder;

const getEventFromRequest = (request: Request) => {

    if (!(request as any).apiGateway) {
        return {} as APITokenAndAuthorizationTokenHolder;
    }

    return (request as any).apiGateway.event as APITokenAndAuthorizationTokenHolder;
};

export default getEventFromRequest;
