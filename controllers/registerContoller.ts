import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { studentsCollection } from "../models/students";
import { genOTP } from "../utils/authUtilities";
import { OTPCollection } from "../models/otpManager";
import { sendEmail } from "../utils/emailUtilities";

import { usersDB } from "../models/usersModel";
import { settings } from "../models/settingsModel";
import bcrypt from "bcrypt";
import "dotenv/config";
import { staffsCollection } from "../models/staffs";
import { superAdminCollection } from "../models/superAdmins";


async function registerStaff(req: CustomRequest, res: Response, next: NextFunction) {
  
  try {

      const {
        firstName,
        surname,
        otherNames,
        gender,
        profilePic,
        email,
        role,
        stateOfOrigin,
        lgaOfOrigin,
        phoneNumber,
        password
      } = req.body;

      const emailExists = await staffsCollection.exists({email});

      const phoneNumberExists = await staffsCollection.exists({phoneNumber});

      if(emailExists) {
        res.status(409).send({
          errorMessage: "Email already exist"
        });
        return;
      }

      if(phoneNumberExists) {
        res.status(409).send({
          errorMessage: "Phone number already exist"
        });
        return;
      }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);


    const user = await staffsCollection.create({
      firstName, otherNames, surname, email, gender,
      profilePic, stateOfOrigin, lgaOfOrigin, role,
      phoneNumber, password: hashedPassword
    });

    const otp = genOTP();

    await OTPCollection.create({
      otp, userType: "teacher", userId: user._id,
      sentVia: "email", purpose: "verifyemail"
    });

    await sendEmail({
      to: email,
      subject: `School - Email Verification`,
      body: `
                    <div style="padding: 20px">
                        <h1>OTP</h1>
                        <div>Your OTP is ${otp}</div>
    
                          
                        <style>
                              div, a {
                                padding: 20px 10px;
                              }
                        </style>
                    </div>
                    `,
    });

    res.status(201).json({
      message: "Teacher created."
    });
    } catch (error: any) {
      if(error.name == "MongoError") {
        console.log(error);
        res.status(400).json({
          message: "Email already registered."
        });
      } else {
        next(error);
      }
    }
}

async function registerStudents(req: CustomRequest, res: Response, next: NextFunction) {
  
  
  try {
      const {
        firstName,
        surname,
        otherNames,
        gender,
        profilePic,
        phoneNumber,
        studentClass,
        dateOfBirth,
        stateOfOrigin,
        lgaOfOrigin,
        email,
        password
      } = req.body;

      const emailExists = await studentsCollection.exists({email});

      const phoneNumberExists = await studentsCollection.exists({phoneNumber});

      if(emailExists) {
        res.status(409).send({
          errorMessage: "Email already exist"
        });
        return;
      }

      if(phoneNumberExists) {
        res.status(409).send({
          errorMessage: "Phone number already exist"
        });
        return;
      }


      const getAdmissionSetting = await settings.findOne({});

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const admissionTerm = getAdmissionSetting?.currentTerm;
    const admissionYear = getAdmissionSetting?.currentYear;

    const studentTrack = studentClass.includes("js") ? "general" : "undecided"

    const user = await studentsCollection.create({
      firstName, otherNames, surname, gender, profilePic,
      lgaOfOrigin, stateOfOrigin, dateOfBirth, email, phoneNumber,
      admissionYear, admissionTerm, studentClass, studentTrack,
      password: hashedPassword
    });

    const otp = genOTP();

    const otpDetails = await OTPCollection.create({
      otp, userType: "student", userId: user._id,
      sentVia: "email", purpose: "verifyemail"
    });
    
    await sendEmail({
      to: email,
      subject: `School - Email Verification`,
      body: `
                    <div style="padding: 20px">
                        <h1>OTP</h1>
                        <div>Your OTP is ${otp}</div>
    
                          
                        <style>
                              div, a {
                                padding: 20px 10px;
                              }
                        </style>
                    </div>
                    `,
    });

    res.status(201).json({
      message: "Student created.",
      token: otpDetails._id
    });
    } catch (error: any) {
      console.log(error.name);
      if(error.name == "MongoError") {
        console.log(error);
        res.status(400).json({
          message: "Email already registered."
        });
      } else {
        res.status(400).json({
          message: "An error occurred."
        });
      }
    }
}

async function registerSuperAdmins(req: CustomRequest, res: Response, next: NextFunction) {
  const {
    firstName,
    surname,
    otherNames,
    gender,
    phoneNumber,
    profilePic,
    stateOfOrigin,
    lgaOfOrigin,
    email,
    password,
    role
  } = req.body;

  const emailExists = await superAdminCollection.exists({email});

      const phoneNumberExists = await superAdminCollection.exists({phoneNumber});

      if(emailExists) {
        res.status(409).send({
          errorMessage: "Email already exist"
        });
        return;
      }

      if(phoneNumberExists) {
        res.status(409).send({
          errorMessage: "Phone number already exist"
        });
        return;
      }
 
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password.toString(), salt);

    const user = await superAdminCollection.create({
      firstName, otherNames, surname, email, phoneNumber, gender,
      profilePic, stateOfOrigin, lgaOfOrigin,
      password: hashedPassword
    });

    const otp = genOTP();

    const otpDetails = await OTPCollection.create({
      otp, userType: "admin", userId: user._id,
      sentVia: "email", purpose: "verifyemail"
    });

    await sendEmail({
      to: email,
      subject: `School - Email Verification`,
      body: `
                    <div style="padding: 20px">
                        <h1>OTP</h1>
                        <div>Your OTP is ${otp}</div>
    
                          
                        <style>
                              div, a {
                                padding: 20px 10px;
                              }
                        </style>
                    </div>
                    `,
    });

    res.status(201).json({
      message: "Admin created.",
      token: otpDetails._id,
    });
}

// async function registerScoresUploader(req: CustomRequest, res: Response, next: NextFunction) {
//   const {
//     firstName,
//     surName,
//     otherNames,
//     email,
//     password
//   } = req.body;

//   if(firstName &&
//     surName &&
//     otherNames &&
//     email &&
//     password) {

//     req.body.role = "recordkeeper";
//     req.body.suspended = false;
//     req.body.emailVerified = true;
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(password.toString(), salt);
//     req.body.password = hashedPassword;
//     try {
//       await usersDB.create(req.body);
//       res.status(201).json({
//         message: "New record keeper created."
//       });
//     } catch (error: any) {
//       if (error.name == "MongoError") {
//         res.status(400).json({
//           message: "User already exist."
//         });
//       } else {
//         res.status(500).json({
//           message: "A server error occurred"
//         });
//       }
//     }
//   } else {
//     res.status(400).json({message: "Incomplete details"});
//   }
// }

export {
  registerStaff,
  registerStudents,
  registerSuperAdmins,
  // registerScoresUploader
};
