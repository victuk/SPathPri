import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { usersDB } from "../../models/usersModel";

async function totalStudentsPerClass(req: CustomRequest, res: Response, next: NextFunction) {

    let summary: any = {};

    // const jsStudents = await usersDB.countDocuments({});

    for(let i = 1; i <= 3; i++) {
        const theCount = `js${i}Count`;
        summary[theCount] = await usersDB.find({studentClass: `js${i}`, role: "student", admitted: true}).count();
    }

    for(let i = 1; i <= 3; i++) {
        const theCount = `ss${i}Count`;
        summary[theCount] = await usersDB.find({studentClass: `ss${i}`, role: "student", admitted: true}).count();
    }
    res.json({ summary });
}

export { totalStudentsPerClass };
