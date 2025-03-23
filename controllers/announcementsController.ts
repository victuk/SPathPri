import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { announcementCollection } from '../models/announcementModel';
import { staffsCollection, staffsCollectionType } from '../models/staffs';
import { studentsCollection, studentsCollectionType } from '../models/students';
import { sendEmail } from '../utils/emailUtilities';
import { sendTextMessages } from '../utils/sendTextUtil';

async function announcements(req: CustomRequest, res: Response, next: NextFunction) {

    let allGeneralAnnouncements: any;

    let userDetails: any;

    if(req.userDetails?.role == "student") {
        userDetails = await studentsCollection.findById(req.userDetails.userId);
    } else {
        userDetails = await staffsCollection.findById(req.userDetails?.userId);
    }

    if(req.userDetails!!.role == "admin") {
        allGeneralAnnouncements = await announcementCollection.paginate({schoolId: userDetails?.schoolId}, {
            populate: "postedBy",
            page: req.params.page ? parseInt(req.params.page) : 1,
            limit: req.params.limit ? parseInt(req.params.limit) : 10,
            sort: {createdAt: -1}
        });
    } else {
        console.log(userDetails);
        allGeneralAnnouncements = await announcementCollection.paginate({
            audienceType: {
                $in: req.userDetails!!.role,
            },
            schoolId: userDetails?.schoolId
        }, {
            populate: "postedBy",
            page: req.params.page ? parseInt(req.params.page) : 1,
            limit: req.params.limit ? parseInt(req.params.limit) : 10,
            sort: {createdAt: -1}
        });
    }

    

    res.json({
        result: allGeneralAnnouncements
    });
}

async function announcement(req: CustomRequest, res: Response, next: NextFunction) {
    const ann = await announcementCollection.findById(req.params.id).populate("postedBy");

    res.json({
        result: ann
    });
}

async function createAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {
    try {

        
        const {
            announcementTitle,
            announcement,
            showTill,
            audienceType
        } = req.body;

        // type AudienceType = "parent" | "teacher" | "student" | "admin" | "record-keeper";

        const staffDetails = await staffsCollection.findById(req.userDetails?.userId);

        if(!staffDetails?.schoolId) {
            res.send({
                message: "Not paired with a school"
            });
            return;
        }

        const newAnnouncement = await announcementCollection.create({
            postedBy: req.userDetails?.userId,
            announcementTitle,
            announcement,
            showTill,
            audienceType,
            schoolId: staffDetails?.schoolId
        });

        const allRecepient = [];
        
        let staffsToSendMessagesTo: staffsCollectionType[] = [];
        let studentsToSendMessagesTo: studentsCollectionType[] = [];
        
        if(audienceType.includes("admin") | audienceType.includes("record-keeper") | audienceType.includes("teacher")) {
            staffsToSendMessagesTo = await staffsCollection.find({role: {$in: audienceType}});
            for(let i = 0; i < staffsToSendMessagesTo.length; i++) {
                allRecepient.push({
                    email: staffsToSendMessagesTo[i].email,
                    phoneNumber: staffsToSendMessagesTo[i].phoneNumber
                });
            }
        }
        
        if(audienceType.includes("student") | audienceType.includes("parent")) {
            studentsToSendMessagesTo = await studentsCollection.find({});
            if(audienceType.includes("student")) {
                for(let i = 0; i < studentsToSendMessagesTo.length; i++) {
                    allRecepient.push({
                        email: studentsToSendMessagesTo[i].email,
                        phoneNumber: studentsToSendMessagesTo[i].phoneNumber
                    });
                }
            }

            if(audienceType.includes("parent")) {
                for(let i = 0; i < studentsToSendMessagesTo.length; i++) {
                    allRecepient.push({
                        email: studentsToSendMessagesTo[i].parentEmail,
                        phoneNumber: studentsToSendMessagesTo[i].parentPhoneNumber
                    });
                }
            }

        }
        
            await sendEmail({
                to: allRecepient.filter(e => e.email != null).map(e => e.email) as string[],
                subject: announcementTitle,
                body: announcement
            });
       
            const phoneNumbers = allRecepient.filter(e => e.phoneNumber != null).map(e => e.phoneNumber) as string[];
            await sendTextMessages(phoneNumbers, announcement);
        

        res.send({
            message: "Announcement uploaded successfully",
            result: newAnnouncement
        });

    } catch (error) {
        next(error);
    }
}

async function updateAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {
    try {

        const {
            announcementTitle,
            announcement,
            showTill,
            announcementStatus,
            audienceType
        } = req.body;

        const updatedAnnouncement = await announcementCollection.findByIdAndUpdate(req.params.id, {
            postedBy: req.body.userDetails,
            announcementTitle,
            announcement,
            showTill,
            announcementStatus,
            audienceType
        }, {new: true});

        res.send({
            message: "Announcement updated successfully",
            result: updatedAnnouncement
        });

    } catch (error) {
        next(error);
    }
}

async function deleteAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        
        const deletedAnnouncement = await announcementCollection.findById(req.params.id);

        res.send({
            message: "Announcement deleted successfully",
            result: deletedAnnouncement
        });

    } catch (error) {
        next(error);
    }
}

const superAdminAnnouncement = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {
            title,
            message,
            sendAsEmail,
            sendAsText,
            sendToStaff,
            sendToStudents,
            sendToParents
        } = req.body;

        
        const allRecepient = [];
        
        let staffsToSendMessagesTo: staffsCollectionType[] = [];
        let studentsToSendMessagesTo: studentsCollectionType[] = [];
        
        if(sendToStaff) {
            staffsToSendMessagesTo = await staffsCollection.find({});
            for(let i = 0; i < staffsToSendMessagesTo.length; i++) {
                allRecepient.push({
                    email: staffsToSendMessagesTo[i].email,
                    phoneNumber: staffsToSendMessagesTo[i].phoneNumber
                });
            }
        }
        
        if(sendToStudents || sendToParents) {
            studentsToSendMessagesTo = await studentsCollection.find({});
            if(sendToStudents) {
                for(let i = 0; i < studentsToSendMessagesTo.length; i++) {
                    allRecepient.push({
                        email: studentsToSendMessagesTo[i].email,
                        phoneNumber: studentsToSendMessagesTo[i].phoneNumber
                    });
                }
            }

            if(sendToParents) {
                for(let i = 0; i < studentsToSendMessagesTo.length; i++) {
                    allRecepient.push({
                        email: studentsToSendMessagesTo[i].parentEmail,
                        phoneNumber: studentsToSendMessagesTo[i].parentPhoneNumber
                    });
                }
            }

        }
        
        
        if(sendAsEmail) {
            await sendEmail({
                to: allRecepient.filter(e => e.email != null).map(e => e.email) as string[],
                subject: title,
                body: message
            });
        }

        if(sendAsText) {
            const phoneNumbers = allRecepient.filter(e => e.phoneNumber != null).map(e => e.phoneNumber) as string[];
            await sendTextMessages(phoneNumbers, message);
        }
        
        res.send({
            result: "Emails and text sent."
        });

    } catch (error) {
        next(error);
    }
}

export {
    announcements,
    announcement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    superAdminAnnouncement
};
