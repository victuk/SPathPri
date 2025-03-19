import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { schoolsCollection } from "../models/_schoolCollection";
import { schoolProfileCollection } from "../models/schoolProfile";
import { v4 } from "uuid";
import { createSchoolId } from "../utils/idCreatorUtils";



export const getSchools = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        // const {page, limit} = req.body;

        // const schools = await schoolProfileCollection.paginate({}, {
        //     page: page ? parseInt(page) : 1,
        //     limit: limit ? parseInt(limit) : 10,
        //     sort: {schoolName: -1}
        // });

        const schools = await schoolProfileCollection.find({}).sort({schoolName: -1});

        res.send({
            result: schools
        });

    } catch (error) {
        next(error);
    }
}

export const getSchool = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {id} = req.params;

        const schoolDetails = await schoolProfileCollection.findById(id);

        res.send({
            result: schoolDetails
        });

    } catch (error) {
        next(error);
    }
}

export const createSchool = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {
            schoolName,
            schoolLogo,
            schoolMotto,
            location,
            schoolEmail,
            schoolPhoneNumber,
            currentTerm,
            currentYear
        } = req.body;

        const newSchool = await schoolProfileCollection.create({
            schoolName,
            schoolUid: await createSchoolId(schoolName),
            schoolLogo,
            schoolMotto,
            location,
            schoolEmail,
            schoolPhoneNumber,
            currentTerm,
            currentYear
        });

        res.send({
            result: newSchool
        });

    } catch (error) {
        next(error);
    }
}

export const updateSchool = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {
            ownerName,
            schoolName,
            schoolLogo,
            schoolAddress,
            email,
            phoneNumber,
            motto
        } = req.body;

        const {id} = req.params;

        const newSchool = await schoolsCollection.findByIdAndUpdate(id, {
            ownerName,
            schoolName,
            schoolLogo,
            schoolAddress,
            email,
            phoneNumber,
            motto
        });

        res.send({
            result: newSchool
        });

    } catch (error) {
        next(error);
    }
}
