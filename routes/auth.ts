import express from 'express';
var router = express.Router();

import {
    registerStudents,
    registerTeacher,
    registerAdmins,
    // registerScoresUploader,
} from '../controllers/registerContoller';

import { changeRecordKeeperDetails } from "../controllers/recordkeeper/recordsController";

import { login } from '../controllers/loginController';
import { verifyEmail, checkIfEmailAlreadyExist } from '../controllers/verifyEmailController';
import {
    forgetPassword,
    resetPassword
} from '../controllers/forgotPasswordController';

// router.post('/register/recordkeeper', registerScoresUploader);
router.post('/changedetails', changeRecordKeeperDetails);
router.post('/register/student', registerStudents);
router.post('/register/teacher', registerTeacher);
router.post('/register/admin', registerAdmins);
router.post('/login', login);
router.put('/verify-email', verifyEmail);
router.post('/forget-password', forgetPassword);
router.put('/reset-password', resetPassword);
router.post('/does-email-exist', checkIfEmailAlreadyExist);

export default router;