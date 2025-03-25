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
      required: true,
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
      default: null,
    },
    verdict: {
      type: String,
      enum: ["promoted", "promoted-on-trial", "pass", "fail"],
      required: true,
    },

    // Affective assessment

    creativity: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    neatness: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    respectSchoolRules: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    followDirection: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    readFluently: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    spiritOfCoperation: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    acceptsResponsibilities: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    completesHomeWork: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    memorizesScripturesAccurately: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    // Psychomotor assessment

    games: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    sports: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    artsAndCrafts: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    musicSkills: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    communicationSkills: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },

    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      required: true,
    },
  },
  { timestamps: true }
);

type classPositionAndRemarksCollectionType = InferSchemaType<
  typeof classPositionAndRemarksSchema
>;

classPositionAndRemarksSchema.plugin(paginate);

const classPositionAndRemarksCollection = mongoose.model<
  classPositionAndRemarksCollectionType,
  PaginateModel<classPositionAndRemarksCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, classPositionAndRemarksCollectionType>
>("classpositionandremarks", classPositionAndRemarksSchema);

export {
  classPositionAndRemarksCollection,
  classPositionAndRemarksCollectionType,
};
