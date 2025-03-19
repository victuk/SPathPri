import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";

import { schoolFees } from '../models/feesModel';
import { schoolFeesSelector } from '../models/feesSelectorModel';
import { usersDB } from '../models/usersModel';
import axios from 'axios';
const payStackSecretKey = process.env.PAYSTACK_KEY;

async function verifyPayment(req: CustomRequest, res: Response, next: NextFunction) {
    const { referenceID } = req.body;
    const studentID = req.userDetails?.userId;

    try {
        const response = await axios.get(
            "https://api.paystack.co/transaction/verify/" + referenceID,
            {
              headers: {
                Authorization: "Bearer " + payStackSecretKey,
              },
            }
          );

          console.log(response.data.data);

          if(response.data == true) {
              if(response.data.data.metadata.newStudent == true) {
                await usersDB.findOneAndUpdate({
                    _id: studentID,
                    role: 'student'
                }, {
                    newStudent: false
                });
              }

              await schoolFees.create({
                 studentID,
                 referenceID,
                 amount: response.data.data.amount / 100,
                 term: response.data.data.metadata.termValue,
                 studentClass: response.data.data.metadata.classValue,
                 year: response.data.data.metadata.yearValue,
                 payDate: response.data.data.paidAt,
                 metaDetails: response.data.data.metadata,
                 splitDetails: response.data.data.split
              });
          }

          res.status(200).json({message: 'School fees paid successfully'});
          
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: 'Payment failed.'
        });
    }
}

async function verifyParentPayment(req: CustomRequest, res: Response, next: NextFunction) {
    const { referenceID } = req.body;
    const { id: studentID } = req.params;

    try {
        const response = await axios.get(
            "https://api.paystack.co/transaction/verify/" + referenceID,
            {
              headers: {
                Authorization: "Bearer " + payStackSecretKey,
              },
            }
          );

          console.log(response.data.data);

          if(response.data == true) {
              if(response.data.data.metadata.newStudent == true) {
                await usersDB.findOneAndUpdate({
                    _id: studentID,
                    role: 'student'
                }, {
                    newStudent: false
                });
              }

              await schoolFees.create({
                 studentID,
                 referenceID,
                 amount: response.data.data.amount / 100,
                 term: response.data.data.metadata.termValue,
                 studentClass: response.data.data.metadata.classValue,
                 year: response.data.data.metadata.yearValue,
                 payDate: response.data.data.paidAt,
                 metaDetails: response.data.data.metadata,
                 splitDetails: response.data.data.split
              });
          }

          res.status(200).json({message: 'School fees paid successfully'});
          
    } catch (error) {
        next(error);
    }
}

async function studentReceipts(req: CustomRequest, res: Response, next: NextFunction) {
    const studentID = req.userDetails?.userId;

    const feesReceiptArray = await schoolFees.find({studentID});

    res.status(200).json({receipts: feesReceiptArray});
}

async function specificReceipt(req: CustomRequest, res: Response, next: NextFunction) {
    const {referenceID} = req.body;
    const studentID = req.userDetails?.userId;

    const feesReceipt = await schoolFees.findOne({studentID, referenceID});

    res.status(200).json({receipt: feesReceipt});
}

async function receiptByStudentID(req: CustomRequest, res: Response, next: NextFunction) {
    const {studentID} = req.params;
    const feesReceipt = await schoolFees.find({studentID}).sort({payDate: -1});
    res.status(200).json({receipt: feesReceipt});
}

async function getSummary(req: CustomRequest, res: Response, next: NextFunction) {
    const {studentClass} = req.body;
    const paymentDetails =  schoolFeesSelector.findOne(studentClass, 'amount studentClass');

    res.json({
        paymentDetails
    });
}


async function getStudentByEmail(req: CustomRequest, res: Response, next: NextFunction) {
    const {studentEmail} = req.body;

    const student = await usersDB.findOne({$or: [{email: studentEmail}, {admissionNumber: studentEmail}], role: "student"}, "firstName surName otherNames gender passportPicture passportPublicId parentEmail parentPhone studentClass newStudent parentName stateOfOrigin localGovernmentOfOrigin category email role createdAt updatedAt");

    if(!student) {
        res.status(404).json({
            message: "Can't find a student with this email."
        });
    } else if(student.emailVerified == false) {
        res.status(404).json({
            message: "Kindly verify your email."
        });
    } else if(student.suspended == true) {
        res.status(404).json({
            message: "You have been suspended by the admin, kindly meet the admin to resolve this problem."
        });
    } else {
        res.json({
            student
        });
    }
}

export {
    verifyPayment,
    verifyParentPayment,
    studentReceipts,
    specificReceipt,
    getSummary,
    getStudentByEmail,
    receiptByStudentID
};
