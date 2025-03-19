import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { usersDB } from "../../models/usersModel";
import { studentsCollection } from "../../models/students";

async function getStudentProfile(req: CustomRequest, res: Response, next: NextFunction) {
    const studentID = req.userDetails?.userId;

    const studentDetails = await usersDB.findById(studentID, '-password');

    res.json({
        studentDetails
    });
}

async function updateStudentProfile(req: CustomRequest, res: Response, next: NextFunction) {
    const studentId = req.userDetails?.userId;

    const {
        firstName,
        otherNames,
        surname,
        profilePic,
        status
    } = req.body;

    const updatedUserDetails = await studentsCollection.findByIdAndUpdate(studentId, {
        firstName,
        otherNames,
        surname,
        profilePic,
        status
    }, {new: true});

    res.json({
        updatedUserDetails
    });
}

export {
    getStudentProfile,
    updateStudentProfile
};