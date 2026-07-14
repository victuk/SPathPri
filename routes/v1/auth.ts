import express from "express";
import bcrypt from "bcryptjs";
import statusCodes from "readable-http-codes";
import {
  comparePassword,
  signJWT,
  genOTP,
  isTimeDifferenceGreaterThan30Minutes,
  hashPassword
} from "../../utils/authUtilities";
import { sendEmail } from "../../utils/emailUtilities";
import { OTPCollection } from "../../models/otpManager";
import { multerUpload, uploadToCloudinary } from "../../utils/cloudinaryUtils";
import {
  teacherCollection,
  teacherCollectionType,
} from "../../models/staffs";
import { studentsCollection, studentsCollectionType } from "../../models/students";
import { studentRegistrationSchema } from "../../utils/formValidatorUtils";
import { sendConfirmEmail } from "../../utils/confirmEmailUtil";
import { schoolAdminCollection, schoolAdminCollectionType } from "../../models/superAdmins";
const router = express.Router();

// router.post("/array-upload-test", multerUpload.fields([{name:"driversLicense", maxCount: 1}, {name:"personalImage", maxCount: 1}, {name: "governmentId", maxCount: 1}]), async function(req:CustomRequest, res:express.Response, next:express.NextFunction) {
//   try {

//     let sendFile: any = req.files;

//     console.log(sendFile);

//   const resp = await uploadToCloudinary([
//     sendFile?.driversLicense[0].path,
//     sendFile?.personalImage[0].path,
//     sendFile?.governmentId[0].path
//   ], "file");

//   console.log("res", resp);

//   res.send({
//     message: "Uploads Successful",
//   });

//     // res.send(uploadedFiles);
//   } catch (error) {
//     next(error);
//   }
// });

/* GET home page. */
router.post(
  "/login/teacher",
  async function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const { emailOrPhoneNumber, password } = req.body;

      let user = await teacherCollection.findOne({
        $or: [
          { email: emailOrPhoneNumber },
          { phoneNumber: emailOrPhoneNumber },
        ],
      });

      if (!user) {
        return res.status(400).send({
          message: "No user found",
          error: "no-user-found",
          successful: false,
        });
      }

      const passwordsMatch = bcrypt.compareSync(
        password,
        user.password as string
      );

      if (!passwordsMatch) {
        return res.status(statusCodes.UNAUTHORIZED).send({
          message: "Invalid credentials",
          error: "invalid-credentials",
          successful: false,
        });
      }

      if (!user.emailVerified) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: "Email Not Verified",
          error: "email-not-verified",
          successful: false,
        });
      }

      const jwt = signJWT({
        email: user.email,
        userId: user._id,
        fullName: `${user.firstName} ${user.otherNames} ${user.surname}`,
        role: "teacher",
      });

      res.send({
        message: "Login Succesful",
        token: jwt,
        userDetails: {
          fullName: `${user.firstName} ${user.otherNames} ${user.surname}`,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: "teacher"
        },
        successful: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/register/student",  async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    
    const {
      firstName,
      otherNames,
      surname,
      gender,
      profilePic,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      phoneNumber,
      password,
      studentClass,
      studentClassCategory,
      admissionYear,
      admissionTerm,
      studentTrack
    } = req.body;

    const {error} = studentRegistrationSchema.validate({
      firstName,
      otherNames,
      surname,
      gender,
      profilePic,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      phoneNumber,
      password,
      studentClass,
      studentClassCategory,
      admissionYear,
      admissionTerm,
      studentTrack
    });

    if(error) {
      res.status(statusCodes.BAD_REQUEST).send({
        errorMessage: error.message
      });
      return;
    }

    const emailAlreadyExist = await studentsCollection.findOne({email});

    const phoneNumberAlreadyExist = await studentsCollection.findOne({phoneNumber});

    if(emailAlreadyExist) {
      res.status(statusCodes.CONFLICT).send({
        errorMessage: "Email already exists"
      });
      return;
    } else if (phoneNumberAlreadyExist) {
      res.status(statusCodes.CONFLICT).send({
        errorMessage: "Phone number already exists"
      });
      return;
    }

    const hashedPassword = hashPassword(password);

    const newStudent = await studentsCollection.create({
      firstName,
      otherNames,
      surname,
      gender,
      profilePic,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      phoneNumber,
      password: hashedPassword,
      studentClass,
      studentClassCategory,
      admissionYear,
      admissionTerm,
      studentTrack
    });

    const {isSuccessful, error: e, token} = await sendConfirmEmail({
      email, fullName: `${firstName} ${surname}`,
      userId: newStudent.id,
      userType: "student",
      sentVia: "email",
      purpose: "verifyemail"
    });

    if(isSuccessful == false) {
      console.log(e);
    }

    res.status(statusCodes.CREATED).send({
      message: "New student registered successfully",
      token
    });

  } catch (error) {
    next(error);
  }
});

