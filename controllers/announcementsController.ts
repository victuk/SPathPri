import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { announcementCollection } from '../models/announcementModel';
import { staffsCollection } from '../models/staffs';
import { studentsCollection } from '../models/students';

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

export {
    announcements,
    announcement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};
