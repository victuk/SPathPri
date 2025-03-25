import { Router, Response, Request, NextFunction } from 'express';
import {CustomRequest, authenticatedUsersOnly} from '../middleware/authenticatedUsersOnly';
import { getStaffDetailsBeforeLogin, getStudentDetailsBeforeLogin, staffLogin, studentLogin } from '../controllers/loginController';
import { announcement, announcements, createAnnouncement, deleteAnnouncement, superAdminAnnouncement, updateAnnouncement } from '../controllers/announcementsController';
import { assessment, assessments, createAssessment, deleteAssessment, updateAssessment } from '../controllers/assessmentController';
import { assignment, assignments, createAssignment, deleteAssignment, getAssignmentTemplate, updateAssignment } from '../controllers/assignmentController';
import { approveOrDeclineResultUpdate, changeStudentsClass, createStaff, createStudent, CSVStaffByRole, deleteStudent, deleteStudentAssessment, getAllSchoolStudents, getApprovalList, getApprovalRecord, getSingleStudentResult, getStaff, getStaffByRole, getStaffs, getStudent, getStudentByEmail, getStudentByUID, getStudentResult, getStudents, getTeacherAssessment, promoteStudents, removeStaffFromSchool, removeStudentFromSchool, resultUpdateRequest, searchStaffByRole, updateStaff, updateStudent, updateStudentResult, updateTeacherAssessment } from '../controllers/userManagementController';
import { createSubject, deleteSubject, getSubject, getSubjects, updateSubject } from '../controllers/schoolSubjectController';
import { createSchoolClass, deleteSchoolClass, generateResult, getClassesBySchoolId, getOneStudentResult, getResultRemark, getSchoolClass, getSchoolClasses, refreshStudentsClassSubjects, updateResultRemark, updateSchoolClass } from '../controllers/schoolClassController';
import { createSchoolTrack, deleteSchoolTrack, getSchoolTrack, getSchoolTracks, updateSchoolTrack } from '../controllers/trackController';
import { createScratchCards, deleteScratchCard, getScratchCard, getScratchCards, pairAllStudents, pairScratchCard, scratchCardSummaey, unpairScratchCard } from '../controllers/scratchCardController';
import { getStaffProfile, getStudentProfile, getUserProfile } from '../controllers/profileController';
import { fileUpload } from '../controllers/fileController';
import { multerUpload } from '../utils/cloudinaryUtils';
import { createTimeTable, deleteTimeTable, getTimeTableByClass, getTimeTableById, getTimetables, updateTimeTable } from '../controllers/timeTableController';
import { createLessonNote, deleteLessonNote, getLessonNoteById, getLessonNotes, updateLessonNote } from '../controllers/lessonNoteController';
import { createCurriculum, deleteCurriculum, getCurriculum, getCurriculumById, getCurriculumTemplate, updateCurriculum } from '../controllers/curriculumController';
import { createSchool, getSchool, getSchools, updateSchool } from '../controllers/schoolController';
import { getSchoolSessionDetails, updateSchoolSessionDetails } from '../controllers/schoolSessionManager';
import { deleteSchoolTemplate, getSchoolTemplates, uploadSchoolTemplate } from '../controllers/templateController';
import { dashboardController } from '../controllers/dashboardController';
import { getClassAttendance, resetAttendance, updateAttendance } from '../controllers/attendanceController';
import { generatePDF } from '../controllers/generatePDFController';
import { sendTextMessages } from '../utils/sendTextUtil';
import roleBasedAccess from '../middleware/roleBasedAccess';
import { sendEmail } from '../utils/emailUtilities';
// import { refreshStudentsResult } from '../controllers/teacher/studentPositionController';
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { studentsCollection } from '../models/students';
import { StudentsScratchCardCollection } from '../models/studentsScratchCard';
import { schoolProfileCollection } from '../models/schoolProfile';

const v1Routes = Router();

v1Routes.get("/pair-all-students", async (req, res, next) => {
    try {

      // const students = await studentsCollection.find({});
      // const studentScratchCard = await StudentsScratchCardCollection.find({});

      // for(let i = 0; i < students.length; i++) {
      //   const studentHasScratchCard = studentScratchCard.find(s => (s.studentId).toString() == (students[i]._id).toString());

      //   if(!studentHasScratchCard) {
      //     const unpairedScratchCard = studentScratchCard.find(s => (s.studentId).toString() == null);

      //     if(unpairedScratchCard) {
      //       await StudentsScratchCardCollection.findByIdAndUpdate(unpairedScratchCard._id, {
      //         studentId: students[i]._id
      //       });
      //     } else {
      //       const schoolDetails = await schoolProfileCollection.findById(students[i].schoolId);
      //       await StudentsScratchCardCollection.create({
      //         studentId: students[i]._id,
      //         scratchCardId: v4().split("-")[4],
      //         dateIssued: new Date(),
      //         schoolId: students[i].schoolId,
      //         year: schoolDetails?.currentYear,
      //         term: schoolDetails?.currentTerm
      //       });
      //     }
      //   }
      // }
      
      // res.send();

    } catch (error) {
        next(error);
    }

});

