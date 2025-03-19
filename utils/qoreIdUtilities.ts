import axios from 'axios';
import "dotenv/config";

async function getToken() {
    const result = await axios.post("https://api.qoreid.com/token", {
        clientId: process.env.QOREID_KEY,
        secret: process.env.QOREID_SECRET
    });
    return result;
}

export {
    getToken
};

