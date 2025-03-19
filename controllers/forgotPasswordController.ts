import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";

import { transporter } from "../utils/userUtil";
const cryptoKey = process.env.CRYPTO_SECRET!!;
import cryptojs from "crypto-js";
import bcrypt from 'bcrypt';
import { usersDB } from "../models/usersModel";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { teacherCollection, teacherCollectionType } from "../models/staffs";
import { schoolAdminCollection, schoolAdminCollectionType } from "../models/superAdmins";
import { OTPCollection } from "../models/otpManager";
import { genOTP, isTimeDifferenceGreaterThan30Minutes } from "../utils/authUtilities";
import { sendEmail } from "../utils/emailUtilities";

async function sendTheMail(options: any) {
    try {
      await transporter.sendMail(options);
    } catch (error) {
      console.log('An error occoured while trying to send the mail.');
    }
  }

async function forgetPassword(req: CustomRequest, res: Response, next: NextFunction) {
  const { email } = req.body;

  interface UserDetails {
    user: any;
    role: string;
  }

  const userDetails: UserDetails = {
    user: null,
    role: "unknown"
  }

  const otp = genOTP();

  const student = await studentsCollection.findOne({email});

  if (!student) {
    const teacher = await teacherCollection.findOne({email});

    if(!teacher) {
      const admin = await schoolAdminCollection.findOne({email});

      if(!admin) {
        res.status(404).send({
          errorMessage: `No user with ${email} email addres found`
        });
        return;
      } else {
        userDetails.user = admin;
      userDetails.role = "admin";
      }

    } else {
      userDetails.user = teacher;
      userDetails.role = "teacher";
    }

  } else {
    userDetails.user = student;
    userDetails.role = "student";
  }

  const otpDetails = await OTPCollection.create({
    userId: userDetails.user._id,
    userType: userDetails.role,
    otp,
    sentVia: "email",
    purpose: "resetpassword"
  });

  sendEmail({
    to: email,
    subject: `School - Reset password`,
    body: `
        <div style="padding: 20px">
            <h1>Click this link to verify your email</h1>
            Link to verify: ${req.headers.host}/reset-password?token=${otpDetails._id}
            <style>
                div, a {
                    padding: 20px 10px;
                }
            </style>
        </div>
        `
  });

  res.status(200).json({
    message: "Password reset link sent",
  });
}

async function resetPassword(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        const {
            token,
            newPassword,
            otp
        } = req.body;
    
        const otpDetails = await OTPCollection.findById(token);

        if (!otpDetails) {
          res.status(400).json({
            errorMessage: "Invalid otp.",
          });
          return;
        }

        if(isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetails.createdAt)) {
          res.status(400).send({
            errorMessage: "OTP has expired"
          });
          return;
        }
    
        let userDetails: studentsCollectionType | teacherCollectionType | schoolAdminCollectionType | undefined | null;
    
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        if(otpDetails.sentVia == "email") {

          if(otpDetails.userType == "student") {
            userDetails = await studentsCollection.findByIdAndUpdate(otpDetails?.userId, {
              password: hashedPassword
            });
          } else if(otpDetails.userType == "teacher") {
            userDetails = await teacherCollection.findByIdAndUpdate(otpDetails?.userId, {
              password: hashedPassword
            });
          } else if (otpDetails.userType == "schooladmin") {
            userDetails = await schoolAdminCollection.findByIdAndUpdate(otpDetails?.userId, {
              password: hashedPassword
            });    
          } else {
            res.status(400).send({
              errorMessage: "Invalid user type"
            });
            return;
          }
        } else {
          res.status(401).send({
            errorMessage: "Reset password email cant be sent as text message"
          });
        }

        res.json({message: 'Password Updated.'});
        
    } catch (error) {
        next(error);
    }
}

export {
  forgetPassword,
  resetPassword
};
