import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { schoolSubjectCollection } from "../../models/officialSchoolSubjects";
import statusCodes from "readable-http-codes";
import { schoolClassCollection } from "../../models/schoolClasses";

async function addSubjects (req: CustomRequest, res: Response, next: NextFunction) {
    try {
        
        const {subject, subjectSlug, subjectCategory} = req.body;

        const subjectExistsAlready = await schoolSubjectCollection.exists({subject, subjectSlug, subjectCategory});

        if(subjectExistsAlready) {
            res.status(statusCodes.CONFLICT).send({
                errorMessage: "Subject already exists"
            });
            return;
        }

        await schoolSubjectCollection.create({subject, subjectSlug, subjectCategory});

        res.status(statusCodes.CREATED).send({
            message: "Subject created successfully"
        });

    } catch (error) {
        next(error);
    }
}

async function addClasses (req: CustomRequest, res: Response, next: NextFunction) {
    try {

        const {schoolClass, schoolClassCategory} = req.body;

        const classAndCategoryExistsAlready = await schoolClassCollection.exists({schoolClass, schoolClassCategory});

        if(classAndCategoryExistsAlready) {
            res.status(statusCodes.CONFLICT).send({
                errorMessage: "Class and category already exist"
            });
            return;
        }
        
    } catch (error) {
       next(error); 
    }
}

async function viewClassList (req: CustomRequest, res: Response, next: NextFunction) {
    try {
        
        const classList = await schoolClassCollection.find({});

        res.send({
            classList
        });

    } catch (error) {
        next(error);
    }
}

async function viewSubjectList (req: CustomRequest, res: Response, next: NextFunction) {
    try {

        const subjectList = await schoolSubjectCollection.find({});

        res.send({
            subjectList
        });
        
    } catch (error) {
        next(error);
    }
}

export {
    addSubjects,
    addClasses,
    viewClassList,
    viewSubjectList
};