router.post("/login/:userType", async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    
    const { userType } = req.params;

    const {emailOrPhoneNumber, password} = req.body;

    let userDetails: any;

    if(userType == "student") {

      userDetails = await studentsCollection.findOne({
        $or: [
          {email: emailOrPhoneNumber},
          {phoneNumber: emailOrPhoneNumber}
        ]
      });
    } else if (userType == "teacher") {
      userDetails = await teacherCollection.findOne({
        $or: [
          {email: emailOrPhoneNumber},
          {phoneNumber: emailOrPhoneNumber}
        ]
      });
    } else if (userType == "schooladmin") {
      userDetails = await schoolAdminCollection.findOne({
        $or: [
          {email: emailOrPhoneNumber},
          {phoneNumber: emailOrPhoneNumber}
        ]
      });
    } else {
      res.status(statusCodes.BAD_REQUEST).send({
        errorMessage: "Invalid user type"
      });
      return;
    }

    const passwordsMatch = comparePassword(password, userDetails.password);

    if (passwordsMatch == false) {
      res.status(statusCodes.UNAUTHORIZED).send({
        errorMessage: "Invalid password"
      });
      return;
    }

    let jwt = signJWT({
      email: userDetails!!.email,
      userId: userDetails._id,
      fullName: `${userDetails!!.firstName} ${userDetails!!.otherNames} ${userDetails!!.surname}`,
      role: userDetails.role
    });
res.send({
      message: "Login Successful",
      token: jwt,
      userDetails: {
        fullName: `${userDetails?.firstName} ${userDetails?.otherNames} ${userDetails?.surname}`,
        email: userDetails?.email,
        phoneNumber: userDetails?.phoneNumber,
        role: userDetails.role
      },
      successful: true,
    });

  } catch (error) {
    next(error);
  }
});

router.post(
  "/forgot-password",
  async function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const { email } = req.body;
      let userInfo = await teacherCollection.findOne({ email });
      if (!userInfo) return res.status(404).send("user-not-found");

      const otp = genOTP();

      await OTPCollection.create({
        userId: userInfo!!._id,
        userType: "teacher",
        otp,
      });

      const emailOption = {
        to: req.body!!.email,
        subject: "Password Reset - Verbicle",
        body: `<div>
        <h1>Password Reset OTP</h1>
        <div>Kindly copy the 6 digits number <strong>${otp}</strong> for your verification</div>
      </div>`,
      };

      await sendEmail(emailOption);

      res.send({
        message: "otp-sent",
        successful: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// router.post("/register/schooladmin", async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   try {
    
//     req.body.password = hashPassword(req.body.password);

//     req.body.emailVerified = true;

//     await schoolAdminCollection.create(req.body);

//     res.status(statusCodes.CREATED).send({
//       message: "School admin created"
//     });

//   } catch (error) {
//     next(error);
//   }
// });

router.post(
  "/resend-otp",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const email = req.body.email;

      let userInfo = await teacherCollection.findOne({ email });

      if (!userInfo) return res.status(404).send("user-not-found");

      await OTPCollection.deleteMany({ userId: userInfo?._id });

      const otp = genOTP();

      await OTPCollection.create({
        userId: userInfo!!._id,
        userType: "teacher",
        otp,
      });

      const emailOption = {
        to: req.body!!.email,
        subject: "OTP Resent - Verbicle",
        body: `<div>
        <h1>New OTP</h1>
        <div>Kindly copy the 6 digits number <strong>${otp}</strong></div>
      </div>`,
      };

      await sendEmail(emailOption);

      res.send({
        message: "otp-resent-successful",
        successful: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/reset-password",
  async function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const { otp, newPassword } = req.body;

      const user = await OTPCollection.findOne({ otp, userType: "teacher" });

      if (!user) {
        return res.status(404).send({
          message: "otp-not-found",
          successful: false,
        });
      }

      var u = await teacherCollection.findById(user.userId);

      if (comparePassword(newPassword, u?.password as string)) {
        return res.send({
          message: "old-and-new-passwords-match",
          successful: false,
        });
      }

      if (isTimeDifferenceGreaterThan30Minutes(new Date(), user!!.updatedAt)) {
        return res.status(400).send({
          message: "token-expired",
          successful: false,
        });
      }

      const newHashedPassword = hashPassword(newPassword);

      await teacherCollection.findByIdAndUpdate(user.userId, {
        password: newHashedPassword,
      });

      res.send({
        message: "update-successful",
        successful: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verify-email/:userType",
  async function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const { otp, token } = req.body;
      const {userType} = req.params;
      const otpDetails = await OTPCollection.findOne({
        _id: token,
        userType: userType,
        purpose: "verifyemail"
      });

      if (!otpDetails)
        return res.status(404).send({
          message: "No otp found",
          successful: false,
        });

        if(otp != otpDetails.otp) {
          return res.status(404).send({
            message: "Invalid otp",
            successful: false,
          });
        }

      if (
        isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetails.updatedAt)
      ) {
        return res.status(400).send({
          message: "otp-has-expired",
        });
      }

      let userDetails: any;

      if(userType == "student") {

        userDetails = await studentsCollection.findByIdAndUpdate(
          otpDetails?.userId,
          {
            emailVerified: true,
          }
        );
      } else if (userType == "teacher") {
        userDetails = await teacherCollection.findByIdAndUpdate(
          otpDetails?.userId,
          {
            emailVerified: true,
          }
        );
      } else if (userType == "schooladmin") {
        userDetails = await schoolAdminCollection.findByIdAndUpdate(
          otpDetails?.userId,
          {
            emailVerified: true,
          }
        );
      } else {
        res.status(statusCodes.BAD_REQUEST).send({
          errorMessage: "Invalid user type"
        });
        return;
      }


      let jwt = signJWT({
        email: userDetails!!.email,
        userId: userDetails._id,
        fullName: `${userDetails!!.firstName} ${userDetails!!.otherNames} ${userDetails!!.surname}`,
        role: "teacher",
      });


      await OTPCollection.findOneAndDelete({ otp, _id: token, userType });

      res.send({
        message: "email-verified",
        token: jwt,
        userDetails: {
          fullName: `${userDetails?.firstName} ${userDetails?.otherNames} ${userDetails?.surname}`,
          email: userDetails?.email,
          phoneNumber: userDetails?.phoneNumber,
          role: "teacher"
        },
        successful: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
