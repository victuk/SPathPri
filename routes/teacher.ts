import express from 'express';
var router = express.Router();

import {
    deleteRecord,
    editRecord,
    searchByName,
    getStudentsResults,
    specificStudentDetail
} from '../controllers/teacher/recordsController';

import {
    getTeacherProfile
} from '../controllers/teacher/profileController';

import {
    getStudentsPosition,
    editPosition,
    refreshStudentsResult
} from "../controllers/teacher/studentPositionController";

import { authenticatedUsersOnly } from '../middleware/authenticatedUsersOnly';

import hasAccess from '../middleware/roleBasedAccess';

router.use(authenticatedUsersOnly);
router.use(hasAccess(["teacher"]));

router.get('/profile', getTeacherProfile);

router.post('/student-class-record', getStudentsResults);
router.get('/student/:id', specificStudentDetail);
router.put('/student-record/:id', editRecord);
router.delete('/student-record/:id', deleteRecord);

router.get('/student/:firstName/:surName', searchByName);

router.get("/student-positions", getStudentsPosition);
router.post("/edit-student-position", editPosition);
router.get("/refresh-student-position", refreshStudentsResult);

module.exports = router;