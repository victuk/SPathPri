import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const adminAffectiveAssessmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true
    },
    typeSlug: {
      type: String,
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

type adminAffectiveAssessmentCollectionType = InferSchemaType<
  typeof adminAffectiveAssessmentSchema
>;

adminAffectiveAssessmentSchema.plugin(paginate);

const adminAffectiveAssessmentCollection = mongoose.model<
  adminAffectiveAssessmentCollectionType,
  PaginateModel<adminAffectiveAssessmentCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, adminAffectiveAssessmentCollectionType>
>("adminaffectiveassessment", adminAffectiveAssessmentSchema);

export {
  adminAffectiveAssessmentCollection,
  adminAffectiveAssessmentCollectionType,
};
