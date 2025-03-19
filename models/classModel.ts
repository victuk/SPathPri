import { Schema, InferSchemaType, model, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";

const schoolClassSchema = new Schema(
  {
    schoolClass: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      default: null,
    },
  },
  { timestamps: true }
);

type schoolClassCollectionType = InferSchemaType<typeof schoolClassSchema>;

schoolClassSchema.plugin(paginate);

const schoolClassCollection = model("schoolclasses", schoolClassSchema);

export { schoolClassCollection, schoolClassCollectionType };
