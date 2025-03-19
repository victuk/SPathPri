import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { studentsCollection } from "../../models/students";
import { teacherCollection } from "../../models/staffs";
import { schoolAdminCollection } from "../../models/superAdmins";
import statusCodes from "readable-http-codes";

interface UserType {
    userType?: "owner" | "admin" | "recordsofficer" | "customercare" | "teacher" | "student"

};

async function searchUser (req: CustomRequest, res: Response, next: NextFunction) {
    try {

        
        const {userType}: UserType = req.params;

        const {searchKeyword, byClassAndCategory, classTeacherOf, subjectTeacherOf} = req.body;

        let details: any;

        if(userType == "student") {

            const query: any = {};

            if(searchKeyword) {
                query.$or = [
                    {firstName: {$regex: new RegExp(searchKeyword, "i")}},
                    {otherNames: {$regex: new RegExp(searchKeyword, "i")}},
                    {surname: {$regex: new RegExp(searchKeyword, "i")}},
                    {email: {$regex: new RegExp(searchKeyword, "i")}},
                    {phoneNumber: {$regex: new RegExp(searchKeyword, "i")}}
                ]
            }

            if(byClassAndCategory) {
                query.studentClassAndCategory = byClassAndCategory;
            }


            details = await studentsCollection.find(query);

        } else if(userType == "teacher") {

            const query: any = {};

            if(searchKeyword) {
                query.$or = [
                    {firstName: {$regex: new RegExp(searchKeyword, "i")}},
                    {otherNames: {$regex: new RegExp(searchKeyword, "i")}},
                    {surname: {$regex: new RegExp(searchKeyword, "i")}},
                    {email: {$regex: new RegExp(searchKeyword, "i")}},
                    {phoneNumber: {$regex: new RegExp(searchKeyword, "i")}}
                ]
            }

            if(classTeacherOf) {
                query.classTeacherOf = classTeacherOf;
            }

            if(subjectTeacherOf) {
                query.subjectTeacherOf = subjectTeacherOf;
            }

            details = await teacherCollection.find(query);
        } else {

            if(req.userDetails?.role == "student") {
                res.status(statusCodes.FORBIDDEN).send({
                    errorMessage: "You are forbidden from taking this action."
                });
            }

            const query: any = {};

            if(searchKeyword) {
                query.$or = [
                    {firstName: {$regex: new RegExp(searchKeyword, "i")}},
                    {otherNames: {$regex: new RegExp(searchKeyword, "i")}},
                    {surname: {$regex: new RegExp(searchKeyword, "i")}},
                    {email: {$regex: new RegExp(searchKeyword, "i")}},
                    {phoneNumber: {$regex: new RegExp(searchKeyword, "i")}}
                ]
            }

            query.role = userType;

            details = await schoolAdminCollection.find(query);
        }

        if (details.length == 0) {
            res.status(404).send({
                message: `No user with the keyword ${searchKeyword} found`,
                details: []
            });
            return;
        }

        res.send({
            message: "Search result",
            details
        });

    } catch (error) {
        next(error);
    }
}