import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const formerStudentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },

    formerClass: {
      type: Schema.Types.ObjectId,
      ref: "schoolclasses",
      required: true,
    },

    // Date you left the school
    dateRemoved: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

type formerStudentCollectionType = InferSchemaType<typeof formerStudentSchema>;

formerStudentSchema.plugin(paginate);

const formerStudentCollection = model<
  formerStudentCollectionType,
  PaginateModel<formerStudentCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, formerStudentCollectionType>
>("formerStudent", formerStudentSchema);

export { formerStudentCollection, formerStudentCollectionType };
