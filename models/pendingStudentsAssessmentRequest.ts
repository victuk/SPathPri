import {Schema, InferSchemaType, model, Types, PaginateModel} from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const pendingStudentsAssessmentRequestSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "students",
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref:"staffs",
        required: true
    },
    requestMadeBy: {
        type: Schema.Types.ObjectId,
        ref:"staffs",
        required: true
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref:"subjects",
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref:"schoolclasses",
        required: true
    },
    studentAssessmentId: {
        type: Schema.Types.ObjectId,
        ref:"results",
        required: true
    },
    testOne: {
        type: Number,
        required: true
    },
    testTwo: {
        type: Number,
        required: true
    },
    testThree: {
        type: Number,
        required: true
    },
    exam: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending"
    },
    schoolId: {
          type: Types.ObjectId,
          ref: "schoolprofile",
          default: null,
        },
}, {timestamps: true});

type pendingStudentsAssessmentRequestCollectionType = InferSchemaType<typeof pendingStudentsAssessmentRequestSchema>;

pendingStudentsAssessmentRequestSchema.plugin(paginate);

const pendingStudentsAssessmentRequestCollection = model<pendingStudentsAssessmentRequestCollectionType, PaginateModel<pendingStudentsAssessmentRequestCollectionType> & SoftDeleteModel<SoftDeleteDocument, pendingStudentsAssessmentRequestCollectionType>>("pendingstudentassessments", pendingStudentsAssessmentRequestSchema);

export {pendingStudentsAssessmentRequestCollection, pendingStudentsAssessmentRequestCollectionType};
