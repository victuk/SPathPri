import express from 'express';
const router = express.Router();
import {
    changeDetails,
    searchByEmailOrRegNumber,
    showStudents,
    specificStudent
} from '../controllers/admin/studentsController';

import { totalStudentsPerClass } from "../controllers/admin/dashboardSummaryController";

import {
    loadNewStudents,
    approveAdmission,
    deleteAdmission,
    getAdmissionMessage,
    setAdmissionMessage,
    editAdmissionMessage,
    deleteAdmissionMessage
} from "../controllers/admin/admissionController";

import {
    emailEveryParent,
    emailEveryTeacher,
    emailSpecificPeople
} from '../controllers/admin/emailController';

import {
    fetchSetting,
    set,
    edit
} from "../controllers/admin/settingsController";

import {
    createAnnouncement,
    deleteSpecificAnnouncement,
    getAllAnnouncements,
    specificAnnouncement,
    editSpecificAccouncement
} from '../controllers/admin/announcementController';

import {
    // addTeacher,
    searchTeacherByEmail,
    searchTeacherByName,
    specificTeacher,
    getEveryTeacher
} from '../controllers/admin/teacherController';

import {
    feeDriveByEmail,
    feeDriveByClass
} from "../controllers/admin/feeDriveController";

import hasAccess from '../middleware/roleBasedAccess';

import { authenticatedUsersOnly } from '../middleware/authenticatedUsersOnly';
// import { isRestricted } from '../authenticationMiddlewares/isRestricted';

router.get("/setting/term-and-year", fetchSetting);

router.use(authenticatedUsersOnly);
// router.use(isRestricted);

router.get('/students', showStudents);
router.get('/student/:id', specificStudent);
router.put('/student/:id', changeDetails);
// router.get('/search-student/:firstName/:surName', searchByName);
router.get('/search-by-email-or-reg-number/:emailOrRegNumber', searchByEmailOrRegNumber);

router.get('/search-teacher/:firstName/:surname', searchTeacherByName);
router.get('/search-teacher-by-email/:email', searchTeacherByEmail);
router.get('/teacher/:id', specificTeacher);
router.get('/every-teacher', getEveryTeacher);

// To test
router.post('/email/parents', emailEveryParent);
router.post('/email/teachers', emailEveryTeacher);
router.post('/email/one-person', emailSpecificPeople);
// router.post('/email/parent/:id');
// router.post('/email/parents-array');

// router.get('/teachers-request');
// router.post('/accept-request');

// School Admin Announcements
router.post('/announcement', hasAccess(["admin"]), createAnnouncement);
router.get('/announcements', hasAccess(["admin"]), getAllAnnouncements);
router.get('/announcement/:id', hasAccess(["admin"]), specificAnnouncement);
router.put('/announcement/:id', hasAccess(["admin"]), editSpecificAccouncement);
router.delete('/announcement/:id', hasAccess(["admin"]), deleteSpecificAnnouncement);

router.get('/newly-admitted-students', hasAccess(["admin"]), loadNewStudents);
router.post('/approve-admission/:studentID', hasAccess(["admin"]), approveAdmission);
router.delete('/delete-admission/:studentID', hasAccess(["admin"]), deleteAdmission);

router.get("/admission-message", getAdmissionMessage);
router.post("/admission-message", hasAccess(["admin"]), setAdmissionMessage);
router.put("/admission-message/:id", hasAccess(["admin"]), editAdmissionMessage);
router.delete("/admission-message/:id", hasAccess(["admin"]), deleteAdmissionMessage);


router.post("/setting/term-and-year", hasAccess(["admin"]), set);
router.put("/setting/term-and-year/:id", hasAccess(["admin"]), edit);


router.get("/students-per-class", hasAccess(["admin"]), totalStudentsPerClass);

router.get("/class-feedrive/:studentClass", feeDriveByClass);
router.get("/student-feedrive/:emailOrRegNo/:studentClass", feeDriveByEmail);

export default router;
