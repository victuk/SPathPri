import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { assignmentCollection } from '../models/assignmentModel';
import { timeTableCollection } from '../models/timetableModel';

export const getTimetables = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { page, limit } = req.body;

        let fetchedTimeTables: any;

        if (req.userDetails!!.role == "student") {
            fetchedTimeTables = await timeTableCollection.paginate({
                assignmentStatus: "active"
            }, {
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
        } else {

            fetchedTimeTables = await assignmentCollection.paginate({}, {
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
        }

        res.send({
            result: fetchedTimeTables
        });

    } catch (error) {
        next(error);
    }
}

export const getTimeTableByClass = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const {classId} = req.params;

        const timetable = await timeTableCollection.findOne({classId});

        res.send({
            result: timetable
        });

    } catch (error) {
        next(error);
    }
}

export const getTimeTableById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const singleTimeTable = await timeTableCollection.findById(id);

        res.send({
            result: singleTimeTable,
            message: "Single assignment retrieved successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const createTimeTable = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            classId,
            fileLink
        } = req.body;

        const newAssignment = await timeTableCollection.create({
            uploadedById: req.userDetails!!.userId,
            classId,
            fileLink
        });

        res.send({
            message: "Assignment created successfully",
            result: newAssignment
        });

    } catch (error) {
        next(error);
    }
}

export const updateTimeTable = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            timeTableTitle,
            classId,
            assignmentStatus,
            fileLink
        } = req.body;

        const { id } = req.params;

        let updatedTimeTable = await timeTableCollection.findByIdAndUpdate(id, {
                timeTableTitle,
                classId,
                assignmentStatus,
                fileLink
            });


            res.send({
                message: "Time table updated successfully",
                result: updatedTimeTable
            });
        

    } catch (error) {
        next(error);
    }
}

export const deleteTimeTable = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const timeTableToDelete = await timeTableCollection.findById(id);

        if (!timeTableToDelete) {
            res.status(404).send({
                message: "No assignment founc"
            });
            return;
        }

        if ((timeTableToDelete!!.uploadedById).toString() != req.userDetails!!.userId && req.userDetails!!.role == "teacher") {
            res.status(401).send({
                message: "You are not authorized to take this action"
            });
            return;
        }

        const deletedTimeTable = await assignmentCollection.findByIdAndDelete(id);

        res.send({
            message: "Time table deleted successfully",
            result: deletedTimeTable
        });

    } catch (error) {
        next(error);
    }
}
