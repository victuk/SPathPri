import { usersDB } from "../../models/usersModel";
import { schoolFees } from "../../models/feesModel";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { studentsCollection } from "../../models/students";

async function changeDetails(req: CustomRequest, res: Response, next: NextFunction) {
  const {
    firstName,
    surName,
    otherNames,
    gender,
  } = req.body;

  const { id: studentID } = req.params;

  if (
    firstName &&
    surName &&
    otherNames &&
    gender
  ) {
    await studentsCollection.findByIdAndUpdate(studentID, {
      firstName,
      surName,
      otherNames,
      gender
    });

    res.json({
      message: "Student detail updated successfully.",
    });
  } else {
    res.status(400).json({
      message: "Incomplete details.",
    });
  }
}

async function showStudents(req: CustomRequest, res: Response, next: NextFunction) {
  


  const allStudents = await studentsCollection.paginate(
    { role: "student" },
    {
      select: "-password",
      populate: {
        path: "studentClassAndCategory"
      }
    }
  );
  const studentsCount = allStudents.length;
  res.json({
    allStudents,
    studentsCount,
  });
}

async function specificStudent(req: CustomRequest, res: Response, next: NextFunction) {
  const { id: studentID } = req.params;

  const studentDetails = await usersDB.findById(
    studentID,
    "-password"
  );
  res.json({
    studentDetails,
  });
}

async function searchStudent(req: CustomRequest, res: Response, next: NextFunction) {
  const { firstName, surName } = req.params;

  let searchResult;

  if(surName == "undefined") {
    searchResult = await usersDB.find(
      { firstName: new RegExp(firstName, 'i'), role: "student", admitted: true },
      "firstName surName otherNames gender passportPicture passportPublicId parentEmail parentPhone studentClass parentName stateOfOrigin localGovernmentOfOrigin category email role createdAt updatedAt"
    );
  } else {
    searchResult = await usersDB.find(
      { firstName: new RegExp(firstName, 'i'), surName: new RegExp(surName, 'i'), role: "student", admitted: true },
      "firstName surName otherNames gender passportPicture passportPublicId parentEmail parentPhone studentClass parentName stateOfOrigin localGovernmentOfOrigin category email role createdAt updatedAt"
    );
  }

  res.json({
    searchResult,
  });
}

async function searchByEmailOrRegNumber(req: CustomRequest, res: Response, next: NextFunction) {
  const { emailOrRegNumber } = req.params;
  console.log(emailOrRegNumber);
  const searchResult = await usersDB.find(
    { $or: [{email: emailOrRegNumber}, {admissionNumber: emailOrRegNumber}], role: "student", admitted: true },
    "firstName surName otherNames gender passportPicture passportPublicId parentEmail parentPhone studentClass parentName stateOfOrigin localGovernmentOfOrigin category email role createdAt updatedAt"
  );

  res.json({
    searchResult,
  });
}

async function getStudentReceipts(req: CustomRequest, res: Response, next: NextFunction) {
  const { id: studentID } = req.params;

  const studentReceipts = await schoolFees.find(
    { studentID },
    "studentID term amount referenceID studentClass year payDate"
  );

  res.json({ studentReceipts });
}

async function getFeeReceiptById(req: CustomRequest, res: Response, next: NextFunction) {
  const { id: receiptID } = req.params;

  const studentReceipt = await schoolFees.findById(
    receiptID,
    "studentID term amount referenceID studentClass year payDate"
  );

  res.json({ studentReceipt });
}

async function editReceipt(req: CustomRequest, res: Response, next: NextFunction) {
  const { id: receiptID } = req.params;
  const { term, studentClass, year } = req.body;
  try {
    await schoolFees.findByIdAndUpdate(receiptID, {
      term,
      studentClass,
      year,
    });
    res.json({ message: "Update Successful." });
  } catch (error) {
    res.status(400).json({ message: "Update Failed." });
  }
}

// async function addResultRemark(req, res) {

// }

// async function deleteResultRemark(req, res) {

// }

export {
  changeDetails,
  showStudents,
  specificStudent,
  searchByEmailOrRegNumber,
  getStudentReceipts,
  getFeeReceiptById,
  editReceipt,
};
