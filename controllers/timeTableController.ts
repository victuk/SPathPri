import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { assignmentCollection } from '../models/assignmentModel';
import { timeTableCollection } from '../models/timetableModel';
import Joi from 'joi';

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

export const getAllTimetables = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const timetables = await timeTableCollection.find({});
        res.send({
            result: timetables
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
            title,
            fileLink
        }: {title: string, fileLink: string} = req.body;

        const {error} = Joi.object({
            title: Joi.string().required().messages({
                "any.required": "Title is required"
            }),
            fileLink: Joi.string().uri().required().messages({
                "any.required": "File link is required",
                "string.uri": "File link should be a valid url"
            })
        }).validate(req.body);

        if(error) {
            res.status(400).send({
                errorMessage: error.message
            });
            return;
        }

        const newTimetable = await timeTableCollection.create({
            uploadedById: req.userDetails!!.userId,
            title: title.trim(),
            fileLink
        });

        res.send({
            message: "Timetable created successfully",
            result: newTimetable
        });

    } catch (error) {
        next(error);
    }
}


export const deleteTimeTable = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        if(!id) {
            res.status(400).send({
                errorMessage: "Time table ID to be deleted not supplied"
            });
            return;
        }

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
