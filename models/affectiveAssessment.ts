import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const affectiveAssessmentSchema = new Schema(
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

    // Affective assessment

    creativity: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    neatness: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    respectSchoolRules: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    followDirection: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    readFluently: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    spiritOfCoperation: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    acceptsResponsibilities: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    completesHomeWork: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    memorizesScripturesAccurately: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    // Psychomotor assessment

    games: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    sports: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    artsAndCrafts: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    musicSkills: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    communicationSkills: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      default: null,
    },

    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },
  },
  { timestamps: true }
);

type affectiveAssessmentCollectionType = InferSchemaType<
  typeof affectiveAssessmentSchema
>;

affectiveAssessmentSchema.plugin(paginate);

const affectiveAssessmentCollection = mongoose.model<
  affectiveAssessmentCollectionType,
  PaginateModel<affectiveAssessmentCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, affectiveAssessmentCollectionType>
>("affectiveAssessment", affectiveAssessmentSchema);

export {
  affectiveAssessmentCollection,
  affectiveAssessmentCollectionType,
};
