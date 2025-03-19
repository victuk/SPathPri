import { Schema, InferSchemaType, model, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const StudentsSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    studentUid: {
        type: String,
        unique: true,
        required: true
    },
    otherNames: {
        type: String,
        required: false
    },
    surname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    profilePic: {
        type: String,
        default: null
    },
    lgaOfOrigin: {
        type: String,
        required: true
    },
    stateOfOrigin: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ["active", "new", "inactive", "suspended", "archived"],
        default: "active"
    },
    phoneNumber: {
        type: String,
        default: null
    },
    phoneNumberVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: "schoolclasses",
        required: true
    },
    admissionYear: {
        type: String,
        required: true
    },
    admissionTerm: {
        type: String,
        required: true
    },
    studentTrack: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "I am amazing!"
    },
    parentName: {
        type: String,
        default: null
    },
    parentEmail: {
        type: String,
        default: null
    },
    parentPhoneNumber: {
        type: String,
        default: null
    },
    schoolId: {
        type: Types.ObjectId,
        ref: "schoolprofile",
        default: null
    }
}, { timestamps: true });

type studentsCollectionType = InferSchemaType<typeof StudentsSchema>;

StudentsSchema.plugin(paginate);

const studentsCollection = model<studentsCollectionType, PaginateModel<studentsCollectionType> & SoftDeleteModel<SoftDeleteDocument, studentsCollectionType>>("students", StudentsSchema);

export { studentsCollection, studentsCollectionType };
