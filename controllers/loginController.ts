import { usersDB } from "../models/usersModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
// import { schoolAdminCollection, schoolAdminCollectionType } from "../models/superAdmins";
import { staffsCollection } from "../models/staffs";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { comparePassword, signJWT } from "../utils/authUtilities";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import Joi from "joi";
import { v4 } from "uuid";
import { userSessionCollection } from "../models/userSessionModel";
import { verifyRefreshToken } from "../utils/authUtilities"
import { redisClient } from "../utils/redisClientUtil";

const jwtKey = process.env.AUTH_KEY!!;

async function studentLogin(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { scratchCardId, password } = req.body;

    const {error} = Joi.object({
      scratchCardId: Joi.string().required(),
      password: Joi.string().required()
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

    const studentScratchCard = await StudentsScratchCardCollection.findOne({
      scratchCardId,
    });

    if (!studentScratchCard) {
      res.status(404).send({
        message: "Invalid scratch card",
      });
      return;
    }

    const studentId = studentScratchCard.studentId;

    const studentDetails: any = await studentsCollection
      .findById(studentId)
      .populate("schoolId", "schoolName schoolLogo schoolMotto currentTerm currentYear");

    if (
      studentDetails?.accountStatus != "active" &&
      studentDetails?.accountStatus != "new"
    ) {
      res.status(404).send({
        message: `You have been ${studentDetails?.accountStatus}. Kindly contact the admin`,
      });
      return;
    }

    const doPasswordsMatch = comparePassword(
      password.toString(),
      studentDetails!!.password
    );

    if (!doPasswordsMatch) {
      res.status(400).send({
        message: "Incorrect credentials supplied",
      });
      return;
    }

    console.log(studentDetails.schoolId);

    const jwt = signJWT({
      userId: studentDetails.id,
      fullName: `${studentDetails.firstName} ${studentDetails.surname}`,
      email: studentDetails.email,
      role: "student",
      accountStatus: studentDetails.accountStatus,
      schoolId: studentDetails.schoolId._id ? (studentDetails.schoolId._id).toString() : null
    });

    res.send({
      message: "Login Successful",
      studentDetails: {
        fullName: `${studentDetails.firstName} ${studentDetails.surname}`,
        email: studentDetails.email,
        profilePicture: studentDetails.profilePic,
        role: "student",
        accountStatus: studentDetails.accountStatus,
      },
      schoolDetails: studentDetails.schoolId,
      jwt,
    });
  } catch (error) {
    next(error);
  }
}

async function staffLogin(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let { email, password } = req.body;

    const {error} = Joi.object({
      email: Joi.string().email({tlds: {allow: false}}).required().messages({
        "string.email": "Kindly input a valid email address",
        "any.required": "Email is required"
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required"
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

    const staffDetails: any = await staffsCollection
      .findOne({
        email: email.toLocaleLowerCase().trim(),
      })
      .populate("schoolId", "schoolName schoolLogo schoolMotto currentTerm currentYear");

    if (!staffDetails) {
      res.status(404).send({
        message: "Staff not found",
      });
      return;
    }

    if (
      staffDetails?.accountStatus != "active" &&
      staffDetails?.accountStatus != "new"
    ) {
      res.status(404).send({
        message: `You have been ${staffDetails?.accountStatus}. Kindly contact the admin`,
      });
      return;
    }

    const doPasswordsMatch = comparePassword(password.toString(), staffDetails.password);

    if (!doPasswordsMatch) {
      res.status(400).send({
        message: "Incorrect credentials supplied",
      });
      return;
    }

    console.log(staffDetails.schoolId?._id);

    const jwt = signJWT({
      userId: staffDetails.id,
      fullName: `${staffDetails.firstName} ${staffDetails.surname}`,
      email: staffDetails.email,
      role: staffDetails.role,
      accountStatus: staffDetails.accountStatus,
      schoolId: staffDetails.role != "super-admin" ? (staffDetails.schoolId._id).toString() : null
    });

    res.send({
      message: "Login Successful",
      staffDetails: {
        fullName: `${staffDetails.firstName} ${staffDetails.surname}`,
        email: staffDetails.email,
        profilePicture: staffDetails.profilePic,
        role: staffDetails.role,
        accountStatus: staffDetails.accountStatus,
      },
      schoolDetails: staffDetails.schoolId,
      jwt,
    });
  } catch (error) {
    next(error);
  }
}

const logOut = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const value: any = verifyRefreshToken(refreshToken);
        if(value) {
          const sessionDetails = await userSessionCollection.findOneAndDelete({deviceId: value?.deviceId});
          await redisClient.del(sessionDetails?.deviceId!!);
        }
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

const refreshCurrentToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const expiredAccessToken = req.headers.authorization;

    if (!expiredAccessToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    const value: any = jwt.decode(expiredAccessToken.split(" ")[1]);

    if(!value) {
      return res.status(401).json({ message: 'Invalid session', action: "log-user-out" });
    }

    const timeDifference = Math.abs(Date.now() - (value.exp * 1000));
    const ONE_MINUTE_IN_MS = 1 * 60 * 1000;
    // console.log(`Difference is ${timeDifference / 1000 / 60} minutes.`);
    // console.log(timeDifference > ONE_MINUTE_IN_MS);

    // const redisResult = await redisClient.get(`${value.userId}----${value.deviceId}`);

    if(timeDifference > ONE_MINUTE_IN_MS) {
      return res.status(401).json({ message: 'Your session has expired, kindly login', action: "log-user-out" });
    }

    // await redisClient.del(`${value.userId}----${value.deviceId}`);

    let userDetails: any;
    let userRole: any;
    if(value.role == "student") {
      userDetails = await studentsCollection.findById(value.userId);
      userRole = "student";
    } else {
      userDetails = await staffsCollection.findById(value.userId);
      userRole = userDetails?.role;
    }

    const newDeviceId = v4();


    // const userAgent = req.useragent;

    const newAccessToken = signJWT({
      userId: userDetails?.id,
      fullName: `${userDetails?.firstName} ${userDetails?.surname}`,
      email: userDetails?.email,
      role: userRole,
      accountStatus: userDetails?.accountStatus,
      schoolId: userDetails?.schoolId ? (userDetails.schoolId).toString() : null,
      deviceId: newDeviceId
    });

    // const v: any = decode(newAccessToken);

    // await redisClient.set(`${userDetails.userId}----${newDeviceId}`, JSON.stringify({
    //   jwt: newAccessToken, expiryDate: v.exp
    // }));

    // await userSessionCollection.findOne({userId: value?.userId, deviceId: value?.deviceId}, {
    //   deviceId: newDeviceId,
    //   lastLogin: new Date()
    // });
    
  res.send({
    newAccessToken
  });

  } catch (error: any) {
    if(error.name === "TokenExpiredError"){
      res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
      res.status(401).send({
          errorMessage: "Refresh token expired",
          action: "log-user-out"
      });
      return;
  }
    next(error);
  }
}

const getStaffDetailsBeforeLogin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;

    const staffDetails = await staffsCollection.findOne(
      { email },
      "profilePic firstName otherNames surname role"
    );

    if(!staffDetails) {
      res.status(404).send({
        message: "Staff not found"
      });
      return;
    }

    res.send({
      result: staffDetails,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentDetailsBeforeLogin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scratchCardId } = req.params;

    const studentDetails = await StudentsScratchCardCollection.findOne({
      scratchCardId,
    }).populate("studentId", "profilePic firstName otherNames surname");

    if(!studentDetails) {
      res.status(404).send({
        message: "Student not found"
      });
      return;
    }

    res.send({
      result: studentDetails?.studentId,
    });
  } catch (error) {
    next(error);
  }
};

export {
  studentLogin,
  staffLogin,
  logOut,
  refreshCurrentToken,
  getStaffDetailsBeforeLogin,
  getStudentDetailsBeforeLogin,
};
