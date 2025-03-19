import { Router, Response, Request, NextFunction } from 'express';
import * as statusCodes from 'readable-http-codes';
import { noteCollection } from '../../models/notes';
import {CustomRequest, authenticatedUsersOnly} from '../../middleware/authenticatedUsersOnly';
import { teacherCollection, teacherCollectionType } from '../../models/staffs';
import { studentsCollection, studentsCollectionType } from '../../models/students';
import { schoolAdminCollection, schoolAdminCollectionType } from '../../models/superAdmins';

const adminRoutes = Router({
    caseSensitive: false,
    mergeParams: true,
    // Local strict routing
    strict: false,
});

///-----------------------------------------------------------------------------------------
// campaigns/ads endpoints

adminRoutes.get("/:userType", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        type UserType = "teacher" | "student" | "admin";

        const { userType }: {userType?: UserType} = req.params;

        let profile: teacherCollectionType | studentsCollectionType | schoolAdminCollectionType | undefined | null;
        
        if(userType == "teacher")  {
            profile = await teacherCollection.findById(req.userDetails?.userId);
        } else if (userType == "student") {
            profile = await studentsCollection.findById(req.userDetails?.userId);
        } else if (userType == "admin") {
            profile = await schoolAdminCollection.findById(req.userDetails?.userId);
        } else {
            res.send({
                errorMessage: "Invalid uer type"
            });
            return;
        }

        res.send({
            profile
        });


    } catch (error) {
        next(error);
    }
});

export default adminRoutes;