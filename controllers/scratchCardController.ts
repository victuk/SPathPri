import { Response, NextFunction } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { StudentsScratchCardCollection, StudentsScratchCardCollectionType } from "../models/studentsScratchCard";
import { v4 } from "uuid";
import { studentsCollection, studentsCollectionType } from "../models/students";
import { sendEmail } from "../utils/emailUtilities";
import { schoolProfileCollection } from "../models/schoolProfile";
import mongoose from "mongoose";
import Joi from "joi";

export const createScratchCards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { term, year, scratchCardQuantity } = req.body;

    const {error} = Joi.object({
      term: Joi.string().required().messages({
        "any.required": "Term value is required"
      }),
      year: Joi.string().required().messages({
        "any.required": "Year value is required"
      }),
      scratchCardQuantity: Joi.number().required().messages({
        "any.required": "Scratch card quantity value is required"
      }),
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

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

    const {error} = Joi.object({
      studentId: Joi.string().required().messages({
        "any.required": "Student's ID is required",
      }),
      scratchCardId: Joi.string().required().messages({
        "any.required": "Scratch card's ID is required",
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

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

    const {error} = Joi.object({
      studentId: Joi.string().required().messages({
        "any.required": "Student's ID is required",
      }),
      scratchCardId: Joi.string().required().messages({
        "any.required": "Scratch card's ID is required",
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

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

    const {error} = Joi.object({
      scratchCardId: Joi.string().required().messages({
        "any.required": "Scratch card's ID is required",
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

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

    if(!id) {
      res.status(400).send({
        errorMessage: "Scratch ID to be deleted can't be empty."
      });
      return;
    }

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

    const {error} = Joi.object({
      schoolId: Joi.string().required().messages({
        "any.required": "School ID is required",
      }),
      classId: Joi.string().required().messages({
        "any.required": "Class ID is required",
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

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

    if(!schoolId) {
      res.status(400).send({
        errorMessage: "No school ID supplied"
      });
      return;
    }

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

export const cardSummaryV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {

    const {term, year} = req.body;

    if(!year || !term) {
      res.status(400).send({
        message: "Kindly choose a term and a year",
      });
      return;
    }
    
    const totalPaired = await StudentsScratchCardCollection.countDocuments({schoolId: req.userDetails?.schoolId, studentId: {$ne: null}, term, year});

    const totalUnpaired = await StudentsScratchCardCollection.countDocuments({schoolId: req.userDetails?.schoolId, studentId: null, term, year});

    res.send({totalPaired, totalUnpaired});

  } catch (error) {
    next(error);
  }
}

export const scratchCardV2 =  async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    
    const {classId, term, year} = req.body;

    console.log(req.body);

    const students = await studentsCollection.find({classId, schoolId: req.userDetails?.schoolId}).populate("classId");

    const studentIds = students.map(s => (s._id).toString());

    const scratchCards = await StudentsScratchCardCollection.find({studentId: studentIds, term, year, schoolId: req.userDetails?.schoolId});

    res.send({students, scratchCards});

  } catch (error) {
    next(error);
  }
}

export const createSchoolScratchCardsV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {

    const {scratchCardQuantity, term, year} = req.body;

    if(!term || !year || !scratchCardQuantity || !req.userDetails?.schoolId) {
      res.status(422).send({
        message: "Kindly supply a term, year and scratch card quantity."
      });
      return;
    }

    const scratchCards: any[] = [];

    for (let i = 0; i < scratchCardQuantity; i++) {
      scratchCards.push({
        scratchCardId: v4().split("-")[4],
        term,
        year,
        schoolId: req.userDetails.schoolId!!
      });
    }

    const newScratchCards = await StudentsScratchCardCollection.create(scratchCards);

    res.status(201).send({
      message: "Scratch cards created",
      result: newScratchCards
    });

  } catch (error) {
    next(error);
  }
}

export const viewSchoolUnpairedScratchCardsV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {

    const {term, year} = req.body;

    if(!term || !year) {
      res.status(422).send({
        message: "Kindly supply a term and a year."
      });
      return;
    }

    if(!req.userDetails?.schoolId) {
      res.status(422).send({
        message: "You're not assigned to a school"
      });
      return;
    }

    const scratchCards = await StudentsScratchCardCollection.find({
      term, year, studentId: null, schoolId: req.userDetails.schoolId
    });

    res.status(201).send({
      message: "Scratch cards created",
      result: scratchCards
    });

  } catch (error) {
    next(error);
  }
}

export const viewSchoolPairedScratchCardsV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {

    const {term, year} = req.body;

    if(!term || !year || !req.userDetails?.schoolId) {
      res.status(422).send({
        message: "Kindly supply a class, a term, year and scratch card quantity."
      });
      return;
    }

    if(!req.userDetails?.schoolId) {
      res.status(422).send({
        message: "You're not assigned to a school"
      });
      return;
    }

    const scratchCards = await StudentsScratchCardCollection.find({
      term, year, studentId: {$ne: null}, schoolId: req.userDetails.schoolId
    }).populate("studentId").sort({"studentId.firstName": -1});

    res.send({
      message: "Scratch cards created",
      result: scratchCards
    });

  } catch (error) {
    next(error);
  }
}

export const assignScratchCardV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const {studentId} = req.body;

    if(!req.userDetails?.schoolId) {
      res.status(401).send({
        message: "You don't have a student ID"
      });
      return;
    }
    console.log(studentId, req.userDetails.schoolId);
    const studentDetails = await studentsCollection.findOne({_id: studentId, schoolId: req.userDetails.schoolId});

    if(!studentDetails) {
      res.status(404).send({
        message: "Student does not exist"
      });
      return;
    }

    const alreadyHasScratchCard = await StudentsScratchCardCollection.findOne({studentId});

    if(alreadyHasScratchCard) {
      res.status(409).send({
        message: "Student already has a scratch card. Unpair student before assigning a new scratch card."
      });
      return;
    }

    const schoolDetails = await schoolProfileCollection.findById(req.userDetails?.schoolId);

    const createdScratchCard = await StudentsScratchCardCollection.create({
      term: schoolDetails?.currentTerm,
      year: schoolDetails?.currentYear,
      studentId,
      scratchCardId: v4().split("-")[4],
      dateIssued: new Date(),
      schoolId: req.userDetails?.schoolId
    });

    res.status(201).send({
      message: "Student scratch card created successfully",
      result: createdScratchCard
    });

  } catch (error) {
    next(error);
  }
}

export const unpairScratchCardV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const {studentId} = req.body;

    console.log(studentId);

    await StudentsScratchCardCollection.deleteMany({
      studentId
    });

    res.send({
      message: "Scratch card unpaired and deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

export const resetScratchCardAttempt = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    
    const {scratchCardId} = req.body;

    const updatedScratchCard = await StudentsScratchCardCollection.findByIdAndUpdate(scratchCardId, {
      loginChancesLeft: 4
    }, {new: true});

    res.send({
      message: "Scratch card login attempts left updated successfully",
      result: updatedScratchCard
    });

  } catch (error) {
    next(error);
  }
}

export const searchScratchCardV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    
    const {searchValue} = req.body;

    const students = await studentsCollection.find({
      $or: [
        {firstName: {$in: searchValue.split(" ")}},
        {otherNames: {$in: searchValue.split(" ")}},
        {surName: {$in: searchValue.split(" ")}},
        {studentUid: searchValue}
      ],
      schoolId: req.userDetails?.schoolId
    });

    if(students.length == 0) {
      res.status(404).send({
        message: "Student not found"
      });
      return;
    }

    const studentIds = students.map(s => s.id);

    const scratchCards = await StudentsScratchCardCollection.find({
      studentId: {$in: studentIds},
      schoolId: req.userDetails?.schoolId
    });

    res.send({students, scratchCards});

  } catch (error) {
    next(error);
  }
}

export const deleteBulkScratchCardsV2 = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    
    const {term, year, deletePaired, deleteUnpaired} = req.body;

    if(!term || !year) {
      res.status(422).send({
        message: "Kindly choose a term and a year"
      });
      return;
    }

    let pairedDeleteCount = 0;

    let unpairedDeleteCount = 0;

    if(deletePaired == false && deleteUnpaired == false) {
      res.status(400).send({
        message: "Kindly choose one of the checkboxes."
      });
      return;
    }

    if(deletePaired == true) {
      let value = await StudentsScratchCardCollection.deleteMany({
        studentId: {$ne: null},
        term, year, schoolId: req.userDetails?.schoolId
      });
      pairedDeleteCount = value.deletedCount;
    }

    if(deleteUnpaired == true) {
      let value = await StudentsScratchCardCollection.deleteMany({
        studentId: null,
        term, year, schoolId: req.userDetails?.schoolId
      });
      unpairedDeleteCount = value.deletedCount;
    }

    res.send({
      message: `Scratch card for ${term.replace(/-/g, " ").toLocaleUpperCase()} ${term} session has been deleted successfully`,
      pairedDeleteCount, unpairedDeleteCount
    });

  } catch (error) {
    next(error);
  }
}
