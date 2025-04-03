import { Response, NextFunction } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { v4 } from "uuid";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { sendEmail } from "../utils/emailUtilities";
import { schoolProfileCollection } from "../models/schoolProfile";
import mongoose from "mongoose";

export const createScratchCards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { term, year, scratchCardQuantity } = req.body;

    const scratchCards = [];

    for (let i = 0; i < scratchCardQuantity; i++) {
      scratchCards.push({
        scratchCardId: v4().split("-")[4],
        term,
        year,
      });
    }

    const newScratchCards = await StudentsScratchCardCollection.create(
      scratchCards
    );

    res.send({
      result: newScratchCards,
    });
  } catch (error) {
    next(error);
  }
};

export const getScratchCards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, scratchCardType } = req.params;
    // scratchCardType could be all or unpaired or paired

    let scratchCards = [];

    if (scratchCardType == "all") {
      scratchCards = (await StudentsScratchCardCollection.paginate(
        {},
        {
          sort: { createdAt: -1 },
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          populate: [
            {
              path: "studentId",
              select: "firstName otherNames surname gender profilePic email",
            },
            {
              path: "schoolId",
              select:
                "schoolName schoolLogo schoolEmail currentTerm currentYear",
            },
          ],
        }
      )) as any;
    } else if (scratchCardType == "unpaired") {
      scratchCards = (await StudentsScratchCardCollection.paginate(
        { studentId: null },
        {
          sort: { createdAt: -1 },
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
        }
      )) as any;
    } else if (scratchCardType == "paired") {
      scratchCards = (await StudentsScratchCardCollection.paginate(
        { studentId: { $ne: null } },
        {
          sort: { createdAt: -1 },
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          populate: [
            {
              path: "studentId",
              select: "firstName otherNames surname gender profilePic email",
            },
            {
              path: "schoolId",
              select:
                "schoolName schoolLogo schoolEmail currentTerm currentYear",
            },
          ],
        }
      )) as any;
    }

    res.send({
      result: scratchCards,
    });
  } catch (error) {
    next(error);
  }
};

export const scratchCardSummaey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pairedScratchCards =
      await StudentsScratchCardCollection.countDocuments({
        studentId: { $ne: null },
      });
    const notPairedScratchCards =
      await StudentsScratchCardCollection.countDocuments({ studentId: null });
    const totalScratchCards =
      await StudentsScratchCardCollection.countDocuments();

    res.send({
      message: "Scratch card summary retrieved successfully",
      result: {
        pairedScratchCards,
        notPairedScratchCards,
        totalScratchCards,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getScratchCard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const scratchCardDetails = await StudentsScratchCardCollection.findById(id);

    res.send({
      result: scratchCardDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const pairScratchCard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, scratchCardId } = req.body;

    const scratchCardDetails = await StudentsScratchCardCollection.findById(
      scratchCardId
    );

    if (!scratchCardDetails) {
      res.status(404).send({
        message: "Scratch cards does not exist",
      });
      return;
    } else if (scratchCardDetails.studentId != null) {
      res.status(401).send({
        message: "Scratch card paired already, unpair first",
      });
      return;
    }

    const alreadyPaired = await StudentsScratchCardCollection.findOne({
      studentId,
    });

    if (alreadyPaired) {
      res.status(409).send({
        message: "Student already paired",
      });
      return;
    }

    const studentDetails = await studentsCollection.findById(studentId);

    if (!studentDetails) {
      res.status(404).send({
        message: "Student does not exist",
      });
      return;
    }

    const updatedScratchCard =
      await StudentsScratchCardCollection.findByIdAndUpdate(
        scratchCardId,
        {
          studentId,
          dateIssued: new Date(),
          schoolId: studentDetails.schoolId,
        },
        { new: true }
      );

    // await sendEmail({
    //     to: studentDetails.email,
    //     subject: `${process.env.PLATFORM_NAME} - Scratch card details`,
    //     body: `
    //         <div>
    //             <div>Welcome ${studentDetails.firstName} ${studentDetails.surname}, your account has been paired with a scratch card.</div>
    //             <div>Your scratch card pin is ${updatedScratchCard?.scratchCardId}</div>
    //         </div>
    //     `
    // });

    res.send({
      result: updatedScratchCard,
    });
  } catch (error) {
    next(error);
  }
};

export const unpairScratchCard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, scratchCardId } = req.body;

    const scratchCardDetails = await StudentsScratchCardCollection.findById(
      scratchCardId
    );

    if (!scratchCardDetails) {
      res.status(404).send({
        message: "Scratch cards does not exist",
      });
      return;
    } else if (scratchCardDetails.studentId == null) {
      res.status(401).send({
        message: "Scratch card isn't paird with a student yet",
      });
      return;
    }

    const studentDetails = await studentsCollection.findById(studentId);

    if (!studentDetails) {
      res.status(404).send({
        message: "Student does not exist",
      });
      return;
    }

    const updatedScratchCard =
      await StudentsScratchCardCollection.findOneAndDelete({
        studentId,
        _id: scratchCardId,
      });

    res.send({
      message: "Scratch card unpaired and deleted successfully",
      result: updatedScratchCard,
    });
  } catch (error) {
    next(error);
  }
};

