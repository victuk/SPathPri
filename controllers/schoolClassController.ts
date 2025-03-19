import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { subjectCollection } from "../models/subjectCollection";
import { schoolClassCollection } from "../models/classModel";
import { studentsCollection } from "../models/students";
import { read } from "fs";
import { schoolProfileCollection } from "../models/schoolProfile";
import { resultCollection } from "../models/resultModel";
import { getOrdinalSuffix } from "../utils/ordinalSuffix";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { staffsCollection } from "../models/staffs";

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
      schoolClass,
      schoolId: req.userDetails?.schoolId,
    });

    if (alreadyExist) {
      res.status(409).send({
        message: "Class already exists",
      });
      return;
    }

    const slug = schoolClass.toLocaleLowerCase().split(" ").join("-");

    const newSchoolClass = await schoolClassCollection.create({
      schoolClass,
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

    const { schoolClass } = req.body;

    const slug = schoolClass.toLocaleLowerCase().split(" ").join("-");

    const updatedSchoolClass = await schoolClassCollection.findByIdAndUpdate(
      id,
      {
        schoolClass,
        slug,
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

    const classStudentCount = await studentsCollection
      .find({
        classId: id,
      })
      .countDocuments();

    if (classStudentCount > 0) {
      res.status(400).send({
        message: `You can not delete this class because this class has ${classStudentCount} student${
          classStudentCount == 1 ? "" : "s"
        } in it`,
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

    const studentsInClass = await studentsCollection.find({ classId });

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    const classStudentIds = studentsInClass.map((s) => s.id);

    const classAssessments = await resultCollection.find({
      studentId: classStudentIds,
      studentClass: classId,
      term: schoolDetails?.currentTerm,
      year: schoolDetails?.currentYear,
      schoolId: schoolDetails?._id,
    });

    const subjects = await subjectCollection.find({});

    const studentsAverage: any[] = [];

    for (let i = 0; i < studentsInClass.length; i++) {
      const studentsRecord = classAssessments.filter(
        (s) => s.studentId.toString() == studentsInClass[i]._id.toString()
      );

      let studentSubjectTotal = 0;

      for (let j = 0; j < studentsRecord.length; j++) {
        studentSubjectTotal += studentsRecord[j].testsAndExamTotal;
      }

      let studentSubjectAverage: number = 0;

      if (studentSubjectTotal > 0) {
        studentSubjectAverage = studentSubjectTotal / studentsRecord.length;
      }

      studentsAverage.push({
        studentId: studentsInClass[i].id,
        studentClass: classId,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear,
        schoolId: schoolDetails?._id,
        studentSubjectAverage,
        studentSubjectTotal,
        verdict: studentSubjectAverage > 60 ? "pass" : "fail",
      });
    }

    for (let i = 0; i < subjects.length; i++) {
      const studentOffersSubject = classAssessments.filter(
        (s) => s.subjectId.toString() == subjects[i].id
      );

      if (studentOffersSubject.length > 0) {
      }
    }

    studentsAverage.sort(
      (a, b) => b.studentSubjectAverage - a.studentSubjectAverage
    );

    for (let i = 0; i < studentsAverage.length; i++) {
      let studentPosition = i + 1;
      studentsAverage[i].position = getOrdinalSuffix(studentPosition);
    }

    const resultsAlreadyGenerated =
      await classPositionAndRemarksCollection.find({
        studentClass: classId,
        schoolId: schoolDetails?._id,
      });

    await classPositionAndRemarksCollection.deleteMany({
      studentClass: classId,
      schoolId: schoolDetails?._id,
    });

    for (let i = 0; i < resultsAlreadyGenerated.length; i++) {
      for (let j = 0; j < studentsAverage.length; j++) {
        if (
          studentsAverage[j].studentId ==
          resultsAlreadyGenerated[i].studentId.toString()
        ) {
          studentsAverage[j].classTeacherRemark =
            resultsAlreadyGenerated[i].classTeacherRemark;
          studentsAverage[j].principalsRemark =
            resultsAlreadyGenerated[i].principalsRemark;
        }
      }
    }

    console.log("studentsAverage", studentsAverage);

    await classPositionAndRemarksCollection.create(studentsAverage);

    res.send({
      message: `Result created for class with ID ${classId}`,
      result: classId,
    });
  } catch (error) {
    next(error);
  }
};

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

    if (req.userDetails?.role == "admin") {

        if(!classId) {
            res.status(400).send({
                message: "Kindly choose a class to fetch results for."
            });
            return;
        }

      result = await classPositionAndRemarksCollection.find({
        studentClass: classId,
      });
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
      });
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

    if (req.userDetails?.role == "admin") {
      await classPositionAndRemarksCollection.findByIdAndUpdate(positionId, {
        principalsRemark: remark,
      });
    } else if (req.userDetails?.role == "teacher") {
      await classPositionAndRemarksCollection.findByIdAndUpdate(positionId, {
        classTeacherRemark: remark,
      });
    }

    res.send({
      result: "Remark updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
