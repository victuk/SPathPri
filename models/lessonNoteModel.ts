import mongoose, { InferSchemaType, PaginateModel, Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const lessonNoteSchema = new Schema({
    uploadedById: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    classId: {
        type: Types.ObjectId,
        ref: "schoolclasses",
        required: true
    },
    fileLink: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ["public", "private"],
        required: true
    },
},
{ timestamps: true });

type lessonNoteCollectionType = InferSchemaType<typeof lessonNoteSchema>;

lessonNoteSchema.plugin(paginate);

const lessonNoteCollection = mongoose.model<lessonNoteCollectionType, PaginateModel<lessonNoteCollectionType> & SoftDeleteModel<SoftDeleteDocument, lessonNoteCollectionType>>('lessonNotes', lessonNoteSchema);

export { lessonNoteCollection, lessonNoteCollectionType };