export const searchScratchCard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scratchCardId } = req.body;

    const scratchCardResult = await StudentsScratchCardCollection.find({
      scratchCardId: { $regex: scratchCardId, $options: "i" },
    });

    res.send({
      result: scratchCardResult,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScratchCard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const scratchCardDetails = await StudentsScratchCardCollection.findById(id);

    if (scratchCardDetails!!.studentId != null) {
      res.status(401).send({
        message:
          "Scratch card is already paired, kindly unpair before deleting",
      });
      return;
    }

    const deletedScratchCard =
      await StudentsScratchCardCollection.findByIdAndDelete(id);

    res.send({
      result: deletedScratchCard,
    });
  } catch (error) {
    next(error);
  }
};

export const CSVScratchCards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolId, classId } = req.params;

    const schoolDetails = await schoolProfileCollection.findById(schoolId);

    const result = await studentsCollection.aggregate([
      {
        $match: {
          schoolId: schoolDetails?._id,
          classId: new mongoose.Types.ObjectId(classId)
        },
      },
      {
        $lookup: {
          from: "studentsscrarchcards",
          localField: "_id",
          foreignField: "studentId",
          as: "scratchCard",
        },
      },
      {
        $unwind: {
          path: "$scratchCard",
        },
      },
      {
        '$lookup': {
          'from': 'schoolclasses', 
          'localField': 'classId', 
          'foreignField': '_id', 
          'as': 'studentClass'
        }
      }, {
        '$unwind': {
          'path': '$studentClass'
        }
      },
      {
        '$project': {
          'firstName': 1, 
          'otherNames': 1, 
          'surname': 1, 
          'studentUid': 1, 
          'gender': 1, 
          'studentClass.schoolClass': 1, 
          'scratchCard.scratchCardId': 1
        }
      }, {
        '$sort': {
          'firstName': -1
        }
      }
    ]);

    res.send({ result });
  } catch (error) {
    next(error);
  }
};

export const pairAllStudents = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { schoolId } = req.body;

    const schoolDetails = await schoolProfileCollection.findById(schoolId);
    const students = await studentsCollection.find({ schoolId });
    const studentScratchCard = await StudentsScratchCardCollection.find({
      schoolId,
    });

    let totalStudentPaired = 0;
    let newScratchCardsCreated = 0;

    for (let i = 0; i < students.length; i++) {
      const studentHasScratchCard = studentScratchCard.find(
        (s) => s.studentId.toString() == students[i]._id.toString()
      );

      if (!studentHasScratchCard) {
        const unpairedScratchCard = studentScratchCard.find(
          (s) => s.studentId.toString() == null
        );

        if (unpairedScratchCard) {
          await StudentsScratchCardCollection.findByIdAndUpdate(
            unpairedScratchCard._id,
            {
              studentId: students[i]._id,
            }
          );
          totalStudentPaired++;
        } else {
          await StudentsScratchCardCollection.create({
            studentId: students[i]._id,
            scratchCardId: v4().split("-")[4],
            dateIssued: new Date(),
            schoolId: students[i].schoolId,
            year: schoolDetails?.currentYear,
            term: schoolDetails?.currentTerm,
          });
          totalStudentPaired++;
          newScratchCardsCreated++;
        }
      }
    }

    res.send({
      message: "Bulk scratch card pairing successful",
      result: { totalStudentPaired, newScratchCardsCreated },
    });
  } catch (error) {
    next(error);
  }
};
