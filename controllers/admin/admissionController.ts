import { usersDB } from "../../models/usersModel";
import { admissionMessage } from "../../models/admissionMessageModel";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { studentsCollection } from "../../models/students";

async function loadNewStudents(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const newStudents = await studentsCollection.find({
      accountStatus: "new"
    });

    res.send(newStudents);
  } catch (error) {
    next(error);
  }
}

async function approveAdmission(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentID } = req.params;

    await usersDB.findByIdAndUpdate(studentID, {
      admitted: true,
    });

    res.json({
      message: "Admitted.",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdmission(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentID } = req.params;
    await usersDB.findByIdAndDelete(studentID);
    res.json({
      message: "Deleted.",
    });
  } catch (error) {
    next(error);
  }
}

async function getAdmissionMessage(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
    try {
        
        const message = await admissionMessage.find();
      
        res.send(message);
    } catch (error) {
        next(error);
    }
}

async function setAdmissionMessage(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { message, admissionStartDate, admissionEndDate, year } = req.body;

    const admissionMessageCount = await admissionMessage.countDocuments();
    if (admissionMessageCount != 0) {
      res.status(400).json({
        message: "Delete or edit the already existing admission information.",
      });
    } else {
      await admissionMessage.create({
        message,
        admissionStartDate,
        admissionEndDate,
        year,
      });

      res.json({
        message: "Admission information posted successfully.",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function editAdmissionMessage(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { message, admissionStartDate, admissionEndDate, year } = req.body;

    await admissionMessage.findByIdAndUpdate(id, {
      message,
      admissionStartDate,
      admissionEndDate,
      year,
    });

    res.json({
      message: "Admission information updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdmissionMessage(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await admissionMessage.findByIdAndDelete(id);
    res.json({
      message: "Admission information deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export {
  loadNewStudents,
  approveAdmission,
  deleteAdmission,
  getAdmissionMessage,
  setAdmissionMessage,
  editAdmissionMessage,
  deleteAdmissionMessage,
};
