import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import paginate  from "mongoose-paginate-v2";
import {SoftDeleteModel, SoftDeleteDocument} from 'mongoose-delete';

const superAdminSchema = new Schema({
    firstName: {
        type: String
    },

    otherNames: {
        type: String
    },

    surname: {
        type: String
    },

    email: {
        type: String,
        unique: true
    },

    emailVerified: {
        type: Boolean,
        default: false
    },

    phoneNumber: {
        type: String,
        default: null
    },

    phoneNumberVerified: {
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

    role: {
        type: String,
        enum: ["super-admin", "customer-care"]
    },

    password: {
        type: String,
        required: true
    },
    accountStatus: {
        type: String,
        enum: ["active", "new", "inactive", "suspended", "archived"],
        default: "new"
    },
}, {timestamps: true});

type superAdminCollectionType = InferSchemaType<typeof superAdminSchema>;


superAdminSchema.plugin(paginate);

const superAdminCollection = model<superAdminCollectionType, PaginateModel<superAdminCollectionType> & SoftDeleteModel<SoftDeleteDocument, superAdminCollectionType>>("superadmins", superAdminSchema);

export {
    superAdminCollection,
    superAdminCollectionType
};