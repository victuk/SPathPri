import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import { AssessmentCollection } from '../models/studentsAssessment';
import { studentsCollection } from '../models/students';
import { staffsCollection } from '../models/staffs';
import { subjectCollection } from '../models/subjectCollection';
import { resultCollection } from '../models/resultModel';
import { affectiveAssessmentCollection } from '../models/affectiveAssessment';
import Joi from 'joi';
import { getSchoolId } from '../utils/schoolIdUtil';

export const assessments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { subjectId, classId, year, studentId } = req.body;

        const query: any = {};

        if(subjectId) query.subjectId = subjectId;
        if(classId) query.subjectId = classId;
        if(classId) query.year = year;
        if(studentId) query.year = studentId;

        let userDetails: any;

        if(req.userDetails?.role == "student") {
            userDetails = await studentsCollection.findById(req.userDetails.userId);
        } else {
            userDetails = await staffsCollection.findById(req.userDetails?.userId);
        }

        query.schoolId = userDetails.schoolId;

        const assessment = await AssessmentCollection.find(query);

        res.send({
            result: assessment,
            message: "Assessment fetched successfully"
        });

    } catch (error) {
        next(error);
    }
}

export const assessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const assessment = await AssessmentCollection.findById(req.params.id);

        res.send({
            result: assessment
        });

    } catch (error) {
        next(error);
    }
}

export const createAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        if(!req.body.testOne) req.body.testOne = 0;
        if(!req.body.testTwo) req.body.testTwo = 0;
        if(!req.body.testThree) req.body.testThree = 0;
        
        const {
            assessmentId,
            studentId,
            teacherId,
            subjectId,
            classId,
            year,
            testOne,
            testTwo,
            testThree,
            exam
        } = req.body;


        let createdAssessment: any;

        if (req.userDetails?.role == "teacher") {

            createdAssessment = await AssessmentCollection.create({
                testOne, testTwo, testThree, exam
            });
        } else {
            createdAssessment = await AssessmentCollection.create({
                assessmentId,
                studentId,
                teacherId,
                subjectId,
                classId,
                year,
                testOne,
                testTwo,
                testThree,
                exam
            });
        }

        res.send({
            message: "Assessment record created",
            result: createdAssessment
        });

    } catch (error) {
        next(error);
    }
}

export const updateAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        if(!req.body.testOne) req.body.testOne = 0;
        if(!req.body.testTwo) req.body.testTwo = 0;
        if(!req.body.testThree) req.body.testThree = 0;

        const {
            assessmentId,
            studentId,
            teacherId,
            subjectId,
            classId,
            year,
            testOne,
            testTwo,
            testThree,
            exam
        } = req.body;


        let updatedAssessment: any;

        if (req.userDetails?.role == "teacher") {

            updatedAssessment = await AssessmentCollection.findByIdAndUpdate(assessmentId, {
                testOne, testTwo, testThree, exam
            }, { new: true });
        } else {
            updatedAssessment = await AssessmentCollection.findByIdAndUpdate(assessmentId, {
                assessmentId,
                studentId,
                teacherId,
                subjectId,
                classId,
                year,
                testOne,
                testTwo,
                testThree,
                exam
            }, { new: true });
        }

        res.send({
            message: "Assessment record updated",
            result: updatedAssessment
        });

    } catch (error) {
        next(error);
    }
}

export const deleteAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const deletedAssessment = await AssessmentCollection.findByIdAndDelete(id);

        res.send({
            message: "Assessment deleted successfully",
            deletedAssessment
        });

    } catch (error) {
        next(error);
    }
}



interface TermYearClassId {
    term?: string;
    year?: string;
    studentClass?: string;
}

interface AffectiveAssessmentInterface extends TermYearClassId {
    affectiveAssessmentId?: string;
    creativity: string;
    neatness: string;
    respectSchoolRules: string;
    followDirection: string;
    readFluently: string;
    spiritOfCoperation: string;
    acceptsResponsibilities: string;
    completesHomeWork: string;
    memorizesScripturesAccurately: string;
    games: string;
    sports: string;
    artsAndCrafts: string;
    musicSkills: string;
    communicationSkills: string;
    studentId?: string;
}

const affectiveAssessmentValidator = Joi.object({
    creativity: Joi.string().valid("A", "B", "C", "D", "E").required().messages({
        "any.required": "Creativity valueis required",
        "number.base": "Creativity must be a number",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    neatness: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Neatness value is required",
        "string.empty": "Neatness can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    respectSchoolRules: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Respect school rule value is required",
        "string.empty": "Respect school rule can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    followDirection: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Follows direction value is required",
        "string.empty": "Follows direction can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    readFluently: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Reads fluently value is required",
        "string.empty": "Reads fluently can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    spiritOfCoperation: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Spirit of coperation value is required",
        "string.empty": "Spirit of coperation can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    acceptsResponsibilities: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Accepts responsibility value is required",
        "string.empty": "Accepts responsibility can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    completesHomeWork: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Completes homework value is required",
        "string.empty": "Completes homework can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    memorizesScripturesAccurately: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Memorizes Scriptures Accurately valueis required",
        "string.empty": "Memorizes Scriptures Accurately must be a string",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    games: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Games value is required",
        "string.empty": "Games can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    sports: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Sport is required",
        "string.empty": "Sports can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    artsAndCrafts: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Arts and crafts is required",
        "string.empty": "Arts and crafts can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    musicSkills: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Music skill is required",
        "string.empty": "Music skill can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    communicationSkills: Joi.string().required().valid("A", "B", "C", "D", "E").messages({
        "any.required": "Communication skill is required",
        "string.empty": "Communication skill can not be empty",
        'any.only': 'Color field must be one of: {{#valids}}.'
    }),
    term: Joi.string().optional().allow(""),
    year: Joi.string().optional().allow(""),
    studentClass: Joi.string().optional().allow(""),
    studentId: Joi.string().optional().allow("")
});


