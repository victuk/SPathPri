import { Schema, InferSchemaType, model, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";

const whatsappSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    step: {
      type: String,
      required: true,
    },
    subStep: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      default: null
    },
  },
  { timestamps: true }
);

type whatsappSessionCollectionType = InferSchemaType<typeof whatsappSessionSchema>;

whatsappSessionSchema.plugin(paginate);

const whatsappSessionCollection = model("whatsappsessions", whatsappSessionSchema);

export { whatsappSessionCollection, whatsappSessionCollectionType };
