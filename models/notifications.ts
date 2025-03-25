import {Schema, InferSchemaType, model, Types} from "mongoose";
import paginate from "mongoose-paginate-v2";

const notificationSchema = new Schema({
    audience: {
        type: Array, // could contain the user's role or the user's ID
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    readBy: {
        type: Array, // IDs of people that have read the notification
        required: true
    },
    notificationType: {
        type: String,
        enum: ["assessment-update-request", "assessment-update", "result-generation"],
        required: true
    },
    schoolId: {
          type: Types.ObjectId,
          ref: "schoolprofile",
          default: null,
        },
}, {timestamps: true});

type notificationCollectionType = InferSchemaType<typeof notificationSchema>;

notificationSchema.plugin(paginate);

const notificationCollection = model("notifications", notificationSchema);

export {notificationCollection, notificationCollectionType};
