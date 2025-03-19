import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { assignmentCollection } from '../models/assignmentModel';
import { timeTableCollection } from '../models/timetableModel';
import { lessonNoteCollection } from '../models/lessonNoteModel';

export const createSchool = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { page, limit } = req.body;

        let fetchedLessonNotes = await lessonNoteCollection.paginate({}, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            populate: [
                {
                    path: "classId"
                },
                {
                    path: "subjectId"
                }
            ]
        });

        res.send({
            result: fetchedLessonNotes
        });

    } catch (error) {
        next(error);
    }
}

export const addSchoolAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const singleLessonNote = await lessonNoteCollection.findById(id);

        res.send({
            result: singleLessonNote,
            message: "Single lesson note retrieved successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const createLessonNote = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            title,
            classId,
            fileLink,
            visibility
        } = req.body;

        const newAssignment = await lessonNoteCollection.create({
            uploadedById: req.userDetails!!.userId,
            title,
            classId,
            fileLink,
            visibility
        });

        res.send({
            message: "Lesson note created successfully",
            result: newAssignment
        });

    } catch (error) {
        next(error);
    }
}

export const updateTimeTable = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            title,
            classId,
            fileLink,
            visibility
        } = req.body;

        const { id } = req.params;

        let updatedTimeTable = await lessonNoteCollection.findByIdAndUpdate(id, {
            title,
            classId,
            fileLink,
            visibility
            });


            res.send({
                message: "Lesson note updated successfully",
                result: updatedTimeTable
            });
        

    } catch (error) {
        next(error);
    }
}

export const deleteLessonNote = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const lessonNoteToDelete = await lessonNoteCollection.findById(id);

        if (!lessonNoteToDelete) {
            res.status(404).send({
                message: "No assignment founc"
            });
            return;
        }

        if ((lessonNoteToDelete!!.uploadedById).toString() != req.userDetails!!.userId || req.userDetails!!.role != "admin") {
            res.status(401).send({
                message: "You are not authorized to take this action"
            });
            return;
        }

        const deletedLessonNote = await lessonNoteCollection.findByIdAndDelete(id);

        res.send({
            message: "Time table deleted successfully",
            result: deletedLessonNote
        });

    } catch (error) {
        next(error);
    }
}
