import bcryptjs from "bcrypt";
import nodemailer from "nodemailer";
import { usersDB } from "../models/usersModel";
// import { result } from "../models/resultModel";
import { studentPositionAndRemark } from "../models/positionAndRemarksModel";
import "dotenv/convig";

import crypto from "crypto";


const createUserWithPassword = (newUser: any, callback: () => any) => {
  try {
    const salt = bcryptjs.genSaltSync(10);

    const hash = bcryptjs.hashSync(newUser.password, salt);

    const newUserResource = newUser;
    newUserResource.password = hash;
    newUserResource.save(callback);
  } catch (error) {
    console.log(error);
  }
};

const createUser = (newUser: any, callback: () => any) => {
  const salt = bcryptjs.genSaltSync(10);

  const hash = bcryptjs.hashSync(newUser.password, salt);

  const newUserResource = newUser;
  newUserResource.password = hash;
  newUserResource.save(callback);
};

const getUserByEmail = (email: string, callback: () => any) => {
  const query = { email };
  usersDB.findOne(query, callback);
};

const getUserByUserId = (userId: string, callback: () => any) => {
  const query = { userId };
  usersDB.findOne(query, callback);
};

const comparePassword = (candidatePassword: string, hash: string, callback: (a: any, b: boolean) => any) => {

  try {
    
    const isMatch = bcryptjs.compareSync(candidatePassword, hash);
  
    callback(null, isMatch);

  } catch (error) {
    console.log(error);
  }  
};

const generateRandomHex = (len = 24) => {
  var id = crypto.randomBytes(len).toString("hex");
  return id;
};

// Generates a one-time password to be used by the admin
const generateOtp = () => {
  let oneTimePassword = Math.floor(100000 + Math.random() * 900000);
  return oneTimePassword;
};

// Generates a random four digit, similar to gegerateOtp(), just that I use this for a different purpose
// which is to generate digits for the username of the admin
const generateRandomFourDigits = () => {
  let digits = Math.floor(Math.random() * 9000) + 1000;
  return digits;
};

function msToTime(s: any) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return {
    time: hrs + ":" + mins + ":" + secs + "." + ms,
    hours: hrs,
    miutes: mins,
    seconds: secs,
    milliseconds: ms,
  };
}

function msToTimePadded(s: any) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z?: number) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return {
    time: pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(ms, 3),
    hours: pad(hrs),
    minutes: pad(mins),
    seconds: pad(secs),
    milliseconds: pad(ms, 3),
  };
}

// Treats errors encountered calling a callback
const e = (error: any) => {
  console.log("An error occured:", error);
};

function resultRemark(totalScore: number) {
  if (totalScore >= 80 && totalScore <= 100) {
    return { grade: "A+", remark: "Brilliant" };
  } else if (totalScore >= 70 && totalScore <= 79) {
    return { grade: "A", remark: "Excellent" };
  } else if (totalScore >= 60 && totalScore <= 69) {
    return { grade: "B", remark: "Very Good" };
  } else if (totalScore >= 50 && totalScore <= 59) {
    return { grade: "C", remark: "Fair" };
  } else if (totalScore >= 40 && totalScore <= 49) {
    return { grade: "D", remark: "Poor" };
  } else if (totalScore >= 30 && totalScore <= 39) {
    return { grade: "E", remark: "Very Poor" };
  } else if (totalScore <= 29) {
    return { grade: "F", remark: "Fail" };
  } else {
    return { grade: "None", remark: "No score" };
  }
}

export {
  createUser,
  getUserByEmail,
  generateRandomFourDigits,
  getUserByUserId,
  comparePassword,
  generateRandomHex,
  generateOtp,
  msToTime,
  msToTimePadded,
  resultRemark
};
