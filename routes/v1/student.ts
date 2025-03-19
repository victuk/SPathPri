import { Router, Response, Request, NextFunction } from 'express';
import * as statusCodes from 'readable-http-codes';
import { CustomRequest } from '../../middleware/authenticatedUsersOnly';
import { studentsCollection } from '../../models/students';
import { AssessmentCollection } from '../../models/studentsAssessment';
import { AttendanceCollection } from '../../models/studentsAttendance';

const adminRoutes = Router({
    caseSensitive: false,
    mergeParams: true,
    // Local strict routing
    strict: false,
});

adminRoutes.get("/students", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const assessments = await studentsCollection.find({teacherId: req.userDetails?.userId});

        res.send(assessments);

    } catch (error) {
        next(error);
    }
});

adminRoutes.post("/student", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const newStudent = await studentsCollection.create(req.body);

        await AssessmentCollection.create({
            studentId: newStudent._id,
            catOne: 0,
            catTwo: 0,
            catThree: 0,
            exam: 0
        });

        res.send(newStudent);

    } catch (error) {
        next(error);
    }
});

export default adminRoutes;