import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { schoolsCollection } from "../models/_schoolCollection";
import { schoolProfileCollection } from "../models/schoolProfile";
import { v4 } from "uuid";
import { createSchoolId } from "../utils/idCreatorUtils";
import Joi from "joi";



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

        const {error} = Joi.object({
            schoolName: Joi.string().min(5).required().messages({
                "string.min": "School name can not be less than 5 characters",
                "any.required": "School name can't be empty"
            }),
            schoolLogo: Joi.string().uri().required().messages({
                "string.uri": "School logo has to be a valid URI",
                "any.required": "School logo can't be empty"
            }),
            schoolMotto: Joi.string().required().messages({
                "any.required": "School motto can't be empty"
            }),
            location: Joi.string().required(),
            schoolEmail: Joi.string().email({tlds: {allow: false}}).required().messages({
                "string.email": "School email has to be a vaid email address",
                "any.required": "School email is required"
            }),
            schoolPhoneNumber: Joi.string().min(11).required().messages({
                "string.min": "School phone number should be at lest 11 characters",
                "any.required": "School phone number can not be empty"
            }),
            currentTerm: Joi.string().required().messages({
                "any.requried": "Current term can't be empty"
            }),
            currentYear: Joi.string().required().messages({
                "any.requried": "Current term can't be empty"
            })
        }).validate(req.body);

        if(error) {
            res.status(400).send({
                errorMessage: error.message
            });
            return;
        }

        const schoolEmailAlreadyExist = await schoolProfileCollection.findOne({schoolEmail});

        if(schoolEmailAlreadyExist) {
            res.status(400).send({
                errorMessage: `${schoolEmail} already exists. Kindly use a different email`
            });
            return;
        }

        const schoolPhoneNumberAlreadyExist = await schoolProfileCollection.findOne({schoolPhoneNumber});

        if(schoolPhoneNumberAlreadyExist) {
            res.status(400).send({
                errorMessage: `${schoolPhoneNumber} already exists. Kindly use a different phone number`
            });
            return;
        }

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
            // schoolLogo,
            schoolAddress,
            email,
            phoneNumber,
            motto
        } = req.body;

        const {id} = req.params;

        if(!id) {
            res.status(400).send({
                errorMessage: "ID can't be empty."
            });
            return;
        }

        const {error} = Joi.object({
            schoolName: Joi.string().min(5).required().messages({
                "string.min": "School name can not be less than 5 characters",
                "any.required": "School name can't be empty"
            }),
            schoolMotto: Joi.string().required().messages({
                "any.required": "School motto can't be empty"
            }),
            location: Joi.string().required(),
            schoolEmail: Joi.string().email({tlds: {allow: false}}).required().messages({
                "string.email": "School email has to be a vaid email address",
                "any.required": "School email is required"
            }),
            schoolPhoneNumber: Joi.string().min(11).required().messages({
                "string.min": "School phone number should be at lest 11 characters",
                "any.required": "School phone number can not be empty"
            }),
            currentTerm: Joi.string().required().messages({
                "any.requried": "Current term can't be empty"
            }),
            currentYear: Joi.string().required().messages({
                "any.requried": "Current term can't be empty"
            })
        }).validate(req.body);

        if(error) {
            res.status(400).send({
                errorMessage: error.message
            });
            return;
        }

        const schoolExists = await schoolProfileCollection.findById(id);

        if(!schoolExists) {
            res.status(404).send({
                errorMessage: "School does not exist"
            });
            return;
        }

        const updatedSchool = await schoolProfileCollection.findByIdAndUpdate(id, {
            ownerName,
            schoolName,
            // schoolLogo,
            schoolAddress,
            email,
            phoneNumber,
            motto
        }, {new: true});

        res.send({
            result: updatedSchool
        });

    } catch (error) {
        next(error);
    }
}

export const getMySchoolDetails = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const schoolId = req.userDetails?.schoolId;

        console.log("req.userDetails", req.userDetails);

        const schoolDetails = await schoolProfileCollection.findById(schoolId);

        if(!schoolDetails) {
            res.status(404).send({
                message: "School details not found"
            });
        }

        res.send({
            result: schoolDetails
        });

    } catch (error) {
        next(error);
    }
}
