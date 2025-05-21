import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { assignmentCollection } from "../models/assignmentModel";
import { studentsCollection } from "../models/students";
import { staffsCollection } from "../models/staffs";
import { schoolTemplateCollection } from "../models/schoolTemplateModel";

export const assignments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectId, teacherId, classId, page, limit } = req.body;

    let fetchedAssignments: any;

    if (req.userDetails!!.role == "student") {
      const studentDetails = await studentsCollection.findById(
        req.userDetails!!.userId
      );

      fetchedAssignments = await assignmentCollection.paginate(
        {
          assignmentStatus: "active",
          classId: studentDetails?.classId,
          schoolId: studentDetails?.schoolId
        },
        {
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          sort: { updatedAt: -1 },
          populate: [
            {
              path: "subjectId",
            },
            {
              path: "classId"
            }
          ],
        }
      );
    } else {

        const staffDetails = await staffsCollection.findById(req.userDetails?.userId);

      const query: any = {};

      if (subjectId) query.subjectId = subjectId;
      if (classId) query.classId = classId;
      if (teacherId) query.teacherId = teacherId;

      query.schoolId = staffDetails?.schoolId;

      fetchedAssignments = await assignmentCollection.paginate(query, {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sort: { updatedAt: -1 },
        populate: [
          {
            path: "classId",
          },
          {
            path: "subjectId",
          },
        ],
      });
    }

    res.send({
      result: fetchedAssignments,
    });
  } catch (error) {
    next(error);
  }
};

export const assignment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const assignment = assignmentCollection.findById(id);

    res.send({
      result: assignment,
      message: "Single assignment retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      assignmentTitle,
      assignment,
      subjectId,
      classId,
      assignmentStatus,
      fileLink,
    } = req.body;

    const staffDetails = await staffsCollection.findById(
      req.userDetails!!.userId
    );

    if (!staffDetails?.schoolId) {
      res.send({
        message: "Not paired with a school",
      });
      return;
    }

    const newAssignment = await assignmentCollection.create({
      teacherId: req.userDetails!!.userId,
      assignmentTitle,
      assignment,
      subjectId,
      classId,
      assignmentStatus,
      fileLink,
      schoolId: staffDetails?.schoolId,
    });

    res.send({
      message: "Assignment created successfully",
      result: newAssignment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      teacherId,
      postedBy,
      assignmentTitle,
      assignment,
      subjectId,
      classId,
      assignmentStatus,
      fileLink,
    } = req.body;

    const { id } = req.params;

    var updatedAssignment: any;

    if (req.userDetails?.role == "teacher") {
      updatedAssignment = await assignmentCollection.findByIdAndUpdate(id, {
        teacherId: req.userDetails.userId,
        postedBy: req.userDetails.userId,
        assignmentTitle,
        assignment,
        subjectId,
        classId,
        assignmentStatus,
        fileLink,
      });
    } else {
      updatedAssignment = await assignmentCollection.findByIdAndUpdate(id, {
        teacherId,
        postedBy,
        assignmentTitle,
        assignment,
        subjectId,
        classId,
        assignmentStatus,
        fileLink,
      });
    }

    res.send({
      result: updatedAssignment
    });

  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const assignmentToDelete = await assignmentCollection.findById(id);

    if (!assignmentToDelete) {
      res.status(404).send({
        message: "No assignment founc",
      });
      return;
    }

    if (
      assignmentToDelete!!.teacherId.toString() != req.userDetails!!.userId &&
      req.userDetails!!.role == "teacher"
    ) {
      res.status(401).send({
        message: "You are not authorized to take this action",
      });
      return;
    }

    const deletedAssignment = await assignmentCollection.findByIdAndDelete(id);

    res.send({
      message: "Assignment deleted successfully",
      result: deletedAssignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentTemplate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const templateDetails = await schoolTemplateCollection.findOne({
      schoolId: staffDetails?.schoolId,
      templateType: "assignment-template",
    });

    res.send({
      message: "Assignment template retrieved successfully",
      result: templateDetails,
    });
  } catch (error) {
    next(error);
  }
};
