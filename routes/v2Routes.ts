import { Router, Response, Request, NextFunction } from "express";
import {
  authenticatedUsersOnly,
  CustomRequest,
} from "../middleware/authenticatedUsersOnly";
import {
  generatePDF,
  generateResultV2,
} from "../controllers/generatePDFController";
import puppeteer from "puppeteer";
import fs from "fs";
import { studentsCollection } from "../models/students";
import {
  getSingleStudentResultByRecordIdV2,
  getSingleStudentResultV2,
} from "../controllers/userManagementController";
import {
  assignScratchCardV2,
  cardSummaryV2,
  createSchoolScratchCardsV2,
  deleteBulkScratchCardsV2,
  resetScratchCardAttempt,
  scratchCardV2,
  searchScratchCardV2,
  unpairScratchCardV2,
  viewSchoolPairedScratchCardsV2,
  viewSchoolUnpairedScratchCardsV2,
} from "../controllers/scratchCardController";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import {
  addAdminAffectiveAssessmentListV2,
  deleteAdminAffectiveAssessmentListV2,
  deleteTeacherAffectivAssessmentV2,
  getAdminAffectiveAssessmentListV2,
  getTeacherAffectiveAssessmentV2,
  updateAdminAffectiveAssessmentListV2,
  updateAffectiveAssessmentV2,
} from "../controllers/assessmentController";
import {
  promoteToClassV2,
  refreshStudentTotalAndAverageV2,
} from "../controllers/schoolClassController";
import { resultCollection } from "../models/resultModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import ExcelJS from "exceljs";
import path from "path";
import { v4 } from "uuid";

const v2Routes = Router();

v2Routes.use(authenticatedUsersOnly);

v2Routes.post("/single-student-result", getSingleStudentResultV2);

v2Routes.get(
  "/show-result-score-by-id/:recordId",
  getSingleStudentResultByRecordIdV2,
);

v2Routes.get(
  "/generate-by-record-id/:recordId",
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { recordId } = req.params;

      const record = await classPositionAndRemarksCollection.findById(recordId);

      const fileLink = await generateResultV2(
        req.userDetails!!.userId,
        req.userDetails!!.schoolId!!,
        "student",
        record!!.term,
        record!!.year,
        record!!.studentClass.toString(),
      );

      // fileToDelete = fileLink;

      res.send({
        fileLink,
      });
    } catch (error) {
      next(error);
    }
  },
);

