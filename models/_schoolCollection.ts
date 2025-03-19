import {Schema, InferSchemaType, model, PaginateModel} from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const schoolsSchema = new Schema({
    ownerName: {
        type: String,
        required: true
    },
    schoolName: {
        type: String,
        required: false
    },
    schoolLogo: {
        type: String,
        required: true
    },
    schoolAddress: {
        type: String,
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
    motto: {
        type: String,
        required: true
    }
}, {timestamps: true});

type schoolsCollectionType = InferSchemaType<typeof schoolsSchema>;

schoolsSchema.plugin(paginate);

const schoolsCollection = model<schoolsCollectionType, PaginateModel<schoolsCollectionType> & SoftDeleteModel<SoftDeleteDocument, schoolsCollectionType>>("schools", schoolsSchema);

export {schoolsCollection, schoolsCollectionType};
