import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { subjectCollection } from '../models/subjectCollection';

export const getSubjects = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const subjects = await subjectCollection.find({});

        res.send({
            result: subjects
        });

    } catch (error) {
        next(error);
    }
}

export const getSubject = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {id} = req.params;

        const subject = await subjectCollection.findById(id);

        res.send({
            result: subject
        });

    } catch (error) {
        next(error);
    }
}

export const createSubject = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {subject}: {subject: string} = req.body;

        const slug = subject.toLocaleLowerCase().trim().split(" ").join("-");

        const subjectAlreadyExist = await subjectCollection.findOne({slug});

        if(subjectAlreadyExist) {
            res.send({
                message: "This subject already exist"
            });
            return;
        }

        const newSubject = await subjectCollection.create({
            subject, slug
        });

        res.send({
            result: newSubject
        });

    } catch (error) {
        next(error);
    }
}

export const updateSubject = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {id} = req.params;

        const {subject} = req.body;

        const slug = subject.toLocaleLowerCase().trim().split(" ").join("-");

        const ubpdatedSubject = await subjectCollection.findByIdAndUpdate(id, {
            subject: subject.trim(), slug
        }, {new: true});

        res.send({
            result: ubpdatedSubject
        });

    } catch (error) {
        next(error);
    }
}

export const deleteSubject = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {id} = req.params;

        const deletedSubject = await subjectCollection.findByIdAndDelete(id);

        res.send({
            result: deletedSubject
        });

    } catch (error) {
        next(error);
    }
}
