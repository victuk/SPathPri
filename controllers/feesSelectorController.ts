import { usersDB } from '../models/usersModel';
import { schoolFees } from '../models/feesModel';
import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';

function replyForFees(req: CustomRequest, res: Response, newStudent: boolean, alreadyPaid: any, studentClass: string, next: NextFunction) {
    if(!alreadyPaid) {
        if(newStudent == true) {
            if(studentClass == 'js1') {
                res.json({
                    fee: 70000
                });
            } else if (studentClass == 'js2') {
                res.json({
                    fee: 70000
                });
            } else if (studentClass == 'js3') {
                res.json({
                    fee: 70000
                });
            } else if (studentClass == 'ss1') {
                res.json({
                    fee: 70000
                });
            } else if (studentClass == 'ss2') {
                res.json({
                    fee: 70000
                });
            } else if (studentClass == 'ss3') {
                res.json({
                    fee: 70000
                });
            } else {
                return
            }
        } else {
            if(studentClass == 'js1') {
                res.json({
                    fee: 50000
                });
            } else if (studentClass == 'js2') {
                res.json({
                    fee: 50000
                });
            } else if (studentClass == 'js3') {
                res.json({
                    fee: 50000
                });
            } else if (studentClass == 'ss1') {
                res.json({
                    fee: 50000
                });
            } else if (studentClass == 'ss2') {
                res.json({
                    fee: 50000
                });
            } else if (studentClass == 'ss3') {
                res.json({
                    fee: 120000
                });
            } else {
                return;
            }
        }
    } else {
        res.status(202).json({
            message: 'Already Paid',
            paymentDetails: alreadyPaid
        });
    }
}

async function selectFee(req: CustomRequest, res: Response, next: NextFunction) {
    const {
        studentClass,
        studentTerm,
        studentYear
    } = req.body;
    const studentID = req.userDetails?.userId;

    const user = await usersDB.findOne({_id:studentID, role: 'student'}, 'newStudent');


    const alreadyPaid = await schoolFees.findOne({
        studentID,
        term: studentTerm,
        studentClass,
        year: studentYear
    }, 'term studentClass year amount payDate');

    replyForFees(req, res, user?.newStudent!!, alreadyPaid, studentClass, next);
    
}

async function forParents(req: CustomRequest, res: Response, next: NextFunction) {
    const {
        studentClass,
        studentTerm,
        studentYear
    } = req.body;
    const {id: studentID} = req.params;

    const user = await usersDB.findOne({_id:studentID, role: 'student'}, 'newStudent');


    const alreadyPaid = await schoolFees.findOne({
        studentID,
        term: studentTerm,
        studentClass,
        year: studentYear
    }, 'term studentClass year amount payDate');

    replyForFees(req, res, user?.newStudent!!, alreadyPaid, studentClass, next);
}

export {
    selectFee,
    forParents
};