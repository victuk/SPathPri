import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { subjectCollection } from "../models/subjectCollection";
import { schoolClassCollection } from "../models/classModel";
import { studentsCollection } from "../models/students";
import { read } from "fs";
import { schoolProfileCollection } from "../models/schoolProfile";
import { resultCollection, resultCollectionType } from "../models/resultModel";
import { getOrdinalSuffix } from "../utils/ordinalSuffix";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { staffsCollection } from "../models/staffs";
import { teacherAdminRemarksCollection } from "../models/teacherAdminRemarksModel";
import { studentPositionAndRemark } from "../models/positionAndRemarksModel";

export const getSchoolClasses = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.userDetails?.schoolId", req.userDetails?.schoolId);

    const schoolClass = await schoolClassCollection.find({
      schoolId: req.userDetails?.schoolId,
    });

    res.send({
      result: schoolClass,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassesBySchoolId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {schoolId} = req.params;

    const schoolClasses = await schoolClassCollection.find({
      schoolId
    });

    res.send({
      result: schoolClasses
    });

  } catch (error) {
    next(error);
  }
}

export const getSchoolClass = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const schoolClass = await schoolClassCollection.findById(id);

    res.send({
      result: schoolClass,
    });
  } catch (error) {
    next(error);
  }
};

