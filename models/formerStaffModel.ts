import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const formerStaffSchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "staffs",
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    classTeacherOf: {
      type: [{ type: Schema.Types.ObjectId, ref: "schoolclasses" }],
    },

    subjectTeacherOf: {
      type: [
        {
          subjectId: { type: Schema.Types.ObjectId, ref: "subjects" },
          classId: { type: Schema.Types.ObjectId, ref: "schoolclasses" },
        },
      ], // Array of subjectId and classId
    },

    // Date you left the school
    dateRemoved: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

type formerStaffCollectionType = InferSchemaType<typeof formerStaffSchema>;

formerStaffSchema.plugin(paginate);

const formerStaffCollection = model<
  formerStaffCollectionType,
  PaginateModel<formerStaffCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, formerStaffCollectionType>
>("formerStaff", formerStaffSchema);

export { formerStaffCollection, formerStaffCollectionType };
