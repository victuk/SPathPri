import { Schema, InferSchemaType, model, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";

const userSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true
    },
    platform: {
      type: String
    },
    browser: {
      type: String
    },
    lastLogin: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

type userSessionCollectionType = InferSchemaType<typeof userSessionSchema>;

userSessionSchema.plugin(paginate);

const userSessionCollection = model("usersessions", userSessionSchema);

export { userSessionCollection, userSessionCollectionType };
