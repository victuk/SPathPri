import express from 'express';
var router = express.Router();

import hasAccess from '../middleware/roleBasedAccess';

import { authenticatedUsersOnly } from '..//middleware/authenticatedUsersOnly';
// import { isRestricted } from '../authenticationMiddlewares/isRestricted';

import {
    verifyPayment,
    verifyParentPayment,
    studentReceipts,
    specificReceipt,
    getStudentByEmail,
    receiptByStudentID
} from '../controllers/paymentController';

import { selectFee, forParents } from '../controllers/feesSelectorController';

router.post('/student', getStudentByEmail);
router.post('/parent-summary/:id', forParents);
router.post('/verify-parent-payment/:id', verifyParentPayment);

router.use(authenticatedUsersOnly);
// router.use(isRestricted);

// Fee payment procedure for students
router.post('/get-summary', hasAccess(["student"]), selectFee);
router.post('/verify-payment', hasAccess(["student"]), verifyPayment);

// Retrieving receipts
router.get('/receipt-list/:studentClass/:term/:year', studentReceipts);
router.get('/receipt/:studentID/:studentClass/:term/:year', specificReceipt);

// For admins
router.get('/receipt-by-id/:studentID', hasAccess(["admin"]), receiptByStudentID);

export default router;
