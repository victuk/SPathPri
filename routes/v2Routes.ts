import { Router, Response, Request, NextFunction } from "express";
import {
  CustomRequest,
  authenticatedUsersOnly,
} from "../middleware/authenticatedUsersOnly";
import {
  getStaffDetailsBeforeLogin,
  getStudentDetailsBeforeLogin,
  staffLogin,
  studentLogin,
} from "../controllers/loginController";
import {
  announcement,
  announcements,
  createAnnouncement,
  deleteAnnouncement,
  superAdminAnnouncement,
  updateAnnouncement,
} from "../controllers/announcementsController";
import {
  assessment,
  assessments,
  createAssessment,
  deleteAssessment,
  updateAssessment,
} from "../controllers/assessmentController";
import {
  assignment,
  assignments,
  createAssignment,
  deleteAssignment,
  getAssignmentTemplate,
  updateAssignment,
} from "../controllers/assignmentController";
import {
  approveOrDeclineResultUpdate,
  changeStudentsClass,
  createStaff,
  createStudent,
  CSVStaffByRole,
  deleteStudent,
  deleteStudentAssessment,
  getAllSchoolStudents,
  getApprovalList,
  getApprovalRecord,
  getSingleStudentResult,
  getStaff,
  getStaffByRole,
  getStaffs,
  getStudent,
  getStudentByEmail,
  getStudentByUID,
  getStudentResult,
  getStudents,
  getStudentTermResult,
  getTeacherAssessment,
  promoteStudents,
  removeStaffFromSchool,
  removeStudentFromSchool,
  resultUpdateRequest,
  searchStaffByRole,
  updateStaff,
  updateStudent,
  updateStudentResult,
  updateTeacherAssessment,
} from "../controllers/userManagementController";
import {
  createSubject,
  deleteSubject,
  getSubject,
  getSubjects,
  updateSubject,
} from "../controllers/schoolSubjectController";
import {
  createSchoolClass,
  deleteSchoolClass,
  generateResult,
  getClassesBySchoolId,
  getOneStudentResult,
  getResultRemark,
  getSchoolClass,
  getSchoolClasses,
  refreshStudentsClassSubjects,
  updateResultRemark,
  updateSchoolClass,
} from "../controllers/schoolClassController";
import {
  createSchoolTrack,
  deleteSchoolTrack,
  getSchoolTrack,
  getSchoolTracks,
  updateSchoolTrack,
} from "../controllers/trackController";
import {
  createScratchCards,
  CSVScratchCards,
  deleteScratchCard,
  getScratchCard,
  getScratchCards,
  pairAllStudents,
  pairScratchCard,
  scratchCardSummaey,
  unpairScratchCard,
} from "../controllers/scratchCardController";
import {
  getStaffProfile,
  getStudentProfile,
  getUserProfile,
} from "../controllers/profileController";
import { fileUpload } from "../controllers/fileController";
import { multerUpload } from "../utils/cloudinaryUtils";
import {
  createTimeTable,
  deleteTimeTable,
  getTimeTableByClass,
  getTimeTableById,
  getTimetables,
  updateTimeTable,
} from "../controllers/timeTableController";
import {
  createLessonNote,
  deleteLessonNote,
  getLessonNoteById,
  getLessonNotes,
  updateLessonNote,
} from "../controllers/lessonNoteController";
import {
  createCurriculum,
  deleteCurriculum,
  getCurriculum,
  getCurriculumById,
  getCurriculumTemplate,
  updateCurriculum,
} from "../controllers/curriculumController";
import {
  createSchool,
  getMySchoolDetails,
  getSchool,
  getSchools,
  updateSchool,
} from "../controllers/schoolController";
import {
  getSchoolSessionDetails,
  updateSchoolSessionDetails,
} from "../controllers/schoolSessionManager";
import {
  deleteSchoolTemplate,
  getSchoolTemplates,
  getTemplateByType,
  uploadSchoolTemplate,
} from "../controllers/templateController";
import { dashboardController } from "../controllers/dashboardController";
import {
  getClassAttendance,
  resetAttendance,
  updateAttendance,
} from "../controllers/attendanceController";
import { generatePDF, generateResultV2 } from "../controllers/generatePDFController";
import { sendTextMessages } from "../utils/sendTextUtil";
import roleBasedAccess from "../middleware/roleBasedAccess";
import { sendEmail } from "../utils/emailUtilities";
// import { refreshStudentsResult } from '../controllers/teacher/studentPositionController';
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { studentsCollection } from "../models/students";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { schoolProfileCollection } from "../models/schoolProfile";
import { resultCollection } from "../models/resultModel";
import { studentPositionAndRemark } from "../models/positionAndRemarksModel";
import { AttendanceCollection } from "../models/studentsAttendance";
import { staffsCollection } from "../models/staffs";
import { Types } from "mongoose";
import { changePasswordForStaffs, updatePasswordChangeForStaffs } from "../controllers/settingsController";
import { changeFeedbackTicketStatus, createFeedback, getOthersFeedbacks, getSubmittedFeedbacks, reopenFeedbackTicket, viewFeedback } from "../controllers/feedbackController";

const v2Routes = Router();

v2Routes.post("/generate-my-result", async (req: CustomRequest, res: Response, next: NextFunction) => {
  let fileToDelete: any;
  try {
    const fileLink = await generateResultV2(req.userDetails!!.userId, req.userDetails!!.schoolId!!, "student", req.body.term, req.body.year, req.body.classId);

    fileToDelete = fileLink;

    res.send(fileLink);
    
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
