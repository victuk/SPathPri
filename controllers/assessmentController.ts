import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { AssessmentCollection } from '../models/studentsAssessment';
import { studentsCollection } from '../models/students';
import { staffsCollection } from '../models/staffs';
import { subjectCollection } from '../models/subjectCollection';
import { resultCollection } from '../models/resultModel';

export const assessments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { subjectId, classId, year, studentId } = req.body;

        const query: any = {};

        if(subjectId) query.subjectId = subjectId;
        if(classId) query.subjectId = classId;
        if(classId) query.year = year;
        if(studentId) query.year = studentId;

        let userDetails: any;

        if(req.userDetails?.role == "student") {
            userDetails = await studentsCollection.findById(req.userDetails.userId);
        } else {
            userDetails = await staffsCollection.findById(req.userDetails?.userId);
        }

        query.schoolId = userDetails.schoolId;

        const assessment = await AssessmentCollection.find(query);

        res.send({
            result: assessment,
            message: "Assessment fetched successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const assessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const assessment = await AssessmentCollection.findById(req.params.id);

        res.send({
            result: assessment
        });

    } catch (error) {
        next(error);
    }
}

export const createAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {
            assessmentId,
            studentId,
            teacherId,
            subjectId,
            classId,
            year,
            testOne,
            testTwo,
            testThree,
            exam
        } = req.body;

        let createdAssessment: any;

        if (req.userDetails?.role == "teacher") {

            createdAssessment = await AssessmentCollection.create({
                testOne, testTwo, testThree, exam
            });
        } else {
            createdAssessment = await AssessmentCollection.create({
                assessmentId,
                studentId,
                teacherId,
                subjectId,
                classId,
                year,
                testOne,
                testTwo,
                testThree,
                exam
            });
        }

        res.send({
            message: "Assessment record created",
            result: createdAssessment
        });

    } catch (error) {
        next(error);
    }
}

export const updateAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            assessmentId,
            studentId,
            teacherId,
            subjectId,
            classId,
            year,
            testOne,
            testTwo,
            testThree,
            exam
        } = req.body;

        let updatedAssessment: any;

        if (req.userDetails?.role == "teacher") {

            updatedAssessment = await AssessmentCollection.findByIdAndUpdate(assessmentId, {
                testOne, testTwo, testThree, exam
            }, { new: true });
        } else {
            updatedAssessment = await AssessmentCollection.findByIdAndUpdate(assessmentId, {
                assessmentId,
                studentId,
                teacherId,
                subjectId,
                classId,
                year,
                testOne,
                testTwo,
                testThree,
                exam
            }, { new: true });
        }

        res.send({
            message: "Assessment record updated",
            result: updatedAssessment
        });

    } catch (error) {
        next(error);
    }
}

export const deleteAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const deletedAssessment = await AssessmentCollection.findByIdAndDelete(id);

        res.send({
            message: "Assessment deleted successfully",
            deletedAssessment
        });

    } catch (error) {
        next(error);
    }
}