v1Routes.post("/student-login", studentLogin);
v1Routes.post("/staff-login", staffLogin);
v1Routes.get("/student-detail-before-login/:scratchCardId", getStudentDetailsBeforeLogin);
v1Routes.get("/staff-detail-before-login/:email", getStaffDetailsBeforeLogin);

v1Routes.use(authenticatedUsersOnly);

v1Routes.post("/file", multerUpload.single("file"), fileUpload);

// Dashboard routes
v1Routes.get("/dashboard-summary", dashboardController);

// Announcement routes
v1Routes.get("/announcements/:page/:limit", announcements);
v1Routes.get("/announcement/:id", announcement);
v1Routes.post("/announcement", createAnnouncement);
v1Routes.put("/announcement/:id", updateAnnouncement);
v1Routes.delete("/announcement/:id", deleteAnnouncement);

// Super admin announcement
v1Routes.post("/super-admin-announcement", superAdminAnnouncement);

// Assessment routes
v1Routes.post("/assessments", assessments);
v1Routes.get("/assessment/:id", assessment);
v1Routes.get("/assessment", createAssessment);
v1Routes.put("/assessment/:id", updateAssessment);
v1Routes.delete("/assessment/:id", deleteAssessment);

v1Routes.get("/teacher-assessment");

// Term Result
v1Routes.post("/student-term-result", getOneStudentResult);
v1Routes.get("/result-remarks/:classId", getResultRemark);
v1Routes.put("/result-remark/:positionId", updateResultRemark);

// Assignment routes
v1Routes.post("/assignments", assignments);
v1Routes.get("/assignment/:id", assignment);
v1Routes.post("/assignment", createAssignment);
v1Routes.put("/assignment/:id", updateAssignment);
v1Routes.delete("/assignment/:id", deleteAssignment);

// Staff routes
v1Routes.get("/staffs/:schoolId/:page/:limit", getStaffs);
v1Routes.get("/staffs-for-csv/:role", CSVStaffByRole);
v1Routes.get("/staffs-by-role/:role/:page/:limit", getStaffByRole);
v1Routes.post("/search-staffs-by-role", searchStaffByRole);
v1Routes.get("/staff/:id", getStaff);
v1Routes.post("/staff", roleBasedAccess(["admin", "super-admin"]), createStaff);
v1Routes.put("/staff/:id", updateStaff);
v1Routes.delete("/staff/:id", removeStaffFromSchool);

// Student routes
v1Routes.post("/students/:page/:limit", getStudents);
v1Routes.get("/student/:id", getStudent);
v1Routes.post("/student", roleBasedAccess(["admin", "super-admin"]), createStudent);
v1Routes.get("/student-by-email/:email", getStudentByEmail);
v1Routes.post("/student-by-uid", getStudentByUID);
// v1Routes.get("/student", createStudent);
v1Routes.put("/student/:id", updateStudent);
v1Routes.delete("/remove-from-school/:id", removeStudentFromSchool);
v1Routes.delete("/student/:id", deleteStudent);
v1Routes.get("/all-school-students", getAllSchoolStudents);

// Student result
v1Routes.post(`/student-result/:page/:limit`, getStudentResult);
v1Routes.get("/single-student-result/:page/:limit", getSingleStudentResult);
v1Routes.put(`/student-result/:recordId`, updateStudentResult);
v1Routes.put("/students-class", roleBasedAccess(["admin", "teacher"]), changeStudentsClass);
v1Routes.put("/promote-students", roleBasedAccess(["admin", "teacher"]), promoteStudents);
v1Routes.put("/generate-result", generateResult);
v1Routes.put("/refresh-students-subject", refreshStudentsClassSubjects);

// Change approval routes
v1Routes.get("/approval-list/:status/:page/:limit", roleBasedAccess(["teacher", "record-keeper", "admin"]), getApprovalList);
v1Routes.get("/approval-record/:id", roleBasedAccess(["teacher", "record-keeper", "admin"]), getApprovalRecord);
v1Routes.post("/create-request", roleBasedAccess(["record-keeper", "admin"]), resultUpdateRequest);
v1Routes.put("/approve-or-decline", roleBasedAccess(["teacher"]), approveOrDeclineResultUpdate);

