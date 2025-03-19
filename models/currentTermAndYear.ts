import {Schema, InferSchemaType, model} from "mongoose";
import paginate from "mongoose-paginate-v2";

const currentTermAndYearSchema = new Schema({
    term: {
        type: String,
        default: ""
    },
    year: {
        type: String,
    }
}, {timestamps: true});

type currentTermAndYearModelType = InferSchemaType<typeof currentTermAndYearSchema>;

currentTermAndYearSchema.plugin(paginate);

const currentTermAndYearModel = model("currenttermandyear", currentTermAndYearSchema);

export {currentTermAndYearModel, currentTermAndYearModelType};
