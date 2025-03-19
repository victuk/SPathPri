import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const resultSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "staffs",
      default: null,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
    },
    studentClass: {
      type: Schema.Types.ObjectId,
      ref: "schoolclasses",
      required: true,
    },
    studentClassCategory: {
      type: String,
      default: null,
    },
    term: {
      type: String,
      enum: ["first-term", "second-term", "third-term"],
      required: true
    },
    year: {
      type: String,
      required: true,
    },
    testOne: {
      type: Number,
      default: 0,
    },
    testTwo: {
      type: Number,
      default: 0,
    },
    testThree: {
      type: Number,
      default: 0,
    },
    examScore: {
      type: Number,
      default: 0,
    },
    testsAndExamTotal: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: null
    },
    remark: {
      type: String,
      default: null
    },
    subjectTeacherRemark: {
      type: String,
      default: null,
    },
    subjectPosition: {
      type: String,
      default: null
    },
    subjectAverage: {
      type: Number,
      default: 0
    },
    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    }
  },
  { timestamps: true }
);

type resultCollectionType = InferSchemaType<typeof resultSchema>;

resultSchema.plugin(paginate);

const resultCollection = mongoose.model<
  resultCollectionType,
  PaginateModel<resultCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, resultCollectionType>
>("results", resultSchema);

export { resultCollection, resultCollectionType };
