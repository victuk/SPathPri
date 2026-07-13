import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const classTeacherAffectiveAssessmentSchema = new Schema(
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

    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },

    // Affective assessment

    classTeacherAffectiveAssessments: {
      type: [
        {
          _id: {
            type: Types.ObjectId,
            required: true
          },
          title: {
            type: String,
            required: true
          },
          type: {
            type: String,
            required: true
          },
          typeSlug: {
            type: String,
            required: true,
          },
          score: {
            type: String,
            enum: ["A", "B", "C", "D", "E"],
            required: true,
          },
        }
      ],
      required: true
    }

    
  },
  { timestamps: true }
);

type classTeacherAffectiveAssessmentCollectionType = InferSchemaType<
  typeof classTeacherAffectiveAssessmentSchema
>;

classTeacherAffectiveAssessmentSchema.plugin(paginate);

const classTeacherAffectiveAssessmentCollection = mongoose.model<
  classTeacherAffectiveAssessmentCollectionType,
  PaginateModel<classTeacherAffectiveAssessmentCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, classTeacherAffectiveAssessmentCollectionType>
>("classTeacherAffectiveAssessment", classTeacherAffectiveAssessmentSchema);

export {
  classTeacherAffectiveAssessmentCollection,
  classTeacherAffectiveAssessmentCollectionType,
};
