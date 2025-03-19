import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { studentsCollection } from '../models/students';
import { staffsCollection } from '../models/staffs';



export const getStudentProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const profile = await studentsCollection.findById(req.userDetails?.userId).populate("schoolId");

        res.send({
            result: profile
        });

    } catch (error) {
        next(error);
    }
}


export const getStaffProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const profile = await staffsCollection.findById(req.userDetails?.userId).populate("classTeacherOf").populate("subjectTeacherOf.classId").populate("subjectTeacherOf.subjectId").populate("schoolId");

        res.send({
            result: profile
        });

    } catch (error) {
        next(error);
    }
}

export const getUserProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {id, userType} = req.params;

        let profile = null;

        if(userType == "student") {
            profile = await studentsCollection.findById(id).populate("schoolId").populate("classId");
        } else {
            profile = await staffsCollection.findById(id).populate("classTeacherOf").populate("subjectTeacherOf").populate("schoolId");
        }
        
        res.send({
            result: profile
        });

    } catch (error) {
        next(error);
    }
}
