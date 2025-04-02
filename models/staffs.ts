import {Schema, InferSchemaType, model, PaginateModel, Types} from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";


const staffsSchema = new Schema({
    firstName: {
        type: String
    },

    otherNames: {
        type: String
    },

    surname: {
        type: String
    },

    staffUid: {
        type: String,
        unique: true,
        required: true
    },

    email: {
        type: String,
        unique: true
    },

    emailVerified: {
        type: Boolean,
        default: false
    },

    profilePic: {
        type: String,
        default: null
    },

    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },

    phoneNumber: {
        type: String,
        default: null
    },

    phoneNumberVerified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ["teacher", "admin", "record-keeper", "super-admin"]
    },

    classTeacherOf: {
        type: [{type: Schema.Types.ObjectId, ref: "schoolclasses"}],
    },

    subjectTeacherOf: {
        type: [
            {
                subjectId: {type: Schema.Types.ObjectId, ref: "subjects"},
                classId: {type: Schema.Types.ObjectId, ref: "schoolclasses"}
            }
        ], // Array of subjectId and classId
    },

    password: {
        type: String,
        required: true
    },
    stateOfOrigin: {
        type: String,
        // required: true
    },
    lgaOfOrigin: {
        type: String,
        // required: true
    },
    accountStatus: {
        type: String,
        enum: ["active", "new", "inactive", "suspended", "archived"],
        default: "new"
    },
    allowAdminEditAssessment: {
        type: Boolean,
        default: true
    },
    schoolId: {
        type: Types.ObjectId,
        ref: "schoolprofile",
        default: null
    }
}, {timestamps: true});

type staffsCollectionType = InferSchemaType<typeof staffsSchema>;

staffsSchema.plugin(paginate);

const staffsCollection = model<staffsCollectionType, PaginateModel<staffsCollectionType> & SoftDeleteModel<SoftDeleteDocument, staffsCollectionType>>("staffs", staffsSchema);

export {
    staffsCollection,
    staffsCollectionType
};