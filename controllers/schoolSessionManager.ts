import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { studentsCollection } from '../models/students';
import { schoolProfileCollection } from '../models/schoolProfile';
import { staffsCollection } from '../models/staffs';

export const getSchoolSessionDetails = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        // const {userType} = req.params;

        // if(userType == "student") {
        //     const studentDetails = await studentsCollection.findById(req.userDetails?.userId);
        //     const schoolDetails = await schoolProfileCollection.findById(studentDetails?.schoolId, "schoolName schoolLogo schoolMotto currentTerm currentYear");
        //     res.send({
        //         result: schoolDetails
        //     });
        // } else {
        //     const staffDetails = await staffsCollection.findById(req.userDetails?.userId);
        // }
        const schoolDetails = await schoolProfileCollection.findById(req.userDetails?.schoolId, "schoolName schoolLogo schoolMotto currentTerm currentYear");
        res.send({
            result: schoolDetails
        });

    } catch (error) {
        next(error);
    }
}

export const updateSchoolSessionDetails = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {currentTerm, currentYear} = req.body;
        

        if(!req.userDetails?.schoolId) {
            res.status(400).send({
                message: "School not found"
            });
            return;
        }

        const updatedSchoolSessionDetails = await schoolProfileCollection.findByIdAndUpdate(req.userDetails?.schoolId, {
            currentTerm, currentYear
        }, {new: true});

        res.send({
            message: "Current year and term updated succesfully",
            result: updatedSchoolSessionDetails
        });

    } catch (error) {
        next(error);
    }
}
