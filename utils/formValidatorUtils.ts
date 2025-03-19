import Joi from "joi";

export const teacherRegistrationSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(30).required(),
  surname: Joi.string().trim().min(3).max(30).required(),
  otherNames: Joi.string().trim().optional(),
  email: Joi.string().trim()
    .email({ tlds: { allow: false } })
    .required(),
  profilePic: Joi.string().trim().required(),
  gender: Joi.string().trim().valid("male", "female"),
  phoneNumber: Joi.string().trim().min(11).required(),
  classTeacherOf: Joi.array().items(Joi.string()).min(0),
  subjectTeacherOf: Joi.array().items(Joi.string()).min(1),
  stateOfOrigin: Joi.string().trim().required(),
  lgaOfOrigin: Joi.string().trim().required(),
//   password: Joi.string().trim()
//     .min(8)
//     .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
//     .required(),
});

export const studentRegistrationSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(30).required().messages({
    "any.required": "Kindly input your first name"
  }),
  surname: Joi.string().trim().min(3).max(30).required().messages({
    "any.required": "Kindly input your surname"
  }),
  otherNames: Joi.string().allow("").trim(),
  email: Joi.string().trim()
    .email({ tlds: { allow: false } })
    .required().messages({
        "any.required": "Kindly input a valid email"
      }),
  profilePic: Joi.string().trim().required().messages({
    "any.required": "Kindly upload a valid profile picture"
  }),
  studentClassAndCategory: Joi.string().trim().invalid("undecided").required(),
  studentTrack: Joi.string().invalid("undecided").required(),
  admissionTerm: Joi.string().trim().required(),
  admissionYear: Joi.string().trim().required(),
  gender: Joi.string().trim().valid("male", "female").required(),
  phoneNumber: Joi.string().trim().min(11).required(),
  dateOfBirth: Joi.date().less("now").required(),
  stateOfOrigin: Joi.string().trim().required(),
  lgaOfOrigin: Joi.string().trim().required(),
  password: Joi.string().trim()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9@#_-]{8,30}$"))
    .required()
});

export const loginSchema = Joi.object({
  emailOrPhoneNumber: Joi.string().trim().min(8).required(),
  password: Joi.string().trim()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
});
