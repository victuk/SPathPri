import {Schema, InferSchemaType, model, Types} from "mongoose";
import paginate from "mongoose-paginate-v2";

const AssessmentSchema = new Schema({
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
    subjectId: {
        type: Schema.Types.ObjectId,
        ref:"subjects",
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref:"classes",
        required: true
    },
    term: {
        type: String,
        required: true
    },
    year: {
        type: String,
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
    schoolId: {
          type: Types.ObjectId,
          ref: "schoolprofile",
          default: null,
        },
}, {timestamps: true});

type AssessmentCollectionType = InferSchemaType<typeof AssessmentSchema>;

AssessmentSchema.plugin(paginate);

const AssessmentCollection = model("studentAssessments", AssessmentSchema);

export {AssessmentCollection, AssessmentCollectionType};
