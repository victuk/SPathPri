import mongoose, { InferSchemaType, PaginateModel, Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    assignmentTitle: {
        type: String,
        required: true
    },
    assignment: {
        type: String,
        default: null
    },
    subjectId: {
        type: Types.ObjectId,
        ref: "subjects",
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
    assignmentStatus: {
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

type assignmentCollectionType = InferSchemaType<typeof assignmentSchema>;

assignmentSchema.plugin(paginate);

const assignmentCollection = mongoose.model<assignmentCollectionType, PaginateModel<assignmentCollectionType> & SoftDeleteModel<SoftDeleteDocument, assignmentCollectionType>>('assignments', assignmentSchema);

export { assignmentCollection, assignmentCollectionType };