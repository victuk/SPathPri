import { Schema, InferSchemaType, model, PaginateModel } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const schoolProfileSchema = new Schema(
  {
    schoolName: {
      type: String,
      required: true,
    },

    schoolUid: {
      type: String,
      unique: true,
      required: true,
    },

    schoolLogo: {
      type: String,
      required: true,
    },

    schoolMotto: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true
    },

    schoolEmail: {
      type: String,
      unique: true,
    },

    schoolPhoneNumber: {
      type: String,
    },

    currentTerm: {
      type: String,
      enum: ["first-term", "second-term", "third-term"],
      required: true,
    },

    currentYear: {
      type: String,
      required: true,
    },

    openingDate: {
      type: String,
      default: null
    },

    newsletterUrl: {
        type: String,
        default: null
    },

    gradingSystem: {
      type: String,
      enum: ["grading-system-1", "grading-system-2"],
      required: true
    },
    
    accountStatus: {
      type: String,
      default: "active",
      enum: ["active", "suspended"]
    }

  },
  { timestamps: true }
);

type schoolProfileCollectionType = InferSchemaType<typeof schoolProfileSchema>;

schoolProfileSchema.plugin(paginate);

const schoolProfileCollection = model<
  schoolProfileCollectionType,
  PaginateModel<schoolProfileCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, schoolProfileCollectionType>
>("schoolprofile", schoolProfileSchema);

export { schoolProfileCollection, schoolProfileCollectionType };
