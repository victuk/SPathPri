import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const classPositionAndRemarksSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    classTeacherId: {
      type: Schema.Types.ObjectId,
      ref: "staffs",
      default: null,
    },
    studentClass: {
      type: Schema.Types.ObjectId,
      ref: "schoolclasses",
      required: true,
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
    position: {
      type: String,
      default: null,
    },
    studentSubjectTotal: {
      type: Number,
      default: 0,
    },
    studentSubjectAverage: {
      type: Number,
      default: 0,
    },
    classTeacherRemark: {
      type: String,
      default: null,
    },
    principalsRemark: {
      type: String,
      default: null
    },
    verdict: {
      type: String,
      enum: ["promoted", "promoted-on-trial", "pass", "fail"],
      required: true,
    },
    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    }
  },
  { timestamps: true }
);

type classPositionAndRemarksCollectionType = InferSchemaType<typeof classPositionAndRemarksSchema>;

classPositionAndRemarksSchema.plugin(paginate);

const classPositionAndRemarksCollection = mongoose.model<
  classPositionAndRemarksCollectionType,
  PaginateModel<classPositionAndRemarksCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, classPositionAndRemarksCollectionType>
>("classpositionandremarks", classPositionAndRemarksSchema);

export { classPositionAndRemarksCollection, classPositionAndRemarksCollectionType };
