import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { studentsCollection } from "../models/students";
import { staffsCollection } from "../models/staffs";
import { genOTP, hashPassword } from "../utils/authUtilities";
import { sendEmail } from "../utils/emailUtilities";
import { resultCollection } from "../models/resultModel";
import { subjectCollection } from "../models/subjectCollection";
import { schoolClassCollection } from "../models/classModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import { v4 } from "uuid";
import { createStaffId, createStudentId } from "../utils/idCreatorUtils";
import { remarkAndGrade } from "../utils/assessmentRemarkUtil";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";

export const getStudents = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.params;

    const { searchKeyword, classId } = req.body;

    console.log("searchKeyword, classId", searchKeyword, classId);

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const query: any = {};

    if (classId) {
      query.classId = classId;
    }

    if (searchKeyword) {
      query.$or = [
        { firstName: { $regex: searchKeyword, $options: "i" } },
        { studentUid: { $regex: searchKeyword, $options: "i" } },
        { otherNames: { $regex: searchKeyword, $options: "i" } },
        { surname: { $regex: searchKeyword, $options: "i" } },
        { email: { $regex: searchKeyword, $options: "i" } },
        { phoneNumber: { $regex: searchKeyword, $options: "i" } },
      ];
    }

    query.schoolId = staffDetails?.schoolId;

    const students = await studentsCollection.paginate(query, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: { firstName: -1, otherNames: -1, surname: -1 },
      populate: [
        {
          path: "classId",
        },
      ],
    });

    res.send({
      result: students,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSubjects = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // studentId

    const studentDetails = await studentsCollection.findById(id);

    const studentSubjects = await resultCollection.find();
  } catch (error) {
    next(error);
  }
};

export const getStudentResult = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { classId, subjectId } = req.body;

    const query: any = {};

    if (classId) {
      query.studentClass = classId;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const schoolDetails = await schoolProfileCollection.findById(
      staffDetails?.schoolId
    );

    console.log("staffDetails", staffDetails);
    console.log("schoolDetails", schoolDetails);

    query.term = schoolDetails?.currentTerm;
    query.year = schoolDetails?.currentYear;

    const response = await resultCollection.paginate(query, {
      page: req.params.page ? parseInt(req.params.page) : 1,
      limit: req.params.limit ? parseInt(req.params.limit) : 10,
      populate: [
        {
          path: "studentId",
          select: "-password",
        },
        {
          path: "teacherId",
          select: "-password",
        },
        {
          path: "subjectId",
        },
        {
          path: "studentClass",
        },
      ],
    });

    res.send({
      message: "Class and subject",
      result: response,
    });
  } catch (error) {
    next(error);
  }
};

interface ChangeStudentInterface {
  studentIds: string[];
  newClassId: string;
}

export const changeStudentsClass = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentIds, newClassId }: ChangeStudentInterface = req.body;

    if (studentIds.length == 0) {
      res.status(400).send({
        message: "No student choosen to be updated.",
      });
      return;
    }

    const students = await studentsCollection.find({
      _id: { $in: studentIds },
    });

    const schoolDetails = await schoolProfileCollection.findById(req.userDetails?.schoolId);

    await resultCollection.updateMany({_id: { $in: studentIds }, year: schoolDetails?.currentYear, term: schoolDetails?.currentYear, schoolId: req.userDetails?.schoolId}, {
      studentClass: newClassId
    });

    res.send({
      result: `The following student's class${
        studentIds.length > 1 ? "es" : ""
      } have been updated: ${students
        .map((s) => `${s.firstName} ${s.otherNames} ${s.surname}`)
        .join(", ")}`,
    });
  } catch (error) {
    next(error);
  }
};

/*
  This controller adds a new subject to each student in
  the student if they don't aleady have that subject.
*/
export const addNewStudentSubjectRecord = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentIds, subjectId } = req.body;

    const students = await studentsCollection.find({ _id: studentIds });

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    const assessments = await resultCollection.find({
      studentId: { $in: studentIds },
      subjectId,
      year: schoolDetails?.currentYear,
      term: schoolDetails?.currentTerm,
    });

    const assessmentToCreate = [];

    for (let i = 0; i < students.length; i++) {
      const assessmentAlreadyExist = assessments.find(
        (assessment) =>
          assessment.studentId.toString() == students[i]._id.toString() &&
          assessment.studentClass.toString() == students[i].classId.toString()
      );

      if (!assessmentAlreadyExist) {
        assessmentToCreate.push({
          studentId: students[i]._id,
          subjectId,
          studentClass: students[i].classId,
          year: schoolDetails?.currentYear,
          term: schoolDetails?.currentTerm,
        });
      }
    }

    await resultCollection.create(assessmentToCreate);

    res.send("Subject(s) added");
  } catch (error) {
    next(error);
  }
};

