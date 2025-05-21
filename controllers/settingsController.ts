import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import bcrypt from "bcrypt";
import {
  staffsCollection
} from "../models/staffs";
import { OTPCollection } from "../models/otpManager";
import {
  genOTP,
  isTimeDifferenceGreaterThan30Minutes,
} from "../utils/authUtilities";
import { sendEmail } from "../utils/emailUtilities";

async function changePasswordForStaffs(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (oldPassword != newPassword) {
      res.status(400).send({
        message: "Passwords do not match",
      });
      return;
    }

    let userDetails = await staffsCollection.findById(req.userDetails?.userId);

    if (!userDetails) {
      res.status(404).send({
        message: "No user found",
      });
      return;
    }


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    const otp = genOTP();

    const otpDetails = await OTPCollection.create({
      userId: req.userDetails?.userId,
      otp,
      purpose: "changepassword",
      userType: "schooladmin",
      tempPassword: hashedPassword,
      sentVia: "email",
    });

    await sendEmail({
      to: userDetails.email!!,
      subject: "Solvpath - Password reset",
      body: `
            <div>
              <div>Here is your OTP to change your password: ${otp}</div>
            </div>
          `,
    });

    res.send({
      tempId: otpDetails._id,
      message: "OTP to change password sent",
    });
  } catch (error) {
    next(error);
  }
}

async function updatePasswordChangeForStaffs(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { tempId, otp } = req.body;

    const otpDetails = await OTPCollection.findById(tempId);

    if (!otpDetails) {
      res.status(400).json({
        errorMessage: "OTP not found.",
      });
      return;
    }

    // if (!userDetails) {
    //   res.status(404).send({
    //     message: "No user found",
    //   });
    //   return;
    // }    

    if(isTimeDifferenceGreaterThan30Minutes(new Date(), otpDetails.createdAt)) {
      res.status(400).send({
        errorMessage: "OTP has expired"
      });
      return;
    }

    if(otp != otpDetails.otp) {
      res.status(400).send({
        errorMessage: "Invalid OTP"
      });
      return;
    }

    await staffsCollection.findByIdAndUpdate(req.userDetails?.userId, {
      password: otpDetails.tempPassword
    });

    await OTPCollection.findByIdAndDelete(tempId);

    res.send({
      tempId: otpDetails._id,
      message: "OTP to change password sent",
    });
  } catch (error) {
    next(error);
  }
}

export { changePasswordForStaffs, updatePasswordChangeForStaffs };
