import { v4 } from 'uuid';

const generateUserID = (email: string): string => {
    const id = v4();
    const shopperId = `${email}-${id}`;
    return shopperId;
}

export default generateUserID;