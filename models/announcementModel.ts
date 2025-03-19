import mongoose, { InferSchemaType, PaginateModel } from 'mongoose';
import { Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const announcementSchema = new Schema({
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    announcementTitle: {
        type: String,
        required: true
    },
    announcement: {
        type: String,
        required: true
    },
    showTill: {
        type: Date,
        default: null
    },
    announcementStatus: {
        type: String,
        enum: ["archived", "draft", "active"],
        default: "active"
    },
    audienceType: {
        type: Array,
        default: [],
    },
    schoolId: {
          type: Types.ObjectId,
          ref: "schoolprofile",
          required: true,
        }
},
{ timestamps: true });

type announcementCollectionType = InferSchemaType<typeof announcementSchema>;

announcementSchema.plugin(paginate);

const announcementCollection = mongoose.model<announcementCollectionType, PaginateModel<announcementCollectionType> & SoftDeleteModel<SoftDeleteDocument, announcementCollectionType>>('announcements', announcementSchema);

export { announcementCollection, announcementCollectionType };