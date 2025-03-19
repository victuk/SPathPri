import { NextFunction, Response } from 'express';
import { CustomRequest } from '../../middleware/authenticatedUsersOnly';
import { usersDB } from '../../models/usersModel';
import { teacherCollection } from '../../models/staffs';
import { schoolClassCollection } from '../../models/schoolClasses';
import { schoolSubjectCollection } from '../../models/officialSchoolSubjects';

async function getTeacherProfile(req: CustomRequest, res: Response, next: NextFunction) {
    const teacherID = req.userDetails?.userId;

    const teacher = await teacherCollection.findById(teacherID, '-password');

    if(!teacher) {
        res.status(404).send({
            errorMessage: "Teacher not found"
        });
        return;
    }

    const response: any = {};

    if(teacher!!.classTeacherOf.length > 0) {
        response.classTeacherOf = await schoolClassCollection.find({_id: {$in: teacher?.classTeacherOf}});
    }

    if(teacher!!.subjectTeacherOf.length > 0) {
        response.subjectTeacherOf = await schoolSubjectCollection.find({_id: {$in: response.subjectTeacherOf}});
    }

    response.teacherDetails = teacher;

    res.json(response);
}

export {
    getTeacherProfile
};
