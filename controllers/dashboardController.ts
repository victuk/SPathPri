import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { studentsCollection } from "../models/students";
import { staffsCollection } from "../models/staffs";
import { assignmentCollection } from "../models/assignmentModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { announcementCollection } from "../models/announcementModel";
import { schoolClassCollection } from "../models/classModel";
import { AttendanceCollection } from "../models/studentsAttendance";
import { Types } from "mongoose";

export const dashboardController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.userDetails?.role == "admin" ||
      req.userDetails?.role == "record-keeper"
    ) {
      const staffDetails = await staffsCollection.findById(
        req.userDetails?.userId
      );

      const totalStudents = await studentsCollection.countDocuments({
        schoolId: staffDetails?.schoolId,
      });

      const totalAdmins = await staffsCollection.countDocuments({
        role: "admin",
        schoolId: staffDetails?.schoolId,
      });

      const totalTeachers = await staffsCollection.countDocuments({
        role: "teacher",
        schoolId: staffDetails?.schoolId,
      });

      const totalRecordKeepers = await staffsCollection.countDocuments({
        role: "record-keeper",
        schoolId: staffDetails?.schoolId,
      });

      const studentClasses = await schoolClassCollection.find();

      const jss1StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "jss-1")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const jss2StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "jss-2")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const jss3StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "jss-3")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const ss1StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "ss-1")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const ss2StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "ss-2")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const ss3StudentCount = await studentsCollection.countDocuments({
        classId: studentClasses.find((s) => s.slug == "ss-3")?._id,
        schoolId: staffDetails?.schoolId,
      });

      const classStudentCount = await schoolClassCollection.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(req.userDetails.schoolId!!)
          }
        },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "classId",
            as: "classStudents"
          }
        },
        {
          $addFields: {
            studentCount: { $size: "$classStudents" } // Add a field for the count of students
          }
        },
        {
          $project: {
            schoolClass: 1, // Keep the class name (or other fields you need)
            studentCount: 1 // Include the count of students
          }
        }
      ]);

      res.send({
        message: "Admin dashboard details sent successfully",
        result: {
          totalStudents,
          totalAdmins,
          totalTeachers,
          totalRecordKeepers,
          jss1StudentCount,
          jss2StudentCount,
          jss3StudentCount,
          ss1StudentCount,
          ss2StudentCount,
          ss3StudentCount,
          classStudentCount
        },
      });
    } else if (req.userDetails?.role == "teacher") {
      const staffDetails = await staffsCollection.findById(
        req.userDetails?.userId
      );

      const today = new Date(new Date().toISOString().split('T')[0]);

      const assignmentCount = await assignmentCollection.countDocuments({
        teacherId: req.userDetails?.userId,
        schoolId: staffDetails?.schoolId,
      });

      const totalPresentStudents = await AttendanceCollection.countDocuments({
        classId: staffDetails?.classTeacherOf,
        schoolId: staffDetails?.schoolId,
        status: "present",
        attendanceDate: today,
      });

      const totalAbsentStudents = await AttendanceCollection.countDocuments({
        classId: staffDetails?.classTeacherOf,
        schoolId: staffDetails?.schoolId,
        status: "absent",
        attendanceDate: today,
      });

      const totalPermittedAbsenceStudents = await AttendanceCollection.countDocuments({
        classId: staffDetails?.classTeacherOf,
        schoolId: staffDetails?.schoolId,
        status: "permitted-absence",
        attendanceDate: today,
      });

      const classStudentCount = await studentsCollection.countDocuments({
        classId: staffDetails?.classTeacherOf,
        schoolId: staffDetails?.schoolId,
      });

      res.send({
        result: {
          assignmentCount,
          classStudentCount,
          totalPresentStudents,
          totalAbsentStudents,
          totalPermittedAbsenceStudents,
        },
      });
    } else if (req.userDetails?.role == "super-admin") {
      const totalSchools = await schoolProfileCollection.countDocuments();

      const totalScratchCards =
        await StudentsScratchCardCollection.countDocuments();

      const totalUsedScratchCards =
        await StudentsScratchCardCollection.countDocuments({
          studentId: { $ne: null },
        });

      const totalUnusedScratchCards =
        await StudentsScratchCardCollection.countDocuments({
          studentId: null,
        });

      const totalTeachers = await staffsCollection.countDocuments({
        role: "teacher",
      });

      const totalStudents = await studentsCollection.countDocuments();

      res.send({
        result: {
          totalSchools,
          totalScratchCards,
          totalUsedScratchCards,
          totalUnusedScratchCards,
          totalTeachers,
          totalStudents,
        },
      });
    } else if (req.userDetails?.role == "student") {
      const studentDetails = await studentsCollection.findById(
        req.userDetails.userId
      );

      const totalAnnouncements = await announcementCollection.countDocuments({
        audienceType: {
          $in: req.userDetails.role,
        },
        schoolId: studentDetails?.schoolId,
      });

      const totalAssignment = await assignmentCollection.countDocuments({
        classId: studentDetails?.classId,
        schoolId: studentDetails?.schoolId,
      });

      const classTeacherDetails = await staffsCollection.findOne({
        classTeacherOf: {
          $in: studentDetails?.classId,
        },
      });

      const scratchCardDetails = await StudentsScratchCardCollection.findOne({
        studentId: studentDetails?._id,
      });

      res.send({
        result: {
          totalAnnouncements,
          totalAssignment,
          classTeacherDetails,
          scratchCardDetails,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
