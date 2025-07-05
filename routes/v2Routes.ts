import { Router, Response, Request, NextFunction } from "express";
import {
  authenticatedUsersOnly,
  CustomRequest
} from "../middleware/authenticatedUsersOnly";
import { generatePDF, generateResultV2 } from "../controllers/generatePDFController";
import puppeteer from "puppeteer";
import fs from "fs";;
import { studentsCollection } from "../models/students";
import { getSingleStudentResultV2 } from "../controllers/userManagementController";

const v2Routes = Router();

v2Routes.use(authenticatedUsersOnly);

v2Routes.post("/single-student-result", getSingleStudentResultV2);

v2Routes.post("/generate-my-result", async (req: CustomRequest, res: Response, next: NextFunction) => {
  let fileToDelete: any;
  try {
    const fileLink = await generateResultV2(req.userDetails!!.userId, req.userDetails!!.schoolId!!, "student", req.body.term, req.body.year, req.body.classId);

    fileToDelete = fileLink;

    res.send({
      fileLink
    });
    
  } catch (error) {
    next(error);
  }
});

v2Routes.post("/generate-student-result", async (req: CustomRequest, res: Response, next: NextFunction) => {
  let fileToDelete: any;
  try {

    const {studentId} = req.body;

    const studentDetails = await studentsCollection.findById(studentId);

    if (!studentDetails) {
      res.send({
        message: "Student details not found"
      });
      return;
    }

    const fileLink = await generateResultV2(studentId, studentDetails!!.schoolId as string, "student", req.body.term, req.body.year, req.body.classId);

    fileToDelete = fileLink;

    res.send(fileLink);
    
  } catch (error) {
    next(error);
  }
});

export default v2Routes;
