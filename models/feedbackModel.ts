import mongoose, { InferSchemaType, PaginateModel, Types } from "mongoose";
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    userId: {
      type: String,
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: null
    },
    secondEmail: {
        type: String,
        default: null
    },
    ticketAddressedTo: {
        type: String,
        enum: ["school-admin", "solvpath"],
        required: true
    },
    userType: {
        type: String,
      },
      feedbackType: {
        enum: ["feedback", "complaint", "others"],
        type: String,
      },
      title: {
        type: String,
        required: true
      },
      feedback: {
        type: String,
        required: true
      },
      ticketStatus: {
        type: String,
        enum: ["open", "resolved", "closed", "re-opened"],
        default: "open"
      },
      schoolId: {
        type: Types.ObjectId,
        ref: "schoolprofile",
        required: true,
      }
  },
  { timestamps: true }
);

type feedbackCollectionType = InferSchemaType<
  typeof feedbackSchema
>;

feedbackSchema.plugin(paginate);

const feedbackCollection = mongoose.model<
  feedbackCollectionType,
  PaginateModel<feedbackCollectionType> &
    SoftDeleteModel<SoftDeleteDocument, feedbackCollectionType>
>("feedback", feedbackSchema);

export {
  feedbackCollection,
  feedbackCollectionType,
};
