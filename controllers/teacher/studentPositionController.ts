import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";

import { usersDB } from "../../models/usersModel";
import { studentPositionAndRemark } from "../../models/positionAndRemarksModel";
import { result } from "../../models/resultModel";

async function getStudentsPosition(req: CustomRequest, res: Response, next: NextFunction) {
    const { year, term } = req.headers;

  const teacherID = req.userDetails?.userId;

  let detail = [];

  const teacherClass = await usersDB.findOne({
      _id: teacherID, role: "teacher"
  });

  let classStudents = await usersDB.find({
    studentClass: teacherClass.classTeacherOf,
  });

  for(let student of classStudents) {
    let positionResponse = await studentPositionAndRemark.findOne({
        studentID: student._id,
        year,
        studentClass: teacherClass.classTeacherOf,
        term
    });

    console.log(student._id);
    console.log(teacherClass.classTeacherOf);
    console.log(year);
    console.log(term);

    if(!positionResponse) {
        let newP: any = {};

        newP.firstName = student.firstName;
        newP.surName = student.surName;
        newP.otherNames = student.otherNames;
        newP.gender = student.gender;
        newP.position = "Not set";
        newP.mode = "create";
        newP.studentID = student._id;
        newP.studentClass = student.studentClass;
        newP.recordID = "none";

        detail.push(newP);
    } else {
        let studentP: any = {};

        studentP.firstName = student.firstName;
        studentP.surName = student.surName;
        studentP.otherNames = student.otherNames;
        studentP.gender = student.gender;
        studentP.position = positionResponse.position;
        studentP.mode = "update";
        studentP.studentID = student._id;
        studentP.studentClass = student.studentClass;
        studentP.recordID = positionResponse._id;

        detail.push(studentP);
    }
  }

  res.json({
    positions: detail
  });
}

async function editPosition(req: CustomRequest, res: Response, next: NextFunction) {
    const {
        studentID,
        recordID,
        recordMode,
        newPosition,
        studentClass,
        year,
        term
    } = req.body;

    const teacherID = req.userDetails?.userId;

    if(recordMode == "create") {
        const newRecord = await studentPositionAndRemark.create({
            studentID,
            classTeacher: teacherID,
            studentClass,
            year,
            position: newPosition,
            term
        });

        res.send(newRecord);

    } else if (recordMode == "update") {
        const updatedRecord = await studentPositionAndRemark.findByIdAndUpdate(recordID, {
            studentID,
            classTeacher: teacherID,
            studentClass,
            year,
            position: newPosition,
            term
        });

        res.send(updatedRecord);
    }

}

async function refreshStudentsResult(req: CustomRequest, res: Response, next: NextFunction) {
    const teacherID = req.userDetails?.userId;
    const { year, term } = req.headers;

    let studentsResult: any = [];

    const teacherClass = await usersDB.findOne({
        _id: teacherID, role: "teacher"
    });
  
    let classStudents = await usersDB.find({
      studentClass: teacherClass.classTeacherOf,
    });

    let position = 1;

    for(let student of classStudents) {
        // let positionResponse = await studentPositionAndRemark.findOne({
        //     studentID: student._id,
        //     year,
        //     studentClass: teacherClass.classTeacherOf,
        //     term
        // });

        let studentGrandTotal = 0;
        let studentGrandAverage = 0;

        const studentSubjects = await result.find({
            studentID: student._id,
            studentClass: teacherClass.classTeacherOf,
            term, year
        });

        let studentsTotalSubjects = studentSubjects.length;

        // console.log(studentsTotalSubjects);

        for(let i = 0; i < studentSubjects.length; i++) {
            studentGrandTotal += studentSubjects[i].testsAndExamTotal;
        }

        studentGrandAverage = studentGrandTotal/studentsTotalSubjects;

        studentsResult.push({
            student,
            studentGrandTotal,
            studentGrandAverage: studentsTotalSubjects != 0 ? studentGrandAverage : 0,
            studentsTotalSubjects
        });

    }

    studentsResult = studentsResult.filter((result: any) => {
        return result.studentGrandAverage != 0 && result.studentGrandTotal != 0 && result.studentsTotalSubjects != 0;
    });

    studentsResult.sort(function(a: any, b: any) {
        return b.studentGrandAverage - a.studentGrandAverage;
    });

    for(let i = 1; i < studentsResult.length; i++) {
        if(studentsResult[i].studentGrandAverage == studentsResult[i - 1].studentGrandAverage) {
            studentsResult[i - 1].position = position;
        } else {
            studentsResult[i - 1].position = position;
            position++;
        }

        if(i == studentsResult.length - 1) {
            if(studentsResult[i].studentGrandAverage == studentsResult[i - 1].studentGrandAverage) {
                studentsResult[i].position = position;
            } else {
                studentsResult[i].position = position;
            }
        }

    }

    for(let i = 0; i < studentsResult.length; i++) {
        await studentPositionAndRemark.findOneAndUpdate({
            studentID: studentsResult[i].student._id,
            studentClass: teacherClass.classTeacherOf,
            term, year
        },
            {
                position:  studentsResult[i].position,
                studentAverage: studentsResult[i].studentGrandAverage,
                classTeacher: teacherClass._id,
                numberOfSubjectsOffered: studentsResult[i].studentsTotalSubjects,
                totalSubjectScores: studentsResult[i].studentGrandTotal
            },
        {
            upsert: true,
            setDefaultsOnInsert: true
        });
    }

    const allResult = await studentPositionAndRemark.find({
        studentClass: teacherClass.classTeacherOf,
            term, year
    }).pop;

    console.log(allResult);
    res.send(allResult);

}

export {
    getStudentsPosition,
    editPosition,
    refreshStudentsResult
};
