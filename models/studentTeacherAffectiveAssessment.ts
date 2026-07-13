import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const studentTeacherAffectiveAssessmentSchema = new Schema(
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
      required: true,
    },
    year: {
      type: String,
      required: true,
    },

    affectiveAssessment: {
      type: [
        {
          assessmentId: {
            type: Types.ObjectId,
            ref: "adminaffectiveassessment",
            required: true,
          },
          score: {
            type: String,
            enum: ["A", "B", "C", "D", "E", "F"],
            required: true
          }
        }
      ],
      required: true
    },

    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },
  },
  { timestamps: true }
);

type studentTeacherAffectiveAssessmentCollectionType = InferSchemaType<
  typeof studentTeacherAffectiveAssessmentSchema
>;

studentTeacherAffectiveAssessmentSchema.plugin(paginate);

const studentTeacherAffectiveAssessmentCollection = mongoose.model<
  studentTeacherAffectiveAssessmentCollectionType,
  PaginateModel<studentTeacherAffectiveAssessmentCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, studentTeacherAffectiveAssessmentCollectionType>
>("studentTeacherAffectiveAssessment", studentTeacherAffectiveAssessmentSchema);

export {
  studentTeacherAffectiveAssessmentCollection,
  studentTeacherAffectiveAssessmentCollectionType,
};
