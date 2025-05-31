import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const formerSchoolSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },

    // Year you were admitted to the school
    yearAdmitted: {
      type: String,
      unique: true,
      required: true,
    },

    // Year you left the school
    yearRemoved: {
      type: String,
      required: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
    }
  },
  { timestamps: true }
);

type formerSchoolCollectionType = InferSchemaType<typeof formerSchoolSchema>;

formerSchoolSchema.plugin(paginate);

const formerSchoolCollection = model<
  formerSchoolCollectionType,
  PaginateModel<formerSchoolCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, formerSchoolCollectionType>
>("formerschool", formerSchoolSchema);

export { formerSchoolCollection, formerSchoolCollectionType };