// Teacher Assessment
v1Routes.post("/teacher-assessments", roleBasedAccess(["teacher"]), getTeacherAssessment);
v1Routes.put("/teacher-assessment", roleBasedAccess(["teacher"]), updateTeacherAssessment);
v1Routes.delete("/teacher-assessment/:studentId/:subjectId/:classId", roleBasedAccess(["teacher"]), deleteStudentAssessment);

// Subject routes
v1Routes.get("/subjects", getSubjects);
v1Routes.get("/subject/:id", getSubject);
v1Routes.post("/subject", createSubject);
v1Routes.put("/subject/:id", updateSubject);
v1Routes.delete("/subject/:id", deleteSubject);

// Curriculum
v1Routes.get("/curriculums/:page/:limit", getCurriculum);
v1Routes.get("/curriculum/:id", getCurriculumById);
v1Routes.post("/curriculum", createCurriculum);
v1Routes.put("/curriculum/:id", updateCurriculum);
v1Routes.delete("/curriculum/:id", deleteCurriculum);

// Time table
v1Routes.get("/time-tables", getTimetables);
v1Routes.get("/time-table-by-class/:classId", getTimeTableByClass);
v1Routes.get("/time-table/:id", getTimeTableById);
v1Routes.post("/time-table", createTimeTable);
v1Routes.put("/time-table/:id", updateTimeTable);
v1Routes.delete("/time-table/:id", deleteTimeTable);

// Student's class
v1Routes.get("/classes", getSchoolClasses);
v1Routes.get("/classes-by-school-id/:schoolId", getClassesBySchoolId);
v1Routes.get("/class/:id", getSchoolClass);
v1Routes.post("/class", createSchoolClass);
v1Routes.put("/class/:id", updateSchoolClass);
v1Routes.delete("/class/:id", deleteSchoolClass);

// Lesson note
v1Routes.get("/lesson-notes", getLessonNotes);
v1Routes.get("/lesson-note/:id", getLessonNoteById);
v1Routes.post("/lesson-note", createLessonNote);
v1Routes.put("/lesson-note/:id", updateLessonNote);
v1Routes.delete("/lesson-note/:id", deleteLessonNote);

// School student track Track
v1Routes.get("/tracks", getSchoolTracks);
v1Routes.get("/track/:id", getSchoolTrack);
v1Routes.post("/track", createSchoolTrack);
v1Routes.put("/track/:id", updateSchoolTrack);
v1Routes.delete("/track/:id", deleteSchoolTrack);

// Scrath card route
v1Routes.get("/scratch-cards/:page/:limit/:scratchCardType", getScratchCards);
v1Routes.get("/scratch-card/:id", getScratchCard);
v1Routes.get("/scratch-card-summary", scratchCardSummaey);
v1Routes.post("/scratch-card", createScratchCards);
v1Routes.post("/bulk-pair", pairAllStudents);
v1Routes.put("/pair-scratch-card", pairScratchCard);
v1Routes.put("/unpair-scratch-card", unpairScratchCard);
v1Routes.delete("/scratch-card/:id", deleteScratchCard);

// Profile route
v1Routes.get("/profile/student", getStudentProfile);
v1Routes.get("/profile/staff", getStaffProfile);
v1Routes.get("/profile/user/:id/:userType", getUserProfile);

// School session
v1Routes.get("/school-session/:userType", getSchoolSessionDetails);
v1Routes.put("/school-session", updateSchoolSessionDetails);

// School template controller
v1Routes.get("/school-templates", getSchoolTemplates);
v1Routes.put("/school-template", uploadSchoolTemplate);
v1Routes.delete("/school-template/:id", deleteSchoolTemplate);
v1Routes.get("/assignment-template", getAssignmentTemplate);
v1Routes.get("/curriculum-template", getCurriculumTemplate);

v1Routes.get("/schools", getSchools);
v1Routes.get("/school/:id", getSchool);
v1Routes.post("/school", createSchool);
v1Routes.put("/school/:id", updateSchool);
// v1Routes.put("/school/:id", deleteSchoo);

// Attendance routes
v1Routes.post("/class-attendance", getClassAttendance);
v1Routes.put("/class-attendance", updateAttendance);
v1Routes.put("/reset-class-attendance", resetAttendance);

v1Routes.post("/generate-pdf", generatePDF);

export default v1Routes;
