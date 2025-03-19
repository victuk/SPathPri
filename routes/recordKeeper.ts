import express from 'express';
var router = express.Router();

import { uploadRecords, loadTeachers, viewRecordsByClass } from "../controllers/recordkeeper/recordsController";
import { authenticatedUsersOnly } from '..//middleware/authenticatedUsersOnly';
// import { isRestricted } from '../authenticationMiddlewares/isRestricted';

router.use(authenticatedUsersOnly);
// router.use(isRestricted);

router.post('/upload', uploadRecords);
router.get('/resultsbyclass/:choosenClass', viewRecordsByClass);
router.get('/loadteachers', loadTeachers);

export default router;