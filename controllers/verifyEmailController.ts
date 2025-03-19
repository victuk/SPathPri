import cryptojs from "crypto-js";
import "dotenv/config";
import { usersDB } from "../models/usersModel";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { OTPCollection } from "../models/otpManager";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { teacherCollection, teacherCollectionType } from "../models/staffs";
import { schoolAdminCollection, schoolAdminCollectionType } from "../models/superAdmins";
import { isTimeDifferenceGreaterThan30Minutes, signJWT } from "../utils/authUtilities";

async function verifyEmail(req: CustomRequest, res: Response, next: NextFunction) {
  
  try {
    const { token, otp } = req.body;

    const verificationDetails = await OTPCollection.findOne({
      _id: token, otp
    });
    
    if (!verificationDetails) {
      res.status(400).json({
        errorMessage: "Invalid otp.",
      });
      return;
    }

    if(isTimeDifferenceGreaterThan30Minutes(new Date(), verificationDetails.createdAt)) {
      res.status(400).send({
        errorMessage: "OTP has expired"
      });
      return;
    }

    let userDetails: studentsCollectionType | teacherCollectionType | schoolAdminCollectionType | undefined | null;

    let role: string = verificationDetails.userType;

    if(verificationDetails.sentVia == "email") {

      if(verificationDetails.userType == "student") {
        userDetails = await studentsCollection.findByIdAndUpdate(verificationDetails?.userId, {
          emailVerified: true
        }, {new: true});
      } else if(verificationDetails.userType == "teacher") {
        userDetails = await teacherCollection.findByIdAndUpdate(verificationDetails?.userId, {
          emailVerified: true
        }, {new: true});
      } else if (verificationDetails.userType == "schooladmin") {
        let schoolAdmin = await schoolAdminCollection.findByIdAndUpdate(verificationDetails?.userId, {
          emailVerified: true
        }, {new: true});

        userDetails = schoolAdmin;

        role = schoolAdmin!!.role as string;

      } else {
        res.status(400).send({
          errorMessage: "Invalid user type"
        });
        return;
      }
    } else if (verificationDetails.sentVia == "sms") {
      if(verificationDetails.userType == "student") {
        userDetails = await studentsCollection.findByIdAndUpdate(verificationDetails?.userId, {
          phoneNumberVerified: true
        }, {new: true});
      } else if(verificationDetails.userType == "teacher") {
        userDetails = await teacherCollection.findByIdAndUpdate(verificationDetails?.userId, {
          phoneNumberVerified: true
        }, {new: true});
      } else if (verificationDetails.userType == "schooladmin") {
        const schoolAdmin = await schoolAdminCollection.findByIdAndUpdate(verificationDetails?.userId, {
          phoneNumberVerified: true
        }, {new: true});

        userDetails = schoolAdmin;

        role = schoolAdmin!!.role as string;

      } else {
        res.status(400).send({
          errorMessage: "Invalid user type"
        });
        return;
      }
    }

    const jwt = signJWT({
      fullName: `${userDetails?.firstName} ${userDetails?.otherNames && userDetails?.otherNames} ${userDetails?.surname}`,
      role,
      userId: verificationDetails.userId,
      email: userDetails?.email,
      accountStatus: userDetails?.accountStatus
    });

    res.json({
      message: "Login Successful",
      token: jwt,
      userDetails: {
        fullName: `${userDetails?.firstName} ${userDetails?.otherNames && userDetails?.otherNames} ${userDetails?.surname}`,
        email: userDetails?.email,
        phoneNumber: userDetails?.phoneNumber,
        accountStatus: userDetails?.accountStatus
      },
      successful: true
    });
  } catch (error) {
    next(error);
  }
}

async function checkIfEmailAlreadyExist(req: CustomRequest, res: Response, next: NextFunction) {
  
  const {email} = req.body;

  try {
    const emailCount = await usersDB.findOne({email}).countDocuments();

  if(emailCount == 0) {
    res.json({
      message: "Student's email doesn't exist."
    });
  } else {
    res.status(400).json({
      message: "Student's email already exist."
    });
  }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred."
    });
  }

  
}

export {
  verifyEmail,
  checkIfEmailAlreadyExist
};
