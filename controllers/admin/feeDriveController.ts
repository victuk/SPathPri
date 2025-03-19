import { schoolFees } from "../../models/feesModel";
import { schoolFeesSelector } from "../../models/feesSelectorModel";
import { usersDB } from "../../models/usersModel";
import { settings } from "../../models/settingsModel";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";

async function feeDriveByEmail(req: CustomRequest, res: Response, next: NextFunction) {
  const { emailOrRegNo, studentClass } = req.params;

  const user = await usersDB.findOne(
    { $or: [{ email: emailOrRegNo }, { admissionNumber: emailOrRegNo }] },
    "firstName surName otherNames gender passportPicture email passportPublicId admissionNumber admitted"
  );
  const termYearSetting = await settings.find();

  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    let student = await schoolFees.findOne({
      studentID: user._id,
      term: termYearSetting[0].currentTerm,
      studentClass,
      year: termYearSetting[0].currentYear,
    });
    if (!student) {
      res
        .status(404)
        .json({
          studentDetails: user,
          paymentDetails: "Not paid",
          hasPaid: false,
        });
    } else {
      res.json({
        studentDetails: user,
        paymentDetails: student,
        hasPaid: true,
      });
    }
  }
}

async function feeDriveByClass(req, res) {
  const { studentClass } = req.params;
  console.log(studentClass);

  const termYearSetting = await settings.find();
  const students = await usersDB.find(
    { studentClass, admitted: true },
    "firstName surName otherNames gender passportPicture email passportPublicId admissionNumber admitted"
  );

  let s = [];

  for (let student of students) {
    let studentRes = await schoolFees.findOne({
      studentID: student._id,
      term: termYearSetting[0].currentTerm,
      studentClass,
      year: termYearSetting[0].currentYear,
    });

    if (!studentRes) {
      s.push({
        studentDetails: student,
        paymentDetails: "Not paid",
        hasPaid: false,
      });
    } else {
      s.push({
        studentDetails: student,
        paymentDetails: studentRes,
        hasPaid: true,
      });
    }
  }

  res.json({
    students: s,
  });
}

export {
  feeDriveByEmail,
  feeDriveByClass
};
