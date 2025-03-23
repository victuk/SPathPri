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

const jwtKey = process.env.AUTH_KEY!!;

async function studentLogin(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { scratchCardId, password } = req.body;

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
      password,
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

    const doPasswordsMatch = comparePassword(password, staffDetails.password);

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
  getStaffDetailsBeforeLogin,
  getStudentDetailsBeforeLogin,
};
