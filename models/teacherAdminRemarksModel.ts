import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const teacherAdminRemarksSchema = new Schema(
  {
    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },
    classTeachersRemark: {
      type: String,
      default: null
    },
    principalsRemark: {
      type: String,
      default: null
    },
    minimum: {
      type: Number,
      required: true
    },
    maximum: {
      type: Number,
      required: true
    },
    includeImprovementSubjects: {
      type: Boolean,
      required: true
    },
    verdict: {
      type: String,
      enum: ["promoted", "pass", "fail"],
      required: true
    }
  },
  { timestamps: true }
);

type teacherAdminRemarksCollectionType = InferSchemaType<typeof teacherAdminRemarksSchema>;

teacherAdminRemarksSchema.plugin(paginate);

const teacherAdminRemarksCollection = mongoose.model<
  teacherAdminRemarksCollectionType,
  PaginateModel<teacherAdminRemarksCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, teacherAdminRemarksCollectionType>
>("teacheradminremarks", teacherAdminRemarksSchema);

export { teacherAdminRemarksCollection, teacherAdminRemarksCollectionType };