export const createSchoolClass = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolClass }: { schoolClass: string } = req.body;

    const alreadyExist = await schoolClassCollection.findOne({
      schoolClass: schoolClass.trim(),
      schoolId: req.userDetails?.schoolId,
    });

    if (alreadyExist) {
      res.status(409).send({
        message: "Class already exists",
      });
      return;
    }

    const slug = schoolClass.toLocaleLowerCase().trim().split(" ").join("-");

    const newSchoolClass = await schoolClassCollection.create({
      schoolClass: schoolClass.trim(),
      slug,
      schoolId: req.userDetails?.schoolId,
    });

    res.send({
      result: newSchoolClass,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchoolClass = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { schoolClass }: {schoolClass: string} = req.body;

    const slug = schoolClass.toLocaleLowerCase().trim().split(" ").join("-");

    const updatedSchoolClass = await schoolClassCollection.findByIdAndUpdate(
      id,
      {
        schoolClass: schoolClass.trim(),
        slug: slug.trim(),
      },
      { new: true }
    );

    res.send({
      result: updatedSchoolClass,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchoolClass = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if(!id) {
      res.status(400).send({
        errorMessage: "Class ID can't be empty"
      });
      return;
    }

    const classStudentCount = await studentsCollection
      .find({
        classId: id,
      })
      .countDocuments();

    if (classStudentCount > 0) {
      res.status(400).send({
        message: `You can not delete this class because this class has ${classStudentCount} student${
          classStudentCount == 1 ? "" : "s"
        } in it. Kindly move students in this class to another cass before deleting.`,
      });
      return;
    }

    const deletedSchoolClass = await schoolClassCollection.findByIdAndDelete(
      id
    );

    res.send({
      result: deletedSchoolClass,
    });
  } catch (error) {
    next(error);
  }
};

export const generateResult = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { classId } = req.body;

    if(!classId) {
      res.status(400).send({
        errorMessage: "Class ID can't be empty"
      });
      return;
    }

    const studentsInClass = await studentsCollection.find({ classId, schoolId: req.userDetails?.schoolId });

    if(studentsInClass.length == 0) {
      res.status(422).send({
        message: `There are no students in this class.`
      });
      return;
    }

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    const resultRemarksAndVerdict = await teacherAdminRemarksCollection.find({schoolId: req.userDetails?.schoolId});

    const classStudentIds = studentsInClass.map((s) => s.id);

    const classAssessments = await resultCollection.find({
      studentId: classStudentIds,
      studentClass: classId,
      term: schoolDetails?.currentTerm,
      year: schoolDetails?.currentYear,
      schoolId: schoolDetails?._id,
    });

    let studentsWithScore = 0;

    for(let i = 0; i < studentsInClass.length; i++) {
      const studentSubject = classAssessments.filter(s => (s.studentId).toString() == (studentsInClass[i]._id).toString());
      if(studentSubject.length > 5) {
        studentsWithScore++;
      }
    }

    if(studentsWithScore < Math.ceil(studentsInClass.length / 2)) {
      res.status(422).send({
        message: `Out of ${studentsInClass.length} students in class, only ${studentsWithScore} student(s) has at least 5 subject's assessment. Kindly add more student's assessments to continue`
      });
      return;
    }

    const done = await generateSubjectResult(schoolDetails!!.currentTerm, schoolDetails!!.currentYear, classId, (schoolDetails!!._id).toString());
    console.log("Generated student's result", done);
    // const subjects = await subjectCollection.find({});

    const studentsAverage: any[] = [];

    for (let i = 0; i < studentsInClass.length; i++) {
      const studentsRecord = classAssessments.filter(
        (s: resultCollectionType) => s.studentId.toString() == studentsInClass[i]._id.toString()
      );

      let studentSubjectTotal = 0;

      for (let j = 0; j < studentsRecord.length; j++) {
        studentSubjectTotal += studentsRecord[j].testsAndExamTotal;
      }

      let studentSubjectAverage: number = 0;

      if (studentSubjectTotal > 0) {
        studentSubjectAverage = studentSubjectTotal / studentsRecord.length;
      }

      // console.log("studentSubjectTotal / studentsRecord.length", studentSubjectTotal, studentsRecord.length,  studentSubjectAverage);

      const resultRemark = resultRemarksAndVerdict.find(r => studentSubjectAverage >= r?.minimum && studentSubjectAverage <= r?.maximum);

      // console.log("Result remark", resultRemark);

      studentsAverage.push({
        studentId: studentsInClass[i].id,
        studentClass: classId,
        openingDate: schoolDetails?.openingDate,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear,
        schoolId: schoolDetails?._id,
        studentSubjectAverage,
        studentSubjectTotal,
        classTeacherRemark: resultRemark?.classTeachersRemark,
        principalsRemark: resultRemark?.principalsRemark,
        verdict: resultRemark?.verdict,
        includeWeakSubjects: resultRemark?.includeImprovementSubjects
      });
    }

    // for (let i = 0; i < subjects.length; i++) {
    //   const studentOffersSubject = classAssessments.filter(
    //     (s) => s.subjectId.toString() == subjects[i].id
    //   );

    //   // if (studentOffersSubject.length > 0) {
    //   // }
    // }

    const sortedAverage = studentsAverage.sort(
      (a, b) => b.studentSubjectAverage - a.studentSubjectAverage
    );

    let updatedStudentAverage: any = [];

    let position = 1;

    let firstPosition = sortedAverage[0];
    firstPosition.position = getOrdinalSuffix(position);
    firstPosition.positionWithoutOrdinal = position;
    updatedStudentAverage.push(firstPosition);

    for (let i = 1; i < sortedAverage.length; i++) {
      if(sortedAverage[i].studentSubjectAverage == sortedAverage[i - 1].studentSubjectAverage) {
        sortedAverage[i].position = getOrdinalSuffix(position);
        sortedAverage[i].positionWithoutOrdinal = position;
      } else {
        position += 1;
        sortedAverage[i].position = getOrdinalSuffix(position);
        sortedAverage[i].positionWithoutOrdinal = position;
      }
    }

    // const resultsAlreadyGenerated =
    //   await classPositionAndRemarksCollection.find({
    //     studentClass: classId,
    //     term: schoolDetails?.currentTerm,
    //     year: schoolDetails?.currentYear,
    //     schoolId: schoolDetails?._id,
    //   });

    await classPositionAndRemarksCollection.deleteMany({
      studentClass: classId,
      term: schoolDetails?.currentTerm,
      year: schoolDetails?.currentYear,
      schoolId: schoolDetails?._id,
    });

    // for (let i = 0; i < resultsAlreadyGenerated.length; i++) {
    //   for (let j = 0; j < studentsAverage.length; j++) {
    //     if (
    //       studentsAverage[j].studentId ==
    //       resultsAlreadyGenerated[i].studentId.toString()
    //     ) {
    //       studentsAverage[j].classTeacherRemark =
    //         resultsAlreadyGenerated[i].classTeacherRemark;
    //       studentsAverage[j].principalsRemark =
    //         resultsAlreadyGenerated[i].principalsRemark;
    //     }
    //   }
    // }

    // console.log("studentsAverage", studentsAverage);

    await classPositionAndRemarksCollection.create(sortedAverage);

    res.send({
      message: `Result created for class with ID ${classId}`,
      result: classId,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSubjectResult = async (term: string, year: string, classId: string, schoolId: string) => {
  try {
    const subjects = await subjectCollection.find({});
    const classAssessments = await resultCollection.find({
      studentClass: classId,
      term,
      year,
      schoolId,
    });

    for(let i = 0; i < subjects.length; i++) {
      classAssessments.filter((c) => (c?.subjectId).toString() == (subjects[i]?._id).toString()).sort((a, b) => {
        const studentA = a.testOne + a.testTwo + a.testThree + a.examScore;
        const studentB = b.testOne + b.testTwo + b.testThree + b.examScore;
        return studentB - studentA;
      }).forEach(async (student, index) => {
        await resultCollection.findByIdAndUpdate(student._id, {
          subjectPosition: getOrdinalSuffix(index + 1)
        });
      });
    }

    return {
      message: "Student test generated"
    };

  } catch (error) {
    throw new Error("An error ocurred while tring to generate subject results");
  }
}

export const refreshStudentsClassSubjects = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.body;

    const studentDetails = await studentsCollection.findById(studentId);

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    const subjects = await subjectCollection.find({
      tracks: { $in: studentDetails?.studentTrack },
    });

    const studentSubjects = await resultCollection.find({
      studentId,
      studentClass: studentDetails?.classId,
      year: schoolDetails?.currentYear,
      term: schoolDetails?.currentTerm,
    });

    const newSubjectsToCreate: any[] = [];

    for (let i = 0; i < subjects.length; i++) {
      const subjectAlreadyExist = studentSubjects.find(
        (s) =>
          s.studentId.toString() == studentId &&
          s.subjectId.toString() == subjects[i].id
      );

      if (!subjectAlreadyExist) {
        newSubjectsToCreate.push({
          studentId,
          subjectId: subjects[i]._id,
          studentClass: studentDetails?.classId,
          year: schoolDetails?.currentYear,
          term: schoolDetails?.currentTerm,
        });
      }
    }

    await resultCollection.create(newSubjectsToCreate);

    res.send({
      message: "Class refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getOneStudentResult = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.body;

    let s: string; // The student id if it's a student trying to check his/her result.

    if (req.userDetails?.role == "student") {
      s = req.userDetails.userId;
    } else {
      s = studentId;
    }

    const studentDetails = await studentsCollection.findById(s);

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    const result = await classPositionAndRemarksCollection.findOne({
      studentId: s,
      studentClass: studentDetails?.classId,
      year: schoolDetails?.currentYear,
      term: schoolDetails?.currentTerm,
    });

    res.send({
      result,
      schoolDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultRemark = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { classId } = req.params;

    let result: any;

    const schoolDetails = await schoolProfileCollection.findById(req.userDetails?.schoolId);

    const selectValue = "firstName surname otherNames gender studentUid profilePic";

    if (req.userDetails?.role == "admin" || req.userDetails?.role == "super-admin") {

        if(!classId) {
            res.status(400).send({
                message: "Kindly choose a class to fetch results for."
            });
            return;
        }

      result = await classPositionAndRemarksCollection.find({
        studentClass: classId,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear
      }).populate("studentId", selectValue).populate("studentClass").sort("studentId.firstName");
    } else if (req.userDetails?.role == "teacher") {
      const teacherProfile = await staffsCollection.findById(
        req.userDetails.userId
      );

      if (!teacherProfile?.classTeacherOf) {
        res.status(400).send({
          message: "You are not assigned any class to manage",
        });
        return;
      }

      result = await classPositionAndRemarksCollection.find({
        studentClass: teacherProfile?.classTeacherOf,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear
      }).populate("studentId", selectValue).populate("studentClass");
    }

    res.send({
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResultRemark = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { positionId } = req.params;

    const { remark } = req.body;

    var updatedPrincipalsRemark: any;

    if (req.userDetails?.role == "admin" || req.userDetails?.role == "super-admin") {
      updatedPrincipalsRemark = await classPositionAndRemarksCollection.findByIdAndUpdate(positionId, {
        principalsRemark: remark,
      }, {new: true});
    } else if (req.userDetails?.role == "teacher") {
      updatedPrincipalsRemark = await classPositionAndRemarksCollection.findByIdAndUpdate(positionId, {
        classTeacherRemark: remark,
      }, {new: true});
    }

    res.send({
      message: "Remark updated successfully",
      result: updatedPrincipalsRemark
    });
  } catch (error) {
    next(error);
  }
};

export const promoteToClassV2 = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {studentsToPromote, newClass, verdict} = req.body;

    console.log(req.body);

    const resultIds = studentsToPromote.map((s: any) => s.resultId);

    const studentIds = studentsToPromote.map((s: any) => s.studentId);

    const anyFailedStudent = await classPositionAndRemarksCollection.find({
      _id: {$in: resultIds},
      verdict: "fail",
      schoolId: req.userDetails?.schoolId
    });

    if(anyFailedStudent.length > 0) {
      res.status(400).send({
        message: `Your promotion list contains ${anyFailedStudent.length} students that have failed, kindly remove all failed students from the list`
      });
      return;
    }

    console.log("all students", await studentsCollection.find({_id: {$in: studentIds}, schoolId: req.userDetails?.schoolId}));

    await studentsCollection.updateMany({_id: {$in: studentIds}, schoolId: req.userDetails?.schoolId}, {
      classId: newClass
    });

    await classPositionAndRemarksCollection.updateMany({
      _id: {$in: resultIds},
      schoolId: req.userDetails?.schoolId
    }, {
      verdict
    });

    res.send({
      message: "Students promoted successfully"
    });


  } catch (error) {
    next(error);
  }
}

export const refreshStudentTotalAndAverageV2 = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      resultId, studentId, studentClass, term, year
    } = req.body;

    const results = await resultCollection.find({
      studentId, studentClass, term, year
    });

    let total = 0;

    let average = 0;

    for(let i = 0; i < results.length; i++) {
      total += total + results[i].testsAndExamTotal;
    }

    average = total / results.length;

    const updatedTotalAndAverage = await studentPositionAndRemark.findByIdAndUpdate(resultId, {
      totalSubjectScores: total,
      studentAverage: average,
      numberOfSubjectsOffered: results.length
    }, {new: true});

    res.send({
      message: "Student's total and average refreshed",
      result: updatedTotalAndAverage
    });

  } catch (error) {
    next(error);
  }
}