export const getSingleStudentResult = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentDetails = await studentsCollection.findById(
      req.userDetails?.userId
    );

    const schoolDetails = await schoolProfileCollection.findById(
      studentDetails?.schoolId
    );

    const studentRecord = await resultCollection.paginate(
      {
        studentId: req.userDetails?.userId,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear,
        schoolId: schoolDetails?._id,
      },
      {
        page: req.params.page ? parseInt(req.params.page) : 1,
        limit: req.params.limit ? parseInt(req.params.limit) : 10,
        populate: [
          {
            path: "studentId",
            select: "-password",
          },
          {
            path: "teacherId",
            select: "-password",
          },
          {
            path: "subjectId",
          },
          {
            path: "studentClass",
          },
        ],
      }
    );

    res.send({
      message: "Student records retrieved successfully",
      result: studentRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentResult = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recordId } = req.params;

    const { testOne, testTwo, testThree, examScore } = req.body;

    const total =
      Math.abs(testOne) +
      Math.abs(testTwo) +
      Math.abs(testThree) +
      Math.abs(examScore);

    if (total > 100) {
      res.status(400).send({
        message: "The total score value is greater than 100",
      });
      return;
    }

    if (total == 0) {
      const updatedResult = await resultCollection.findByIdAndUpdate(
        recordId,
        {
          testOne: 0,
          testTwo: 0,
          testThree: 0,
          examScore: 0,
          testsAndExamTotal: 0,
          grade: null,
          remark: null,
          subjectAverage: 0,
        },
        { new: true }
      );

      res.send({
        message: "Result updated successfully",
        result: updatedResult,
      });

      return;
    }

    const remarkAndGradeResult = remarkAndGrade(total);

    const updatedResult = await resultCollection.findByIdAndUpdate(
      recordId,
      {
        testOne: Math.abs(testOne),
        testTwo: Math.abs(testTwo),
        testThree: Math.abs(testThree),
        examScore: Math.abs(examScore),
        testsAndExamTotal: total,
        grade: remarkAndGradeResult.grade,
        remark: remarkAndGradeResult.remark,
        subjectAverage: total / 2,
      },
      { new: true }
    );

    res.send({
      message: "Result updated successfully",
      result: updatedResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherAssessment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectId, classId, term, year } = req.body;

    console.log(subjectId, classId, term, year);

    const subject = await subjectCollection.findById(subjectId);

    const classStudents = await studentsCollection.find({
      classId,
      schoolId: req.userDetails?.schoolId,
    });

    const assessment = await resultCollection
      .find({
        subjectId,
        studentClass: classId,
        term,
        year,
        schoolId: req.userDetails?.schoolId,
      })
      .populate("studentId");

    res.send({
      subject,
      classStudents,
      assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacherAssessment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      term,
      year,
      subjectId,
      studentId,
      classId,
      testOne,
      testTwo,
      testThree,
      examScore,
    } = req.body;

    const recordAlreadyExist = await resultCollection.findOne({
      subjectId,
      studentId,
      studentClass: classId,
      year,
      term,
      schoolId: req.userDetails?.schoolId,
    });

    let updatedAssessment: any;

    const total =
      Math.abs(testOne) +
      Math.abs(testTwo) +
      Math.abs(testThree) +
      Math.abs(examScore);

    const remarkAndGradeResult = remarkAndGrade(total);

    console.log("recordAlreadyExist", recordAlreadyExist);

    if (total > 100) {
      res.status(400).send({
        message: "The total score value is greater than 100",
      });
      return;
    }

    if (recordAlreadyExist) {
      updatedAssessment = await resultCollection.findByIdAndUpdate(
        recordAlreadyExist._id,
        {
          teacherId: req.userDetails?.userId,
          testOne,
          testTwo,
          testThree,
          examScore,
          studentClass: classId,
          testsAndExamTotal: total,
          grade: remarkAndGradeResult.grade,
          remark: remarkAndGradeResult.remark,
          subjectAverage: total / 2,
        },
        {
          new: true,
        }
      );
    } else {
      updatedAssessment = await resultCollection.create({
        studentId,
        subjectId,
        teacherId: req.userDetails?.userId,
        testOne,
        testTwo,
        testThree,
        examScore,
        year,
        term,
        schoolId: req.userDetails?.schoolId,
        studentClass: classId,
        testsAndExamTotal: total,
        grade: remarkAndGradeResult.grade,
        remark: remarkAndGradeResult.remark,
        subjectAverage: total / 2,
      });
    }

    res.send({
      result: updatedAssessment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentAssessment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const {
      studentId,
      subjectId,
      classId
    } = req.body;
    
    await resultCollection.findOneAndDelete({
      studentId, subjectId, studentClass: classId
    });

    res.send({
      message: "Result deleted successfully"
    });

  } catch (error) {
    next(error);
  }
}

export const getStudent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const student = await studentsCollection.findById(id);

    res.send({
      result: student,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentByEmail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;

    const student = await studentsCollection
      .findOne(
        { email },
        "firstName otherNames surname gender profilePic email classId schoolId"
      )
      .populate("schoolId", "schoolName schoolUid schoolLogo")
      .populate("classId");

    res.send({
      message: "Student retrieved successfully",
      result: student,
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      otherNames,
      surname,
      gender,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      emailVerified,
      classId,
      profilePic,
      accountStatus,
      phoneNumber,
      phoneNumberVerified,
      admissionYear,
      admissionTerm,
      studentTrack,
    } = req.body;

    console.log("req.body", req.body);

    const password = "stu12345678";

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const schoolDetails = await schoolProfileCollection.findById(
      req.userDetails?.schoolId
    );

    console.log("req.userDetails?.userId", req.userDetails?.userId);

    if ((req.userDetails?.schoolId != "super-admin" && req.userDetails?.schoolId != null)) {
      res.status(409).send({
        message: "You are not authorized to take this action.",
      });
      return;
    }

    const studentDetails = await studentsCollection.findOne({ email });


      if (studentDetails) {
        res.status(409).send({
          message: "Student already exist",
        });
        return;
      }
        
    
    const newStudent = await studentsCollection.create({
      firstName,
      otherNames,
      surname,
      profilePic,
      studentUid: await createStudentId(schoolDetails!!.schoolUid),
      gender,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      classId,
      email,
      emailVerified,
      accountStatus,
      phoneNumber,
      phoneNumberVerified,
      password: hashPassword(password),
      admissionYear,
      admissionTerm,
      studentTrack,
      schoolId: req.userDetails?.schoolId,
    });

    await sendEmail({
      to: email,
      subject: `${process.env.PLATFORM_NAME} - New student credential`,
      body: `
                <div>
                    <div>Welcome ${email}, here is your user credential for ${process.env.PLATFORM_NAME}</div>
                    <div>
                        <div>Email: ${email}</div>
                        <div>Password: ${password}</div>
                    </div>
                </div>
            `,
    });

    res.send({
      result: newStudent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      otherNames,
      surname,
      gender,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      profilePic,
      emailVerified,
      accountStatus,
      phoneNumber,
      phoneNumberVerified,
      password,
      admissionYear,
      admissionTerm,
      parentName,
      parentEmail,
      parentPhoneNumber
    } = req.body;

    const updateStudent = await studentsCollection.findByIdAndUpdate(id, {
      firstName,
      otherNames,
      surname,
      gender,
      profilePic,
      lgaOfOrigin,
      stateOfOrigin,
      dateOfBirth,
      email,
      emailVerified,
      accountStatus,
      phoneNumber,
      phoneNumberVerified,
      password: hashPassword(password),
      admissionYear,
      admissionTerm,
      parentName,
      parentEmail,
      parentPhoneNumber
    }, {
      new: true
    });

    res.send({
      result: updateStudent
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;

    const deletedStudent = await studentsCollection.findByIdAndUpdate(id, {
      schoolId: null,
    });

    res.send({
      result: deletedStudent,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffs = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, schoolId } = req.params;

    // const {role} = req.body;

    const staff = await staffsCollection.paginate(
      {
        schoolId,
      },
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sort: { createdAt: -1 },
      }
    );

    res.send({
      result: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffByRole = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.hostname", req.hostname);

    const { role, page, limit } = req.params;

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const staffList = await staffsCollection.paginate(
      { role, schoolId: staffDetails?.schoolId },
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        // sort: { firstName: -1 },
      }
    );

    res.send({
      result: staffList,
    });
  } catch (error) {
    next(error);
  }
};

export const searchStaffByRole = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchKeyword, role, page, limit } = req.body;

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const staffList = await staffsCollection.paginate(
      {
        role,
        schoolId: staffDetails?.schoolId,
        $or: [
          { firstName: { $regex: searchKeyword, $options: "i" } },
          { otherNames: { $regex: searchKeyword, $options: "i" } },
          { surname: { $regex: searchKeyword, $options: "i" } },
          { staffUid: { $regex: searchKeyword, $options: "i" } },
          { email: { $regex: searchKeyword, $options: "i" } },
          { phoneNumber: { $regex: searchKeyword, $options: "i" } },
        ],
      },
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        // sort: { firstName: -1 },
      }
    );

    res.send({
      result: staffList,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const staff = await staffsCollection.findById(id);

    res.send({
      result: staff,
    });
  } catch (error) {
    next(error);
  }
};

interface ClassAndSubject {
  classId: string;
  subjectId: string;
}

interface StaffInterface {
  firstName: string;
  otherNames: string;
  surname: string;
  email: string;
  gender: string;
  profilePic: string;
  phoneNumber?: string;
  role: string;
  classTeacherOf?: string;
  subjectTeacherOf?: ClassAndSubject[];
  stateOfOrigin: string;
  lgaOfOrigin: string;
  schoolId: string;
}

export const createStaff = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      otherNames,
      surname,
      email,
      gender,
      phoneNumber,
      profilePic,
      role,
      classTeacherOf,
      subjectTeacherOf,
      stateOfOrigin,
      lgaOfOrigin,
      schoolId,
    }: StaffInterface = req.body;

    const emailAlreadyExist = await staffsCollection.findOne({
      email,
    });

    const schoolDetails = await schoolProfileCollection.findById(schoolId);

    const password = "dominion1234";

    let newStaff: any;

    if (emailAlreadyExist) {
      if (emailAlreadyExist.schoolId) {
        res.status(409).send({
          message: `The email ${email} is already registered and is linked with a school.`,
        });
        return;
      } else {
        newStaff = await staffsCollection.findOneAndUpdate(
          { email },
          {
            // firstName,
            // otherNames,
            // surname,
            // gender,
            staffUid: await createStaffId(schoolDetails!!.schoolUid),
            phoneNumber,
            profilePic,
            role,
            classTeacherOf,
            subjectTeacherOf,
            stateOfOrigin,
            lgaOfOrigin,
            schoolId,
          }
        );
      }
    } else {
      newStaff = await staffsCollection.create({
        firstName,
        otherNames,
        surname,
        email,
        profilePic,
        staffUid: await createStaffId(schoolDetails!!.schoolUid),
        password: hashPassword(password),
        gender,
        phoneNumber,
        role,
        classTeacherOf,
        subjectTeacherOf,
        stateOfOrigin,
        lgaOfOrigin,
        schoolId,
      });
    }

    await sendEmail({
      to: email,
      subject: `${process.env.PLATFORM_NAME} - New Staff Login Details`,
      body: `
                  <div>
                      <div>Your profile has been created on ${process.env.PLATFORM_NAME}. Your login details are as follows</div>
                      <div>
                          <div>Email: ${email}</div>
                          <div>Staff Uid: ${newStaff.staffUid}</div>
                          <div>Password: ${password}</div>
                      </div>
                      <div>Kindly login and change your password</div>
                      <div>Note: You can use your email or staff UID to login</div>
                  </div>
              `,
    });

    res.send({
      result: newStaff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;

    const {
      firstName,
      otherNames,
      surname,
      email,
      gender,
      phoneNumber,
      role,
      classTeacherOf,
      subjectTeacherOf,
      stateOfOrigin,
      lgaOfOrigin,
    } = req.body;

    const updatedStaff = await staffsCollection.findByIdAndUpdate(id, {
      firstName,
      otherNames,
      surname,
      email,
      gender,
      phoneNumber,
      role,
      classTeacherOf,
      subjectTeacherOf,
      stateOfOrigin,
      lgaOfOrigin,
    });

    res.send({
      result: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

export const handOverAndRemoveStaff = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const promoteStudents = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentTrack, studentIds, newClassId } = req.body;

    const students = await studentsCollection.find({
      _id: { $in: studentIds }
    });
    
    await studentsCollection.updateMany({
      _id: { $in: studentIds }
    }, {
      classId: newClassId,
      studentTrack
    });

    res.send({
      message: `The following students have been promoted: ${students
        .map((s) => `${s.firstName} ${s.otherNames} ${s.surname}`)
        .join(", ")}`,
    });
  } catch (error) {
    next(error);
  }
};

// const addStaffByEmail = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {}

// const addStudentByEmail = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {}
