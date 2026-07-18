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
import { assignScratchCardV2, cardSummaryV2, createSchoolScratchCardsV2, deleteBulkScratchCardsV2, resetScratchCardAttempt, scratchCardV2, searchScratchCardV2, unpairScratchCardV2, viewSchoolPairedScratchCardsV2, viewSchoolUnpairedScratchCardsV2 } from "../controllers/scratchCardController";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { addAdminAffectiveAssessmentListV2, deleteAdminAffectiveAssessmentListV2, deleteTeacherAffectivAssessmentV2, getAdminAffectiveAssessmentListV2, getTeacherAffectiveAssessmentV2, updateAdminAffectiveAssessmentListV2, updateAffectiveAssessmentV2 } from "../controllers/assessmentController";
import { promoteToClassV2, refreshStudentTotalAndAverageV2 } from "../controllers/schoolClassController";
import { resultCollection } from "../models/resultModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import { Parser } from "@json2csv/plainjs";
import path from "path";
import { v4 } from "uuid";

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

v2Routes.get(
  "/master-sheet",
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const schoolDetails = await schoolProfileCollection.findById(
        req.userDetails?.schoolId,
      );

      if (!schoolDetails) {
        res.status(400).send({
          message: "You don't belong to a school. Contact school admin.",
        });
        return;
      }

      const response = await resultCollection
        .find({
          year: schoolDetails.currentYear,
          schoolId: schoolDetails._id,
        })
        .populate("studentId", "-password")
        .populate("teacherId", "-password")
        .populate("subjectId")
        .populate("studentClass")
        .sort({
          term: 1,
          studentClass: 1,
          studentId: 1,
        });

      const positionAndRemark = await classPositionAndRemarksCollection
        .find({
          year: schoolDetails.currentYear,
          schoolId: schoolDetails._id,
        })
        .populate("studentId", "-password")
        .populate("classTeacherId", "-password")
        .populate("studentClass")
        .sort({
          term: 1,
          studentClass: 1,
          positionWithoutOrdinal: 1,
        });

      const CSVItself = response.map((value: any) => {
        return {
          "Student's Name": `${value?.studentId?.firstName} ${value?.studentId?.otherNames} ${value?.studentId?.surname}`,
          "Student's Class": value?.studentClass?.schoolClass,
          "Subject Teacher's Name": `${value?.teacherId?.firstName || "-"} ${value?.teacherId?.otherNames || "-"} ${value?.teacherId?.surname || "-"}`,
          Subject: value.subjectId.subject,
          Term: value.term,
          Year: value.year,
          "Test 1": value?.testOne,
          "Test 2": value?.testTwo,
          "Test 3": value?.testThree,
          Exam: value?.examScore,
          Total: value?.testsAndExamTotal,
          Grade: value?.grade,
        };
      });

      const opts = {};
      const parser = new Parser(opts);
      const csv = parser.parse(CSVItself);
      // const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      const filename = `mastersheet-assessments-${Date.now()}-${v4()}.csv`;
      const outputPath = path.join(__dirname, "../public", filename);

      // Ensure the public directory exists, then write the file
      if (!fs.existsSync(path.join(__dirname, "../public"))) {
        fs.mkdirSync(path.join(__dirname, "../public"));
      }

      fs.writeFileSync(outputPath, csv, "utf-8");

      const ResultAndPositionCSV = positionAndRemark.map((value: any) => {
        return {
          "Student's Name": `${value?.studentId?.firstName} ${value?.studentId?.otherNames} ${value?.studentId?.surname}`,
          "Student's Class": value?.studentClass?.schoolClass,
          "Class Teacher's Name": `${value?.teacherId?.firstName || "-"} ${value?.teacherId?.otherNames || "-"} ${value?.teacherId?.surname || "-"}`,
          Term: value?.term,
          Year: value?.year,
          Position: value?.position,
          Verdict: value?.verdict,
        };
      });

      const optsTwo = {};
      const parserTwo = new Parser(optsTwo);
      const csvTwo = parserTwo.parse(ResultAndPositionCSV);
      // const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      const filenameTwo = `mastersheet-results-${Date.now()}-${v4()}.csv`;
      const outputPathTwo = path.join(__dirname, "../public", filenameTwo);

      // Ensure the public directory exists, then write the file
      if (!fs.existsSync(path.join(__dirname, "../public"))) {
        fs.mkdirSync(path.join(__dirname, "../public"));
      }

      fs.writeFileSync(outputPathTwo, csvTwo, "utf-8");

      // Respond back with the public URL so the client can download it later
      res.status(200).json({
        success: true,
        fileUrl: filename,
        positionResults: filenameTwo,
      });
    } catch (error) {
      next(error);
    }
  },
);

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

    const fileLink = await generateResultV2(studentId, studentDetails!!.schoolId?.toString() as string, "student", req.body.term, req.body.year, req.body.classId);

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
v2Routes.post("/school-scratch-cards/view-paired", viewSchoolPairedScratchCardsV2);
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

v2Routes.put("/promote-students", promoteToClassV2);
v2Routes.put("/refresh-total-and-average", refreshStudentTotalAndAverageV2);

export default v2Routes;
