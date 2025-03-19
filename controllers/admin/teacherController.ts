import { NextFunction, Response } from "express";
import { usersDB } from "../../models/usersModel";
import {
    generateRandomHex,
    transporter
} from '../../utils/userUtil';
import statusCodes from "readable-http-codes";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";

import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/emailUtilities";
import { teacherCollection } from "../../models/staffs";
import { hashPassword } from "../../utils/authUtilities";
import { teacherRegistrationSchema } from "../../utils/formValidatorUtils";

async function addTeacher(req: CustomRequest, res: Response, next: NextFunction) {
    const {
        firstName,
        surname,
        otherNames,
        email,
        profilePic,
        gender,
        phoneNumber,
        classTeacherOf,
        subjectTeacherOf,
        stateOfOrigin,
        lgaOfOrigin
      } = req.body;

      const {error} = teacherRegistrationSchema.validate({
        firstName,
        surname,
        otherNames,
        email,
        profilePic,
        gender,
        phoneNumber,
        classTeacherOf,
        subjectTeacherOf,
        stateOfOrigin,
        lgaOfOrigin
      });

      if(error) {
        res.status(statusCodes.BAD_REQUEST).send({
          errorMessage: error.message
        });
        return;
      }
      
      const emailAlreadyExist = await teacherCollection.exists({email});

      if(emailAlreadyExist) {
        res.status(statusCodes.CONFLICT).send({
          errorMessage: "Email already exist"
        });
        return;
      }

      const phoneNumberAlreadyExist = await teacherCollection.exists({phoneNumber});

      if(phoneNumberAlreadyExist) {
        res.status(statusCodes.CONFLICT).send({
          errorMessage: "Phone number already exist"
        });
        return;
      }

        const userPassword = generateRandomHex(8);
        const hashedPassword = hashPassword(userPassword);
    
        const newUser =  await teacherCollection.create({
          firstName,
          surname,
          otherNames,
          email,
          emailVerified: true,
          profilePic,
          gender,
          phoneNumber,
          classTeacherOf,
          subjectTeacherOf,
          stateOfOrigin,
          lgaOfOrigin,
          password: hashedPassword
        });
        
        await sendEmail({
          to: email,
          subject: `School - Email Verification`,
          body: `
                        <div style="padding: 20px">
                              
                            <div>
                              <div>Hello ${newUser.firstName} ${newUser.surname}, here are your login details:</div>
                              
                              <div>Email: ${email}</div>
                              <div>Password: ${userPassword}</div>
                            </div>
    
                            <style>
                                  div, a {
                                    padding: 20px 10px;
                                  }
                            </style>
                        </div>
                        `,
        });
    
        res.status(201).json({
          message: "teacher created.",
        });
      
}

async function searchTeacherByName(req: CustomRequest, res: Response, next: NextFunction) {
  const { firstName, surname } = req.params;

  const searchResult = await usersDB.find({firstName, surname, role: 'teacher'}, 'firstName surName otherNames gender passportPicture passportPublicId subjectsClass stateOfOrigin category email role classTeacherOf createdAt updatedAt');

  res.json({
    searchResult
  });
}

async function searchTeacherByEmail(req: CustomRequest, res: Response, next: NextFunction) {
  const { email } = req.params;

  const searchResult = await usersDB.find({email, role: 'teacher'}, 'firstName surName otherNames gender passportPicture passportPublicId subjectsClass stateOfOrigin localGovernmentOfOrigin email role classTeacherOf createdAt updatedAt');

  res.json({
    searchResult
  });
}

async function specificTeacher(req: CustomRequest, res: Response, next: NextFunction) {
  const { id: teacherID } = req.params;

  const teacherDetails = await usersDB.findById(teacherID, 'firstName surName otherNames gender passportPicture passportPublicId subjectsClass stateOfOrigin localGovernmentOfOrigin email role classTeacherOf createdAt updatedAt');
  res.json({
    teacherDetails
  });
}

async function getEveryTeacher(req: CustomRequest, res: Response, next: NextFunction) {
  const searchResult = await usersDB.find({role: 'teacher'}, 'firstName surName otherNames gender passportPicture passportPublicId subjectsClass stateOfOrigin localGovernmentOfOrigin email role classTeacherOf createdAt updatedAt');

  res.json({
    searchResult
  });
}

// async function changeTeacherDetails(req, res) {
//   const {
//       firstName,
//       surName,
//       otherNames,
//       gender,
//       passportPicture,
//       passportPublicId,
//       email,
//       classTeacherOf,
//       subjectsClass,
//       stateOfOrigin,
//       localGovernmentOfOrigin
//     } = req.body;

//     const {id: studentID} = req.params;

//   if (
//       firstName &&
//       surName &&
//       otherNames &&
//       gender &&
//       passportPicture &&
//       passportPublicId &&
//       email &&
//       classTeacherOf &&
//       subjectsClass &&
//       stateOfOrigin &&
//       localGovernmentOfOrigin) {
//     await usersDB.findByIdAndUpdate(studentID, {
//       firstName,
//       surName,
//       otherNames,
//       gender,
//       passportPicture,
//       passportPublicId,
//       email,
//       classTeacherOf,
//       subjectsClass,
//       stateOfOrigin,
//       localGovernmentOfOrigin
//     });

//     res.json({
//       message: "Student detail updated successfully.",
//     });
//   } else {
//     res.status(400).json({
//       message: "Incomplete details.",
//     });
//   }
// }

export {
    addTeacher,
    searchTeacherByName,
    searchTeacherByEmail,
    specificTeacher,
    getEveryTeacher
};