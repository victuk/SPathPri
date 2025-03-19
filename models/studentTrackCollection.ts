import {Schema, InferSchemaType, model} from "mongoose";
import paginate from "mongoose-paginate-v2";

const trackSchema = new Schema({
    track: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
}, {timestamps: true});

type trackCollectionType = InferSchemaType<typeof trackSchema>;

trackSchema.plugin(paginate);

const trackCollection = model("tracks", trackSchema);

export {trackCollection, trackCollectionType};
