import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import CryptoJS from "crypto-js";
import { userSessionCollection } from "../models/userSessionModel";
import { redisClient } from "./redisClientUtil";

function hashPassword(password:string) {
    return bcrypt.hashSync(password.toString(), bcrypt.genSaltSync(10));
}

function comparePassword(userPassword:string, databasePassword:string) {
    return bcrypt.compareSync(userPassword.toString(), databasePassword);
}

function signJWT(payload: object | string) {
    return jwt.sign(
        payload,
        process.env.AUTH_KEY as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION as any });
}

const generateRefreshToken = async (payload: {userId: string, role: string, userAgent: any, deviceId: string}) => {

    

    const refreshToken = jwt.sign(
        payload, // Keep refresh token payload minimal
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION as any }
    );

    const userSession = await userSessionCollection.findOne({userId: payload.userId});

    if(userSession) {
        const sessionDetails = await userSessionCollection.findByIdAndUpdate(userSession._id, {
            userId: payload.userId,
            role: payload.role,
            deviceId: payload.deviceId,
            refreshToken: refreshToken,
            platform: payload.userAgent.platform,
            browser: payload.userAgent.browser,
            lastLogin: new Date()
        });

        redisClient.set(payload.deviceId, JSON.stringify(sessionDetails), "EX", 7 * 24 * 60 * 60);

    } else {
        const sessionDetails = await userSessionCollection.create({
            userId: payload.userId,
            role: payload.role,
            deviceId: payload.deviceId,
            // refreshToken: refreshToken,
            platform: payload.userAgent.platform,
            browser: payload.userAgent.browser,
            lastLogin: new Date()
        });

        redisClient.set(payload.deviceId, JSON.stringify(sessionDetails), "EX", 7 * 24 * 60 * 60);
    }

    return refreshToken;
};


function verifyJWT(payload: string) {
    return jwt.verify(payload, process.env.AUTH_KEY as string);
}

function verifyRefreshToken(payload: string) {
    return jwt.verify(payload, process.env.REFRESH_TOKEN_SECRET as string);
}

// const CryptoJS = require('crypto-js');

const encryptWithAES = (text:string) => {
  const passphrase = process.env.CRYPTO_PASSPHRASE;
  let stringifiedText = JSON.stringify(text);
  return CryptoJS.AES.encrypt(stringifiedText, passphrase as string).toString();
};

const decryptWithAES = (ciphertext:string) => {
  const passphrase = process.env.CRYPTO_PASSPHRASE;
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase as string);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(originalText);
};


const genOTP = function() {
    return Math.floor(100000 + Math.random() * 900000)
}

function isTimeDifferenceGreaterThan30Minutes(date1:Date, date2: Date) {
    const diffInMilliseconds: number = Math.abs(date2.getTime() - date1.getTime());
    const diffInMinutes: number = diffInMilliseconds / (1000 * 60);
    return diffInMinutes > 30;
}

export {
    generateRefreshToken,
    hashPassword,
    comparePassword,
    signJWT,
    verifyJWT,
    encryptWithAES,
    decryptWithAES,
    genOTP,
    verifyRefreshToken,
    isTimeDifferenceGreaterThan30Minutes,
}