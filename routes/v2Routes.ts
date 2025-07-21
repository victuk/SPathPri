import { Router, Response, Request, NextFunction } from "express";
import {
  authenticatedUsersOnly,
  CustomRequest
} from "../middleware/authenticatedUsersOnly";
import { generatePDF, generateResultV2 } from "../controllers/generatePDFController";
import puppeteer from "puppeteer";
import fs from "fs";;
import { studentsCollection } from "../models/students";
import { getSingleStudentResultByRecordIdV2, getSingleStudentResultV2 } from "../controllers/userManagementController";
import { assignScratchCardV2, cardSummaryV2, createSchoolScratchCardsV2, deleteBulkScratchCardsV2, resetScratchCardAttempt, scratchCardV2, searchScratchCardV2, unpairScratchCardV2, viewSchoolUnpairedScratchCardsV2 } from "../controllers/scratchCardController";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { addAdminAffectiveAssessmentListV2, deleteAdminAffectiveAssessmentListV2, deleteTeacherAffectivAssessmentV2, getAdminAffectiveAssessmentListV2, getTeacherAffectiveAssessmentV2, updateAdminAffectiveAssessmentListV2, updateAffectiveAssessmentV2 } from "../controllers/assessmentController";

const v2Routes = Router();

v2Routes.use(authenticatedUsersOnly);

v2Routes.post("/single-student-result", getSingleStudentResultV2);

v2Routes.get("/show-result-score-by-id/:recordId", getSingleStudentResultByRecordIdV2);

v2Routes.get("/generate-by-record-id/:recordId", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const {recordId} = req.params;

    const record = await classPositionAndRemarksCollection.findById(recordId);

    const fileLink = await generateResultV2(req.userDetails!!.userId, req.userDetails!!.schoolId!!, "student", record!!.term, record!!.year, (record!!.studentClass).toString());

    // fileToDelete = fileLink;

    res.send({
      fileLink
    });

  } catch (error) {
    next(error);
  }
});

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

// School scratch card
v2Routes.post("/students-and-scratch-cards", scratchCardV2);
v2Routes.post("/school-scratch-cards/create", createSchoolScratchCardsV2);
v2Routes.post("/school-scratch-cards/summary", cardSummaryV2);
v2Routes.post("/school-scratch-cards/view", viewSchoolUnpairedScratchCardsV2);
v2Routes.post("/school-scratch-cards/assign", assignScratchCardV2);
v2Routes.post("/school-scratch-cards/unpair", unpairScratchCardV2);
v2Routes.post("/school-scratch-cards/reset", resetScratchCardAttempt);
v2Routes.post("/school-scratch-cards/search", searchScratchCardV2);
v2Routes.post("/school-scratch-cards/bulk-delete", deleteBulkScratchCardsV2);

// Admin Affective Assessment
v2Routes.get("/admin/affective-assessment", getAdminAffectiveAssessmentListV2);
v2Routes.post("/admin/affective-assessment", addAdminAffectiveAssessmentListV2);
v2Routes.put("/admin/affective-assessment/:id", updateAdminAffectiveAssessmentListV2);
v2Routes.delete("/admin/affective-assessment/:id", deleteAdminAffectiveAssessmentListV2);

// Teacher Affective Assessment
v2Routes.put("/teacher/affective-assessments/update", updateAffectiveAssessmentV2);
v2Routes.patch("/teacher/affective-assessments", deleteTeacherAffectivAssessmentV2);
v2Routes.post("/teacher/affective-assessments", getTeacherAffectiveAssessmentV2);

export default v2Routes;
