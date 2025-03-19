import mongoose, { InferSchemaType, PaginateModel, Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const curriculumSchema = new Schema({
    uploadedById: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    classId: {
        type: Types.ObjectId,
        ref: "schoolclasses",
        required: true
    },
    fileLink: {
        type: String,
        required: true
    },
    curriculumStatus: {
        type: String,
        enum: ["archived", "draft", "active"],
        default: "active"
    },
    schoolId: {
        type: Types.ObjectId,
        ref: "schools",
        required: true
    }
},
{ timestamps: true });

type curriculumCollectionType = InferSchemaType<typeof curriculumSchema>;

curriculumSchema.plugin(paginate);

const curriculumCollection = mongoose.model<curriculumCollectionType, PaginateModel<curriculumCollectionType> & SoftDeleteModel<SoftDeleteDocument, curriculumCollectionType>>('curriculums', curriculumSchema);

export { curriculumCollection, curriculumCollectionType };