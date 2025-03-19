import bcrypt from "bcryptjs";
import { result } from "../../models/resultModel";
import { usersDB } from "../../models/usersModel";
import { settings } from "../../models/settingsModel";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";


async function uploadRecords(req: CustomRequest, res: Response, next: NextFunction) {
    const {records, studentsClass, teacherID, subject} = req.body;

    const termdetails = await settings.find();
    const currentTerm = termdetails[0].currentTerm;
    const currentYear = termdetails[0].currentYear;



    console.log(studentsClass);

    for(let i = 0; i < records.length; i++) {
        let r = records[i].split(",");
        let adNum = r[0];
        let testone = r[1];
        let testtwo = r[2];
        let testthree = r[3];
        let exam = r[4];

        console.log(adNum, testone, testtwo, testthree, exam);

        const student = await usersDB.findOne({admissionNumber: adNum, role: "student", studentClass: studentsClass, suspended: false, emailVerified: true});
        const teacher = await usersDB.findById(teacherID);

        if(!student || !teacher) {
            console.log("No teacher or student");
        } else {

            const record = await result.findOne({
                studentID: student._id,
                teacherID: teacher._id,
                subject,
                term: currentTerm,
                studentClass: studentsClass,
                year: currentYear
            });

            if(!record) {
                await result.create({
                    testOne: testone,
                    testTwo: testtwo,
                    testThree: testthree,
                    examScore: exam,
                    studentID: student._id,
                    teacherID: teacher._id,
                    subject,
                    term: currentTerm,
                    studentClass: studentsClass,
                    year: currentYear
                });
            } else {
                await result.findOneAndUpdate({
                    studentID: student._id,
                    teacherID: teacher._id,
                    subject,
                    term: currentTerm,
                    studentClass: studentsClass,
                    year: currentYear
                }, {
                    testOne: testone,
                    testTwo: testtwo,
                    testThree: testthree,
                    examScore: exam,
                });
            }
            
        }
    }


    res.json({message: "Uploaded Successfully."});
}

async function loadTeachers(req: CustomRequest, res: Response, next: NextFunction) {
    const teachers = await usersDB.find({role: "teacher", suspended: false});
    res.json({teachers});
}

async function viewRecordsByClass(req: CustomRequest, res: Response, next: NextFunction) {
    const {choosenClass} = req.params;

    const termdetails = await settings.find();
    const currentTerm = termdetails[0].currentTerm;
    const currentYear = termdetails[0].currentYear;

    console.log("This ran");

    const results = await result.find({
        studentClass: choosenClass,
        term: currentTerm,
        year: currentYear
    });

    let s = [];

    let withStudentDetails = results.map(async (r) => {
        r.studentDetail = await usersDB.findById(r.studentID);
        return r;
    });

    for (let r of results) {
        let studentDetail = await usersDB.findById(r.studentID, "surName firstName otherNames gender");
        s.push({studentDetail, result: r });
    }

    console.log(s);

    res.json({results: s});
    
}

async function changeRecordKeeperDetails(req: CustomRequest, res: Response, next: NextFunction) {
    const {
        email,
        password,
        newPassword
    } = req.body;

    const recordkeeper = await usersDB.findOne({email, role: "recordkeeper"});

    const passwordsMatch = bcrypt.compareSync(password, recordkeeper.password);

    if(passwordsMatch) {

        const salt = bcrypt.genSaltSync(10);
        const hashedPw = bcrypt.hashSync(newPassword, salt);

        await usersDB.findOneAndUpdate({email, role: "recordkeeper"}, {
            password: hashedPw
        });
        res.json({message: "Successful!"});
    } else {
        res.status(400).json({message: "Not succesful"});
    }
}

export {
    uploadRecords,
    viewRecordsByClass,
    loadTeachers,
    changeRecordKeeperDetails
}
