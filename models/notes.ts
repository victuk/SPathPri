import {Schema, InferSchemaType, model} from "mongoose";
import paginate from "mongoose-paginate-v2";

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    noteBody: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    noteCategory: {
        type: Schema.Types.ObjectId,
        ref: "noteCategories",
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "teachers",
        required: true
    }
}, {timestamps: true});

type noteCollectionType = InferSchemaType<typeof noteSchema>;

noteSchema.plugin(paginate);

const noteCollection = model("notifications", noteSchema);

export {noteCollection, noteCollectionType};
