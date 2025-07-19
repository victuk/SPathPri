import {Schema, InferSchemaType, model, PaginateModel, Types} from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const StudentsScratchCardSchema = new Schema({
    scratchCardId: {
        type: String,
        required: true
    },
    studentId: {
        type: Types.ObjectId,
        ref: "students",
        default: null
    },
    remainingUsageNumber: {
        type: Number,
        default: 5
    },
    term: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    schoolId: {
        type: Types.ObjectId,
        ref: "schoolprofile",
        default: null
    },
    dateIssued: {
        type: Date,
        default: null
    }
}, {timestamps: true});

type StudentsScratchCardCollectionType = InferSchemaType<typeof StudentsScratchCardSchema>;

StudentsScratchCardSchema.plugin(paginate);

const StudentsScratchCardCollection = model<StudentsScratchCardCollectionType, PaginateModel<StudentsScratchCardCollectionType> & SoftDeleteModel<SoftDeleteDocument, StudentsScratchCardCollectionType>>("studentsscrarchcard", StudentsScratchCardSchema);

export {StudentsScratchCardCollection, StudentsScratchCardCollectionType};