v2Routes.post(
  "/generate-my-result",
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let fileToDelete: any;
    try {
      const fileLink = await generateResultV2(
        req.userDetails!!.userId,
        req.userDetails!!.schoolId!!,
        "student",
        req.body.term,
        req.body.year,
        req.body.classId,
      );

      fileToDelete = fileLink;

      res.send({
        fileLink,
      });
    } catch (error) {
      next(error);
    }
  },
);

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

      const { studentClass } = req.query;

      const query: any = {
        year: schoolDetails.currentYear,
        schoolId: schoolDetails._id,
      };

      if (studentClass) {
        query.studentClass = studentClass;
      }

      const response = await resultCollection
        .find(query)
        .populate("studentId", "-password")
        .populate("teacherId", "-password")
        .populate("subjectId")
        .populate("studentClass")
        .sort({
          term: 1,
          studentClass: 1,
          studentId: 1,
        })
        .lean();

      const positionAndRemark = await classPositionAndRemarksCollection
        .find(query)
        .populate("studentId", "-password")
        .populate("classTeacherId", "-password")
        .populate("studentClass")
        .sort({
          term: 1,
          studentClass: 1,
          positionWithoutOrdinal: 1,
        })
        .lean();

      const CSVItself = response.map((value: any) => {
        return {
          id: value?.studentId?._id,
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

      // Build nested term/subject structure
      const convertToXLSX = positionAndRemark.map((p: any) => {
        const value = CSVItself.filter(
          (s) => s.id.toString() === p.studentId._id.toString(),
        ).reduce((acc: any, vv: any) => {
          const termKey = vv.Term;
          if (!acc[termKey]) {
            acc[termKey] = {};
          }
          acc[termKey]["Position"] = p.position;
          acc[termKey]["Subject Total"] = p.studentSubjectTotal;
          acc[termKey]["Subject Average"] = p.studentSubjectAverage;
          acc[termKey]["Verdict"] = p.verdict;

          acc[termKey][vv.Subject] = {
            testOne: vv["Test 1"],
            testTwo: vv["Test 2"],
            testThree: vv["Test 3"],
            exam: vv["Exam"],
            total: vv["Total"],
            grade: vv["Grade"],
          };
          return acc;
        }, {});

        return {
          studentName: `${p?.studentId?.firstName} ${p?.studentId?.otherNames} ${p?.studentId?.surname}`,
          studentClass: p?.studentClass?.schoolClass,
          classTeacher: `${p?.classTeacherId?.firstName || "-"} ${p?.classTeacherId?.otherNames || "-"} ${p?.classTeacherId?.surname || "-"}`,
          position: p?.position || "-",
          verdict: p?.verdict || "-",
          terms: value,
        };
      });

      // Create Excel workbook with nested structure
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("MasterSheet");

      // Get all unique terms and subjects to build headers
      const allTerms = new Set<string>();
      const termSubjects: { [key: string]: Set<string> } = {};
      const META_KEYS = new Set([
        "Position",
        "Subject Total",
        "Subject Average",
        "Verdict",
      ]);

      convertToXLSX.forEach((row: any) => {
        Object.keys(row.terms).forEach((term) => {
          allTerms.add(term);
          if (!termSubjects[term]) {
            termSubjects[term] = new Set();
          }
          Object.keys(row.terms[term]).forEach((key) => {
            if (!META_KEYS.has(key)) {
              termSubjects[term].add(key);
            }
          });
        });
      });

      const sortedTerms = Array.from(allTerms).sort();
      const scoreHeaders = [
        "Test 1",
        "Test 2",
        "Test 3",
        "Exam",
        "Total",
        "Grade",
      ];
      const metaHeaders = [
        "Position",
        "Subject Total",
        "Subject Average",
        "Verdict",
      ];

      // Build header rows
      let colIndex = 1;
      // Row 1 reserved for term labels (merged across term blocks)
      // Row 2 for subject/meta labels
      // Row 3 for score labels (for subjects)
      worksheet.getCell(2, colIndex).value = "Student Name";
      worksheet.mergeCells(2, colIndex, 3, colIndex);
      colIndex++;
      worksheet.getCell(2, colIndex).value = "Class";
      worksheet.mergeCells(2, colIndex, 3, colIndex);
      colIndex++;
      worksheet.getCell(2, colIndex).value = "Class Teacher";
      worksheet.mergeCells(2, colIndex, 3, colIndex);
      colIndex++;

      const termColMap: { [key: string]: number } = {};

      sortedTerms.forEach((term) => {
        const subjects = Array.from(termSubjects[term]).sort();
        const termStartCol = colIndex;
        termColMap[term] = termStartCol;
        const termSpan =
          metaHeaders.length + subjects.length * scoreHeaders.length;

        // Term label (row 1) spanning the whole term block
        worksheet.mergeCells(1, termStartCol, 1, termStartCol + termSpan - 1);
        worksheet.getCell(1, termStartCol).value = `Term ${term}`;
        worksheet.getCell(1, termStartCol).font = { bold: true };
        worksheet.getCell(1, termStartCol).alignment = { horizontal: "center" };

        // Add meta headers in row 2 (each meta occupies a single column merged down)
        metaHeaders.forEach((m) => {
          const c = colIndex;
          worksheet.getCell(2, c).value = m;
          worksheet.mergeCells(2, c, 3, c);
          worksheet.getCell(2, c).font = { bold: true };
          worksheet.getCell(2, c).alignment = { horizontal: "center" };
          colIndex++;
        });

        // Now subjects
        subjects.forEach((subject) => {
          const subjectStartCol = colIndex;
          const subjectSpan = scoreHeaders.length;

          worksheet.mergeCells(
            2,
            subjectStartCol,
            2,
            subjectStartCol + subjectSpan - 1,
          );
          worksheet.getCell(2, subjectStartCol).value = subject;
          worksheet.getCell(2, subjectStartCol).font = { bold: true };
          worksheet.getCell(2, subjectStartCol).alignment = {
            horizontal: "center",
          };

          scoreHeaders.forEach((header, idx) => {
            worksheet.getCell(3, subjectStartCol + idx).value = header;
            worksheet.getCell(3, subjectStartCol + idx).font = { bold: true };
            worksheet.getCell(3, subjectStartCol + idx).alignment = {
              horizontal: "center",
            };
          });

          colIndex += subjectSpan;
        });
      });

      // Format header rows
      [1, 2, 3].forEach((row) => {
        for (let col = 1; col < colIndex; col++) {
          const cell = worksheet.getCell(row, col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
        }
      });

      // Fill data rows
      let rowIndex = 4;
      convertToXLSX.forEach((row: any) => {
        worksheet.getCell(rowIndex, 1).value = row.studentName;
        worksheet.getCell(rowIndex, 2).value = row.studentClass;
        worksheet.getCell(rowIndex, 3).value = row.classTeacher;

        colIndex = 4; // start at first term block
        sortedTerms.forEach((term) => {
          // write meta columns for this term
          metaHeaders.forEach((m) => {
            const val =
              (row.terms[term]?.[m] ?? row.terms[term]?.[m] === 0)
                ? row.terms[term][m]
                : "-";
            worksheet.getCell(rowIndex, colIndex).value = val;
            worksheet.getCell(rowIndex, colIndex).alignment = {
              horizontal: "center",
            };
            colIndex++;
          });

          // write subject score blocks
          const subjects = Array.from(termSubjects[term]).sort();
          subjects.forEach((subject) => {
            const subjectData = row.terms[term]?.[subject];
            if (subjectData) {
              const scoreValues = [
                subjectData.testOne,
                subjectData.testTwo,
                subjectData.testThree,
                subjectData.exam,
                subjectData.total,
                subjectData.grade,
              ];
              scoreValues.forEach((value, idx) => {
                worksheet.getCell(rowIndex, colIndex + idx).value = value;
                worksheet.getCell(rowIndex, colIndex + idx).alignment = {
                  horizontal: "center",
                };
              });
            } else {
              scoreHeaders.forEach((_, idx) => {
                worksheet.getCell(rowIndex, colIndex + idx).value = "-";
                worksheet.getCell(rowIndex, colIndex + idx).alignment = {
                  horizontal: "center",
                };
              });
            }
            colIndex += scoreHeaders.length;
          });
        });

        rowIndex++;
      });

      // Set column widths
      worksheet.columns = [
        { width: 40 },
        { width: 10 },
        { width: 12 },
        { width: 10 },
        { width: 12 },
        { width: 12 },
      ];
      for (let col = 6; col < colIndex; col++) {
        worksheet.getColumn(col).width = 12;
      }

      const filename = `mastersheet-${Date.now()}-${v4()}.xlsx`;
      const outputPath = path.join(__dirname, "../public", filename);
      const publicDir = path.join(__dirname, "../public");

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(outputPath);

      res.status(200).json({
        success: true,
        fileUrl: filename,
      });
    } catch (error) {
      next(error);
    }
  },
);

v2Routes.post(
  "/generate-student-result",
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let fileToDelete: any;
    try {
      const { studentId } = req.body;

      const studentDetails = await studentsCollection.findById(studentId);

      if (!studentDetails) {
        res.send({
          message: "Student details not found",
        });
        return;
      }

      const fileLink = await generateResultV2(
        studentId,
        studentDetails!!.schoolId?.toString() as string,
        "student",
        req.body.term,
        req.body.year,
        req.body.classId,
      );

      fileToDelete = fileLink;

      res.send(fileLink);
    } catch (error) {
      next(error);
    }
  },
);

