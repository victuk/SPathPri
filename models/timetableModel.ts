import mongoose, { InferSchemaType, PaginateModel, Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const timeTableSchema = new Schema({
    uploadedById: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    fileLink: {
        type: String,
        required: true
    }
},
{ timestamps: true });

type timeTableCollectionType = InferSchemaType<typeof timeTableSchema>;

timeTableSchema.plugin(paginate);

const timeTableCollection = mongoose.model<timeTableCollectionType, PaginateModel<timeTableCollectionType> & SoftDeleteModel<SoftDeleteDocument, timeTableCollectionType>>('timetables', timeTableSchema);

export { timeTableCollection, timeTableCollectionType };