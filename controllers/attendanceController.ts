import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { staffsCollection } from "../models/staffs";
import { schoolProfileCollection } from "../models/schoolProfile";
import { AttendanceCollection } from "../models/studentsAttendance";
import { studentsCollection } from "../models/students";

export const getClassAttendance = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attendanceDate } = req.body;

    if (req.userDetails?.role != "student") {
      const staffDetails = await staffsCollection.findById(
        req.userDetails?.userId
      );

      const schoolDetails = await schoolProfileCollection.findById(
        staffDetails?.schoolId
      );

      const studentList = await studentsCollection.find(
        {
          classId: staffDetails?.classTeacherOf,
          schoolId: schoolDetails?._id,
        },
        "firstName otherNames surname email profilePic"
      );

      const attendanceDetails = await AttendanceCollection.find({
        classId: staffDetails?.classTeacherOf,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear,
        schoolId: schoolDetails?._id,
        attendanceDate,
      });

      const attendanceSummary = await studentsCollection.aggregate([
        {
          $lookup: {
            from: "attendances",
            localField: "_id",
            foreignField: "studentId",
            as: "studentAttendance",
          },
        },
        {
          $project: {
            _id: 1,
            presenceCount: {
              $sum: {
                $sum: {
                  // Double $sum is required to iterate over the array.
                  $map: {
                    input: "$studentAttendance",
                    as: "record",
                    in: {
                      $cond: [{ $eq: ["$$record.status", "present"] }, 1, 0],
                    },
                  },
                },
              },
            },
            absenceCount: {
              $sum: {
                $sum: {
                  // Double $sum is required to iterate over the array.
                  $map: {
                    input: "$studentAttendance",
                    as: "record",
                    in: {
                      $cond: [{ $eq: ["$$record.status", "absent"] }, 1, 0],
                    },
                  },
                },
              },
            },
            permittedAbsenceCount: {
              $sum: {
                $sum: {
                  // Double $sum is required to iterate over the array.
                  $map: {
                    input: "$studentAttendance",
                    as: "record",
                    in: {
                      $cond: [
                        { $eq: ["$$record.status", "permitted-absence"] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            },
            totalClasses: { $size: "$studentAttendance" },
          },
        },
      ]);

      res.send({
        students: studentList,
        attendanceDetails,
        attendanceSummary
      });
    } else {
      const studentDetails = await studentsCollection.findById(
        req.userDetails?.userId,
        "firstName otherNames surname email profilePic classId schoolId"
      );

      const schoolDetails = await schoolProfileCollection.findById(
        studentDetails?.schoolId
      );

      const attendanceDetails = await AttendanceCollection.find({
        classId: studentDetails?.classId,
        term: schoolDetails?.currentTerm,
        year: schoolDetails?.currentYear,
        schoolId: schoolDetails?._id,
        studentId: studentDetails?._id,
      });

      res.send({
        // studentDetails,
        attendanceDetails,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attendance } = req.body;

    console.log(attendance);

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const schoolDetails = await schoolProfileCollection.findById(
      staffDetails?.schoolId
    );

    for (let i = 0; i < attendance.length; i++) {
      attendance[i].studentId = attendance[i]._id;
      attendance[i].term = schoolDetails?.currentTerm;
      attendance[i].year = schoolDetails?.currentYear;
      attendance[i].classId = staffDetails?.classTeacherOf;
      attendance[i].schoolId = schoolDetails?._id;
      attendance[i].teacherId = staffDetails?._id;
      attendance[i].reasonForAbsence =
        attendance[i].status == "permitted-absence"
          ? attendance[i].reasonForAbsence
          : null;
      delete attendance[i]._id;
    }

    const attendanceToCreate = attendance.filter(
      (a: any) => a.attendanceId == null
    );

    await AttendanceCollection.create(attendanceToCreate);

    attendance
      .filter((a: any) => a.attendanceId != null && a.update == true)
      .map(async (a: any) => {
        const attendanceID = a.attendanceId;
        delete a._id;
        delete a.attendanceId;
        await AttendanceCollection.findByIdAndUpdate(attendanceID, a);
      });

    res.send({
      message: "Attendance updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const resetAttendance = async (
    req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        const {attendanceDate} = req.body;

        const staffDetails = await staffsCollection.findById(req.userDetails?.userId);

        const schoolDetails = await schoolProfileCollection.findById(staffDetails?.schoolId);

        await AttendanceCollection.deleteMany({
            attendanceDate,
            term: schoolDetails?.currentTerm,
            year: schoolDetails?.currentYear,
            classId: staffDetails?.classTeacherOf,
            schoolId: staffDetails?.schoolId
        });

        res.send({
            message: "Deleted"
        });

    } catch (error) {
        next(error);
    }
}
