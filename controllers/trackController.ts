import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { subjectCollection } from '../models/subjectCollection';
import { schoolClassCollection } from '../models/classModel';
import { trackCollection } from '../models/studentTrackCollection';

export const getSchoolTracks = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const schoolClasses = await trackCollection.find({});

        res.send({
            result: schoolClasses
        });

    } catch (error) {
        next(error);
    }
}

export const getSchoolTrack = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {id} = req.params;

        const subject = await trackCollection.findById(id);

        res.send({
            result: subject
        });

    } catch (error) {
        next(error);
    }
}

export const createSchoolTrack = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {track, slug} = req.body;

        const newSchoolTrack = await trackCollection.create({
            track, slug
        });

        res.send({
            result: newSchoolTrack
        });

    } catch (error) {
        next(error);
    }
}

export const updateSchoolTrack = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {id} = req.params;

        const {track, slug} = req.body;

        const ubpdatedSchoolTrack = await trackCollection.findByIdAndUpdate(id, {
            track, slug
        });

        res.send({
            result: ubpdatedSchoolTrack
        });

    } catch (error) {
        next(error);
    }
}

export const deleteSchoolTrack = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {id} = req.params;

        const deletedSchoolTrack = await trackCollection.findByIdAndDelete(id);

        res.send({
            result: deletedSchoolTrack
        });

    } catch (error) {
        next(error);
    }
}
