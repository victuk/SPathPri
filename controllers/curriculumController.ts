import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { assignmentCollection } from '../models/assignmentModel';
import { timeTableCollection } from '../models/timetableModel';
import { curriculumCollection } from '../models/curriculumModel';
import { staffsCollection } from '../models/staffs';
import { studentsCollection } from '../models/students';
import { schoolTemplateCollection } from '../models/schoolTemplateModel';

export const getCurriculum = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { page, limit } = req.params;

        let fetchedCurriculumList: any;

        if (req.userDetails!!.role == "student") {
            const studentDetails = await studentsCollection.findById(req.userDetails?.userId);
            if(!studentDetails?.schoolId) {
                res.status(400).send({
                    message: "Not paired with a school"
                });
                return;
            }
            fetchedCurriculumList = await curriculumCollection.paginate({
                curriculumStatus: "active",
                schoolId: studentDetails?.schoolId
            }, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sort: {createdAt: -1},
                populate: [
                    {
                        path: "classId"
                    }
                ]
            });
        } else {
            const staffDetails = await staffsCollection.findById(req.userDetails?.userId);
            if(!staffDetails?.schoolId) {
                res.status(400).send({
                    message: "Not paired with a school"
                });
                return;
            }
            fetchedCurriculumList = await curriculumCollection.paginate({
                schoolId: staffDetails?.schoolId
            }, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sort: {createdAt: -1},
                populate: [
                    {
                        path: "classId"
                    }
                ]
            });
        }

        res.send({
            result: fetchedCurriculumList
        });

    } catch (error) {
        next(error);
    }
}

export const getCurriculumById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const singleCurriculum = await curriculumCollection.findById(id);

        res.send({
            result: singleCurriculum,
            message: "Single curriculum retrieved successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const createCurriculum = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            title,
            classId,
            fileLink
        } = req.body;

        const staffDetail = await staffsCollection.findById(req.userDetails?.userId);

        if(!staffDetail?.schoolId) {
            res.send({
                message: "You are not paired to a school"
            });
            return;
        }

        const newCurriculum = await curriculumCollection.create({
            uploadedById: req.userDetails!!.userId,
            title,
            classId,
            fileLink,
            schoolId: staffDetail.schoolId
        });

        res.send({
            message: "Curriculum created successfully",
            result: newCurriculum
        });

    } catch (error) {
        next(error);
    }
}

export const updateCurriculum = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const {
            title,
            classId,
            fileLink
        } = req.body;

        const { id } = req.params;

        let updatedCurriculum = await curriculumCollection.findByIdAndUpdate(id, {
            title,
            classId,
            fileLink
            }, {new: true});


            res.send({
                message: "Curriculum updated successfully",
                result: updatedCurriculum
            });
        

    } catch (error) {
        next(error);
    }
}

export const deleteCurriculum = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const curriculumToDelete = await curriculumCollection.findById(id);

        if (!curriculumToDelete) {
            res.status(404).send({
                message: "No assignment founc"
            });
            return;
        }

        if ((curriculumToDelete!!.uploadedById).toString() != req.userDetails!!.userId || req.userDetails!!.role != "admin") {
            res.status(401).send({
                message: "You are not authorized to take this action"
            });
            return;
        }

        const deletedCurriculum = await curriculumCollection.findByIdAndDelete(id);

        res.send({
            message: "Curriculum deleted successfully",
            result: deletedCurriculum
        });

    } catch (error) {
        next(error);
    }
};

export const getCurriculumTemplate = async (
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
        templateType: "curriculum-template",
      });
  
      res.send({
        message: "Curriculum template retrieved successfully",
        result: templateDetails,
      });
    } catch (error) {
      next(error);
    }
  };
