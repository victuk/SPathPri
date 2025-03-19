import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    surname: String,
    otherNames: String,
    gender: String,
    passportPicture: String,
    passportPublicId: String,
    dateOfBirth: Date,
    studentClass: {
        type: String,
        enum: ['js1', 'js2', 'js3', 'ss1', 'ss2', 'ss3'],
    },
    parentRole: String,
    parentName: String,
    parentEmail: String,
    newStudent: Boolean,
    parentPhone: String,
    subjectsClass: [
        {
            subjectName: String,
            subjectCode: String,
            subjectClass: String
        }
    ],
    classTeacherOf: String,
    admissionTerm: String,
    admissionYear: String,
    admissionStr: String,
    admissionNumber: String,
    phoneNumber: String,
    stateOfOrigin: String,
    localGovernmentOfOrigin: String,
    admitted: Boolean,
    email: {
        type: String,
        unique: true
    },
    category: {
        type: String,
        enum: ['general', 'science', 'arts', 'social-science']
    },
    password: String,
    role: String,
    emailVerified: Boolean,
    suspended: Boolean
},
{ timestamps: true });

const usersDB = mongoose.model('users', userSchema);

export { usersDB };