export const getClassTeacherClasses = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const result = await staffsCollection.findById(req.userDetails?.userId, "firstName otherNames surname classTeacherOf").populate("classTeacherOf");

        res.send({
            result
        });

    } catch (error) {
        next(error);
    }
}

export const affectiveAssessments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {
            term,
            year,
            studentClass,
        }: TermYearClassId = req.body;

        const schoolId = getSchoolId(req);

        const {error} = Joi.object({
            term: Joi.string().required().messages({
                "any.required": "Term is required",
                "string.empty": "Term can not be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year can not be empty"
            }),
            studentClass: Joi.string().required().messages({
                "any.required": "Student class is required",
                "string.empty": "Student class can not be empty"
            })
        }).validate({
            term, year, studentClass
        });


        if(error) {
            res.status(422).send({
                errorMessage: error.message
            });
            return;
        }

        const {page, limit} = req.params;

        const result = await affectiveAssessmentCollection.find({
            schoolId, studentClass, year, term
        });

        const students = await studentsCollection.paginate({
            classId: studentClass,
            schoolId
        }, {page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 10, populate: "classId"});

        res.send({
            result,
            students
        });

    } catch (error) {
        next(error);
    }
}

export const createAffectiveAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const {
            studentId,
            term,
            year,
            studentClass,
            creativity,
            neatness,
            respectSchoolRules,
            followDirection,
            readFluently,
            spiritOfCoperation,
            acceptsResponsibilities,
            completesHomeWork,
            memorizesScripturesAccurately,
            games,
            sports,
            artsAndCrafts,
            musicSkills,
            communicationSkills
        }: AffectiveAssessmentInterface = req.body;

        console.log(req.body);

        const {error} = affectiveAssessmentValidator.validate({
            studentId,
            term,
            year,
            studentClass,
            creativity,
            neatness,
            respectSchoolRules,
            followDirection,
            readFluently,
            spiritOfCoperation,
            acceptsResponsibilities,
            completesHomeWork,
            memorizesScripturesAccurately,
            games,
            sports,
            artsAndCrafts,
            musicSkills,
            communicationSkills
        });

        if(error) {
            res.status(422).send({
                message: error.message
            });
            return;
        }

        const exists = await affectiveAssessmentCollection.findOne({
            studentId, studentClass, term, year, schoolId: req.userDetails?.schoolId
        });

        if(!exists) {
            const newAffectiveAssessment = await affectiveAssessmentCollection.create({
                studentId,
                term,
                year,
                creativity,
                neatness,
                respectSchoolRules,
                followDirection,
                readFluently,
                studentClass,
                spiritOfCoperation,
                acceptsResponsibilities,
                completesHomeWork,
                memorizesScripturesAccurately,
                games,
                sports,
                artsAndCrafts,
                musicSkills,
                communicationSkills,
                schoolId: req.userDetails?.schoolId
            });
    
            res.status(201).send({
                message: "Affective assessment created",
                result: newAffectiveAssessment
            });
        } else {
            const result = await affectiveAssessmentCollection.findOneAndUpdate({
                studentId, studentClass, term, year, schoolId: req.userDetails?.schoolId
            }, {
                creativity,
                neatness,
                respectSchoolRules,
                followDirection,
                readFluently,
                spiritOfCoperation,
                acceptsResponsibilities,
                completesHomeWork,
                memorizesScripturesAccurately,
                games,
                sports,
                artsAndCrafts,
                musicSkills,
                communicationSkills
            }, {new: true});
    
            res.send({
                message: "Affective assessment updated",
                result
            });
        }


    } catch (error) {
        next(error);
    }
}

// export const updateAffectiveAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
//     try {
        
//         const {
//             affectiveAssessmentId,
//             creativity,
//             neatness,
//             respectSchoolRules,
//             followDirection,
//             readFluently,
//             spiritOfCoperation,
//             acceptsResponsibilities,
//             completesHomeWork,
//             memorizesScripturesAccurately,
//             games,
//             sports,
//             artsAndCrafts,
//             musicSkills,
//             communicationSkills,
//         }: AffectiveAssessmentInterface = req.body;
//         console.log("request body", req.body);

        

//     } catch (error) {
//         next(error);
//     }
// }

export const deleteAffectiveAssessment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const {id} = req.params;

        const affectiveAssessmentDeleted = await affectiveAssessmentCollection.findByIdAndDelete(id);

        res.send({
            message: "Affective assessment deleted successfully",
            affectiveAssessmentDeleted
        });

    } catch (error) {
        next(error);
    }
}
