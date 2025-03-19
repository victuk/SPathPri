import {Schema, InferSchemaType, model} from "mongoose";
import paginate from "mongoose-paginate-v2";

const NoteCategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryDescription: {
        type: String,
        required: true
    },
    teacherId: {
        type: String,
    }
}, {timestamps: true});

type noteCategoryCollectionType = InferSchemaType<typeof NoteCategorySchema>;

NoteCategorySchema.plugin(paginate);

const noteCategoryCollection = model("noteCategories",NoteCategorySchema);

export {noteCategoryCollection, noteCategoryCollectionType};