// School scratch card
v2Routes.post("/students-and-scratch-cards", scratchCardV2);
v2Routes.post("/school-scratch-cards/create", createSchoolScratchCardsV2);
v2Routes.post("/school-scratch-cards/summary", cardSummaryV2);
v2Routes.post("/school-scratch-cards/view", viewSchoolUnpairedScratchCardsV2);
v2Routes.post("/school-scratch-cards/assign", assignScratchCardV2);
v2Routes.post(
  "/school-scratch-cards/view-paired",
  viewSchoolPairedScratchCardsV2,
);
v2Routes.post("/school-scratch-cards/unpair", unpairScratchCardV2);
v2Routes.post("/school-scratch-cards/reset", resetScratchCardAttempt);
v2Routes.post("/school-scratch-cards/search", searchScratchCardV2);
v2Routes.post("/school-scratch-cards/bulk-delete", deleteBulkScratchCardsV2);

// Admin Affective Assessment
v2Routes.get("/admin/affective-assessment", getAdminAffectiveAssessmentListV2);
v2Routes.post("/admin/affective-assessment", addAdminAffectiveAssessmentListV2);
v2Routes.put(
  "/admin/affective-assessment/:id",
  updateAdminAffectiveAssessmentListV2,
);
v2Routes.delete(
  "/admin/affective-assessment/:id",
  deleteAdminAffectiveAssessmentListV2,
);

// Teacher Affective Assessment
v2Routes.put(
  "/teacher/affective-assessments/update",
  updateAffectiveAssessmentV2,
);
v2Routes.patch(
  "/teacher/affective-assessments",
  deleteTeacherAffectivAssessmentV2,
);
v2Routes.post(
  "/teacher/affective-assessments",
  getTeacherAffectiveAssessmentV2,
);

v2Routes.put("/promote-students", promoteToClassV2);
v2Routes.put("/refresh-total-and-average", refreshStudentTotalAndAverageV2);

export default v2Routes;
