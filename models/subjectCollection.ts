import {Schema, InferSchemaType, model} from "mongoose";
import paginate from "mongoose-paginate-v2";

const subjectSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {timestamps: true});

type subjectCollectionType = InferSchemaType<typeof subjectSchema>;

subjectSchema.plugin(paginate);

const subjectCollection = model("subjects", subjectSchema);

export {subjectCollection, subjectCollectionType};
