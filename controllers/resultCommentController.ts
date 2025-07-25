import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";
import { teacherAdminRemarksCollection } from "../models/teacherAdminRemarksModel";

export const addNewResultComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      classTeachersRemark,
      principalsRemark,
      minimum,
      maximum,
      includeImprovementSubjects,
      verdict,
    } = req.body;

    const anyOverlap = await teacherAdminRemarksCollection.findOne({
        $or: [
            // Case 1: Existing range starts within the new range
            { minimum: { $gte: minimum, $lte: maximum } },
            // Case 2: Existing range ends within the new range
            { maximum: { $gte: minimum, $lte: maximum } },
            // Case 3: New range is completely contained within an existing range
            { minimum: { $lte: minimum }, maximum: { $gte: maximum } }
        ]
    });

    if(anyOverlap) {
        res.status(400).send({
            message: "Overlap detected"
        });
        return;
    }

    const newComment = await teacherAdminRemarksCollection.create({
      classTeachersRemark,
      principalsRemark,
      minimum,
      maximum,
      includeImprovementSubjects,
      verdict,
      schoolId: req.userDetails?.schoolId,
    });

    res.status(201).send({
      message: "Comment created",
      result: newComment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResultComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const {
        classTeachersRemark,
        principalsRemark,
        minimum,
        maximum,
        includeImprovementSubjects,
        verdict
    } = req.body;

    const anyOverlap = await teacherAdminRemarksCollection.findOne({
        _id: {$ne: id},
        $or: [
            // Case 1: Existing range starts within the new range
            { minimum: { $gte: minimum, $lte: maximum } },
            // Case 2: Existing range ends within the new range
            { maximum: { $gte: minimum, $lte: maximum } },
            // Case 3: New range is completely contained within an existing range
            { minimum: { $lte: minimum }, maximum: { $gte: maximum } }
        ]
    });

    if(anyOverlap) {
        res.status(400).send({
            message: "Overlap detected"
        });
        return;
    }

    let updatedComment;

    if (req.userDetails?.role == "teacher") {
      updatedComment = await teacherAdminRemarksCollection.findOneAndUpdate(
        {
          _id: id,
          schoolId: req.userDetails?.schoolId,
        },
        {
          classTeachersRemark,
        },
        {
          new: true,
        }
      );
    } else {
      updatedComment = await teacherAdminRemarksCollection.findOneAndUpdate(
        {
          _id: id,
          schoolId: req.userDetails?.schoolId,
        },
        {
          principalsRemark,
          minimum,
          maximum,
          includeImprovementSubjects,
          verdict,
          schoolId: req.userDetails?.schoolId,
        },
        {
          new: true,
        }
      );
    }

    res.send({
      message: "Comment updated",
      result: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const viewResultComments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const resultComments = await teacherAdminRemarksCollection.find({
      schoolId: req.userDetails?.schoolId,
    }).sort({minimum: -1});

    res.send({
      message: "Result comments retrieved successfully",
      result: resultComments,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResultComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedResultComment =
      await teacherAdminRemarksCollection.findByIdAndDelete({
        _id: id,
        schoolId: req.userDetails?.schoolId,
      });

      res.send({
        message: "Result comment deleted successfully",
        result: deletedResultComment
      });
  } catch (error) {
    next(error);
  }
};
