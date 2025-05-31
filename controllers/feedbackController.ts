import { Response, NextFunction } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { v4 } from "uuid";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { sendEmail } from "../utils/emailUtilities";
import { schoolProfileCollection } from "../models/schoolProfile";
import mongoose from "mongoose";
import { feedbackCollection } from "../models/feedbackModel";
import { staffsCollection } from "../models/staffs";
import Joi from "joi";


export const getSubmittedFeedbacks = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {

        const {page, limit} = req.params;

        let feedbacks = await feedbackCollection.paginate({
            userId: req.userDetails?.userId,
            schoolId: req.userDetails?.schoolId
        }, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            sort: {createdAt: -1}
        });

        res.send({
            result: feedbacks
        });
        
    } catch (error) {
        next(error);
    }
  }

export const getOthersFeedbacks = async(
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        
        let feedback: any;

        const {page, limit} = req.params;

        if(req.userDetails?.role == "admin") {
            feedback = await feedbackCollection.paginate({
                ticketAddressedTo: "school-admin"
            }, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sort: {createdAt: -1}
            });
        } else if (req.userDetails?.role == "super-admin") {
            feedback = await feedbackCollection.paginate({
                ticketAddressedTo: "solvpath"
            }, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sort: {createdAt: -1}
            });
        }

        res.send({
            result: feedback
        });

    } catch (error) {
        next(error);
    }
}

export const createFeedback = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        
        const {
            secondEmail,
            ticketAddressedTo,
            feedbackType,
            title,
            feedback,
        } = req.body;

        if(!secondEmail) {
            delete req.body.secondEmail;
        }

        const {error} = Joi.object({
            secondEmail: Joi.string().email({tlds: {allow: false}}).optional().messages({
                "string.email": "Kindly enter a valid email address"
            }),
            ticketAddressedTo: Joi.string().valid("school-admin", "solvpath").required().messages({
                "string.valid": "You can adress your feedback to either 'school-admin', 'solvpath'",
                "any.required": "Ticket addressed to is required"
            }),
            feedbackType: Joi.string().valid("feedback", "complaint", "others").required().messages({
                "string.valid": "Your feedback type can be either 'feedback', 'complaint', 'others'",
                "any.required": "Feedback type is required"
            }),
            title: Joi.string().min(5).required().messages({
                "string.min": "Fedback title is too short",
                "any.required": "Feedback title is required"
            }),
            feedback: Joi.string().min(10).required().messages({
                "string.min": "Feedback is too short",
                "any.required": "Feedback detail is required"
            })
        }).validate(req.body);

        if(error) {
            res.status(400).send({
                errorMessage: error.message
            });
            return;
        }

        let user: any;

        if(!user) {
            res.status(404).send({
                errorMessage: "No user found. It seems you're not logged in."
            });
        }

        if(req.userDetails?.role == "student") {
            user = await studentsCollection.findById(req.userDetails?.userId);
        } else {
            user = await staffsCollection.findById(req.userDetails?.userId);
        }

        await feedbackCollection.create({
            fullName: `${user?.firstName} ${user?.otherNames} ${user?.surname}`,
            userType: req.userDetails?.role,
            userId: req.userDetails?.userId,
            email: user?.email,
            secondEmail,
            ticketAddressedTo,
            feedbackType,
            title,
            feedback,
            schoolId: req.userDetails?.schoolId
        });

        res.send({
            result: "Ticket submitted successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const viewFeedback = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        
        const {id} = req.params;

        const feedback = await feedbackCollection.findById(id).populate("schoolId");

        res.send({
            result: feedback
        });

    } catch (error) {
        next(error);
    }
}

export const changeFeedbackTicketStatus = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const {id} = req.params;

        const {status} = req.body;
        
        const feedbackDetails = await feedbackCollection.findById(id);

        if(!feedbackDetails) {
            res.status(404).send({
                message: "Feedback not found"
            });
        }

        let updatedFeedback: any;

        if(req.userDetails?.role == "admin" && feedbackDetails?.ticketAddressedTo == "school-admin") {
            updatedFeedback = await feedbackCollection.findByIdAndUpdate(id, {
                ticketStatus: status
            }, {new: true});
        } else if(req.userDetails?.role == "super-admin" && feedbackDetails?.ticketAddressedTo == "solvpath") {
            updatedFeedback = await feedbackCollection.findByIdAndUpdate(id, {
                ticketStatus: status
            }, {new: true});
        }

        console.log("updatedFeedback", updatedFeedback);

        res.send({
            result: updatedFeedback
        });

    } catch (error) {
        next(error);
    }
}

export const reopenFeedbackTicket = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        
        const {id} = req.params;

        const feedback = await feedbackCollection.findByIdAndUpdate(id, {
            ticketStatus: "re-opened"
        }, {new: true}); 

        res.send({
            result: feedback
        });

    } catch (error) {
        next(error);
    }
}