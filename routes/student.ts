import express from 'express';
var router = express.Router();

import {
    updateStudentProfile,
    getStudentProfile
} from '../controllers/student/studentController';

import { getResult } from '../controllers/student/resultsController';

import { authenticatedUsersOnly } from '..//middleware/authenticatedUsersOnly';
// import { isRestricted } from '../authenticationMiddlewares/isRestricted';

router.use(authenticatedUsersOnly);
// router.use(isRestricted);

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// router.post('/results');
router.post('/result', getResult);
// router.get('/result/:id');

// router.get('/parents-request');
// router.post('/accept-parent');

export default router;
